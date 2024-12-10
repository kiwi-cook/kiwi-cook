import os
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from lib.telemetry.exporter import service_tracer

tracer = service_tracer


def setup_cors_with_enhanced_security(app: FastAPI) -> None:
    """Implement strict CORS with advanced validation."""
    if os.getenv("ENV", "production").lower() == "production":
        ALLOWED_ORIGINS: List[str] = [
            "https://kiwi-cook.github.io",
            "https://kiwi.jpkmiller.de",
            "https://taste-buddy.uk",
            "https://kiwi.taste-buddy.uk",
        ]
    else:
        ALLOWED_ORIGINS = ["http://localhost:9000"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Origin",
            "Accept",
            "X-Requested-With",
            "X-Forwarded-For",
            "X-Forwarded-Proto",
        ],
        expose_headers=["Content-Type"],
        max_age=86400,
    )


def setup_advanced_security(app: FastAPI) -> None:
    """Comprehensive security setup."""
    # HTTPS Redirect Middleware with Proxy Support
    is_production = os.getenv("ENV", "production").lower() == "production"

    # Trusted Host Middleware with strict validation
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "taste-buddy.uk",
            "*.taste-buddy.uk",
            "*.jpkmiller.de",
            "kiwi-cook:8000",
            "localhost",
            "localhost:8000",
            "127.0.0.1",
            "127.0.0.1:8000",
            "0.0.0.0",
            "0.0.0.0:8000",
        ],
    )


def validate_environment_config():
    """Validate critical security configurations."""
    REQUIRED_ENV_VARS = [
        "ENV",
        "MONGO_URI_READ",
        "MONGO_URI_WRITE",
        "AXIOM_API_KEY",
    ]

    for var in REQUIRED_ENV_VARS:
        if not os.getenv(var):
            raise ValueError(f"Missing critical security environment variable: {var}")


def initialize_security_measures(app: FastAPI):
    """Recommended Security Initialization Workflow"""
    validate_environment_config()
    setup_advanced_security(app)
    setup_cors_with_enhanced_security(app)
