import os
import uuid
from typing import List

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from lib.logging import logger
from lib.telemetry.exporter import service_tracer

tracer = service_tracer


class ProxyAwareHTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """
    Custom HTTPS redirect middleware that robustly handles
    X-Forwarded-Proto header in proxy environments.
    """

    def __init__(self, app, enforce_https: bool = True, trusted_proxy_ips: list = None):
        super().__init__(app)
        self.enforce_https = enforce_https
        self.trusted_proxy_ips = trusted_proxy_ips or []

    def _is_trusted_proxy(self, request: Request) -> bool:
        """
        Check if the request comes from a trusted proxy IP.
        """
        # Get client IP from X-Forwarded-For or request source
        client_ip = self._get_client_ip(request)
        return client_ip in self.trusted_proxy_ips

    def _get_client_ip(self, request: Request) -> str:
        """
        Retrieve the client IP address.
        Prioritizes X-Forwarded-For header, falls back to request client host.
        """
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the X-Forwarded-For header
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next):
        """
        Dispatch method to handle HTTPS redirection.
        """
        # Determine the protocol
        forwarded_proto = request.headers.get("X-Forwarded-Proto", "").lower()

        # If enforcing HTTPS and not already secure
        if self.enforce_https and forwarded_proto != "https":
            try:
                # Construct HTTPS URL
                https_url = str(request.url).replace("http://", "https://")
                return JSONResponse(
                    status_code=301,  # Permanent Redirect
                    content={"detail": "SSL Required"},
                    headers={"Location": https_url},
                )
            except Exception as e:
                # Log the error (consider using a proper logging mechanism)
                print(f"HTTPS Redirect Error: {e}")
                # Allow the request to proceed if redirect fails
                pass

        # Check if the request comes from a trusted proxy
        if self._is_trusted_proxy(request):
            # Continue with the request
            return await call_next(request)

        # If the request is not from a trusted proxy, deny access
        return JSONResponse(
            status_code=403,  # Forbidden
            content={"detail": "Access denied"},
        )


class EnhancedSecurityMiddleware(BaseHTTPMiddleware):
    """Comprehensive security middleware with advanced protection mechanisms."""

    def __init__(self, app, disable_security_header: bool = False):
        super().__init__(app)
        self.disable_security_header = disable_security_header

    SECURITY_HEADERS = {
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Content-Security-Policy": (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "font-src 'self'; "
            "base-uri 'self'; "
            "form-action 'self'"
        ),
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Resource-Policy": "same-origin"
    }

    async def dispatch(self, request: Request, call_next):
        with tracer.start_span("security_middleware") as span:
            # Generate a unique nonce for CSP
            nonce = uuid.uuid4().hex

            try:
                # Advanced request validation
                await self._validate_request(request, span=span)

                # Process request
                response: Response = await call_next(request)

                # Apply security headers with dynamic nonce
                for header, value in self.SECURITY_HEADERS.items():
                    response.headers[header] = value.format(nonce=nonce)

                # Add additional security measures
                response.headers["X-Request-ID"] = str(uuid.uuid4())

                return response

            except HTTPException as http_exc:
                span.set_status(http_exc.status_code)
                span.set_attribute("error", True)
                span.set_attribute("message", http_exc.detail)

                # Handle specific HTTP exceptions
                return JSONResponse(
                    status_code=http_exc.status_code,
                    content={
                        "error": True,
                        "message": http_exc.detail,
                        "request_id": str(uuid.uuid4()),
                    },
                )
            except Exception as exc:
                span.set_status(500)
                span.set_attribute("error", True)
                span.set_attribute("message", exc)

                # Catch-all for unexpected errors
                logger.error(f"Unhandled security exception: {exc}", exc_info=True)
                return JSONResponse(
                    status_code=500,
                    content={
                        "error": True,
                        "message": "Security validation failed",
                        "request_id": str(uuid.uuid4()),
                    },
                )

    async def _validate_request(self, request: Request, span=None):
        """Advanced request validation."""
        IGNORED_PATHS = ["/health", "/metrics"]
        # Block suspicious user agents
        user_agent = request.headers.get("User-Agent", "")
        if self._is_suspicious_user_agent(user_agent) and request.url.path not in IGNORED_PATHS:
            logger.warning(f"Suspicious user agent detected: {user_agent}")
            span.set_attribute("suspicious_user_agent", user_agent)
            raise HTTPException(status_code=403, detail="Access denied")

    def _is_suspicious_user_agent(self, user_agent: str) -> bool:
        """Detect potentially malicious user agents."""
        suspicious_patterns = [
            "sqlmap",
            "nikto",
            "dirbuster",
            "gobuster",
            "hydra",
            "nmap",
            "wget",
            "curl",
        ]
        return any(pattern in user_agent.lower() for pattern in suspicious_patterns)


def setup_cors_with_enhanced_security(app: FastAPI) -> None:
    """Implement strict CORS with advanced validation."""
    if os.getenv("ENV", "production").lower() == "production":
        ALLOWED_ORIGINS: List[str] = [
            "https://kiwi-cook.github.io",
            "https://kiwi.jpkmiller.de",
            "https://taste-buddy.uk",
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
    if is_production:
        trusted_proxy_ips = os.getenv("TRUSTED_PROXY_IPS", "").split(",")
        trusted_proxy_ips = [ip.strip() for ip in trusted_proxy_ips if ip.strip()]
        app.add_middleware(
            ProxyAwareHTTPSRedirectMiddleware,
            enforce_https=True,
            trusted_proxy_ips=trusted_proxy_ips,
        )

    # Trusted Host Middleware with strict validation
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "taste-buddy.uk",
            "*.taste-buddy.uk",
            "kiwi-cook:8000",
            "localhost",
            "localhost:8000",
            "127.0.0.1",
            "127.0.0.1:8000",
            "0.0.0.0",
            "0.0.0.0:8000",
        ],
    )

    # Enhanced Security Middleware
    app.add_middleware(
        EnhancedSecurityMiddleware,
    )


def validate_environment_config():
    """Validate critical security configurations."""
    REQUIRED_ENV_VARS = [
        "ENV",
        "MONGO_URI_READ",
        "MONGO_URI_WRITE",
        "REDIS_HOST",
        "REDIS_PORT",
        "FUSIONAUTH_BASE_URL",
        "FUSIONAUTH_API_KEY",
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
