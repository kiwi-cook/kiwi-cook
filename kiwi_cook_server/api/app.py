import os
import uuid
from enum import Enum
from typing import Final

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from api.security import initialize_security_measures
from lib.logging import logger
from models.api import APIResponse

# Load environment variables at startup
load_dotenv()


class Environment(str, Enum):
    DEVELOPMENT = "development"
    PRODUCTION = "production"


class AppConfig:
    """Application configuration container"""
    VERSION: Final[str] = "0.3.0"
    TITLE: Final[str] = "KiwiCook API"

    def __init__(self):
        self.env = self._get_environment()
        self.port = int(os.getenv("PORT", "8000"))

    @property
    def is_development(self) -> bool:
        return self.env == Environment.DEVELOPMENT

    def _get_environment(self) -> Environment:
        env = os.getenv("ENV", "production").lower()
        try:
            return Environment(env)
        except ValueError:
            raise ValueError(f"Invalid environment: {env}")


class APIServer:
    def __init__(self):
        self.config = AppConfig()
        self.app = self._create_app()
        self._setup_middleware()
        self._setup_routes()
        self._setup_exception_handlers()
        self._setup_instrumentation()
        self._verify_database()

    def _create_app(self) -> FastAPI:
        """Initialize FastAPI application with configuration"""
        logger.info(f"Setting up FastAPI for {self.config.env} mode...")
        return FastAPI(
            title=AppConfig.TITLE,
            description="",
            version=AppConfig.VERSION,
            docs_url="/docs" if self.config.is_development else None,
            redoc_url=None,
            openapi_url="/openapi.json" if self.config.is_development else None,
        )

    def _setup_middleware(self) -> None:
        """Configure middleware components"""
        initialize_security_measures(self.app)

        @self.app.middleware("http")
        async def log_request_headers(request: Request, call_next):
            headers = {k: v for k, v in request.headers.items()
                       if k.lower() != "authorization"}
            logger.info(f"Request headers (filtered): {headers}")
            return await call_next(request)

    def _setup_routes(self) -> None:
        """Configure API routes"""
        from api.routers import chatgpt, recipe

        # Include routers
        for router in (recipe.router, chatgpt.router):
            self.app.include_router(router)

        @self.app.get("/",
                      response_model=APIResponse[str],
                      response_model_by_alias=False,
                      response_model_exclude_none=True)
        def read_root():
            """Root endpoint"""
            return {"error": False, "response": "Welcome to KiwiCook!"}

        @self.app.get("/health",
                      response_model=APIResponse[str])
        def health_check():
            """Health check endpoint"""
            return JSONResponse(
                content={"error": False, "response": "OK"},
                status_code=200
            )

    def _setup_exception_handlers(self) -> None:
        """Configure global exception handling"""

        @self.app.exception_handler(Exception)
        async def global_exception_handler(request: Request, exc: Exception):
            logger.error(f"Unhandled exception: {exc}", exc_info=True)

            if not self.config.is_development:
                logger.send_logs()

            return JSONResponse(
                status_code=500,
                content={
                    "error": True,
                    "message": "Internal Server Error",
                    "request_id": str(uuid.uuid4())
                }
            )

    def _setup_instrumentation(self) -> None:
        """Configure OpenTelemetry instrumentation"""
        FastAPIInstrumentor.instrument_app(self.app)

    def _verify_database(self) -> None:
        """Verify database connection"""
        try:
            from lib.database.mongodb import get_mongodb
            get_mongodb()
        except Exception as e:
            logger.error(e)
            raise

    def start(self) -> None:
        """Start the API server"""
        logger.info(f"Starting server in {self.config.env} mode...")
        uvicorn.run(
            "api.app:app",
            host="0.0.0.0",
            port=self.config.port,
            reload=self.config.is_development,
            workers=1 if self.config.is_development else None,
            log_level="info",
        )


app = APIServer().app
