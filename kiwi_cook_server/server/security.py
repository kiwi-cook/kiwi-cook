import os
import re
import uuid
from typing import Dict, List, Optional

import redis
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from lib.database.redis import get_redis
from lib.logging import logger


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

        # Continue with the request
        return await call_next(request)


class EnhancedSecurityMiddleware(BaseHTTPMiddleware):
    """Comprehensive security middleware with advanced protection mechanisms."""

    def __init__(self, app, disable_security_header: bool = False):
        super().__init__(app)
        self.disable_security_header = disable_security_header

    SECURITY_HEADERS: Dict[str, str] = {
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Content-Security-Policy": (
            "default-src 'none'; "
            "script-src 'self' 'nonce-{nonce}'; "
            "style-src 'self' 'nonce-{nonce}'; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "font-src 'self'; "
            "base-uri 'self'; "
            "form-action 'self'"
        ),
        "X-Permitted-Cross-Domain-Policies": "none",
        "X-XSS-Protection": "1; mode=block",
        "Server": "Undisclosed",
    }

    # Preload the Lua script for rate limiting
    REDIS_RATE_LIMIT_SCRIPT = """
    local v = redis.call('INCR', KEYS[1])
    if v == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    if v > tonumber(ARGV[2]) then
        return 1
    else
        return 0
    end
    """

    class RateLimiter:
        def __init__(self, redis_client: redis.Redis):
            self.redis = redis_client
            self.script_sha = self.redis.script_load(
                EnhancedSecurityMiddleware.REDIS_RATE_LIMIT_SCRIPT
            )

        async def rate_limit(self, key: str, limit: str, expiration_time: str):
            try:
                # Execute the preloaded Lua script
                result = self.redis.evalsha(
                    self.script_sha,
                    1,  # Number of keys
                    key,  # The key
                    expiration_time,  # TTL for the key
                    limit,  # Rate limit threshold
                )
                return result == 1  # True if the limit is exceeded
            except redis.exceptions.NoScriptError:
                # Reload the script if it has been evicted
                self.script_sha = self.redis.script_load(
                    EnhancedSecurityMiddleware.REDIS_RATE_LIMIT_SCRIPT
                )
                return await self.rate_limit(key, limit, expiration_time)

    async def dispatch(self, request: Request, call_next):
        # Generate a unique nonce for CSP
        nonce = uuid.uuid4().hex

        # Disable security headers for development
        if self.disable_security_header:
            return await call_next(request)

        try:
            # Advanced request validation
            await self._validate_request(request)

            # Process request
            response: Response = await call_next(request)

            if self.disable_security_header:
                return response

            # Apply security headers with dynamic nonce
            for header, value in self.SECURITY_HEADERS.items():
                response.headers[header] = value.format(nonce=nonce)

            # Add additional security measures
            response.headers["X-Request-ID"] = str(uuid.uuid4())

            return response

        except HTTPException as http_exc:
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

    async def _validate_request(self, request: Request):
        """Advanced request validation."""
        # Retrieve client IP, considering X-Forwarded-For header
        client_ip = self._get_client_ip(request)

        # Block suspicious user agents
        user_agent = request.headers.get("User-Agent", "")
        if self._is_suspicious_user_agent(user_agent):
            raise HTTPException(status_code=403, detail="Access denied")

        # Rate limiting logic
        await self._rate_limit_ip(request, client_ip)

    def _get_client_ip(self, request: Request) -> str:
        """
        Retrieve the client IP address, considering proxy scenarios.
        Prioritizes X-Forwarded-For header, falls back to request client host.
        """
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the X-Forwarded-For header
            return forwarded_for.split(",")[0].strip()
        return request.client.host

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

    async def _rate_limit_ip(self, request: Request, client_ip: str):
        """Rate limiting by IP address with high performance."""
        redis = get_redis()
        limiter = self.RateLimiter(redis)

        key = f"rate_limit:{client_ip}"
        limit = 100  # 100 requests per minute
        expiration_time = 60  # 1 minute

        # Check rate limit
        if await limiter.rate_limit(key, str(limit), str(expiration_time)):
            # Log suspicious activity
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(status_code=429, detail="Too many requests")


def setup_cors_with_enhanced_security(app: FastAPI) -> None:
    """Implement strict CORS with advanced validation."""
    if os.getenv("ENV", "production").lower() == "production":
        ALLOWED_ORIGINS: List[str] = [
            "https://kiwi-cook.github.io",
            "https://kiwi.jpkmiller.de",
            "https://taste-buddy.uk",
        ]
    else:
        ALLOWED_ORIGINS = ["*"]

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
    # Conditional HTTPS enforcement with proxy awareness
    is_production = os.getenv("ENV", "production").lower() == "production"
    trusted_proxy_ips = os.getenv("TRUSTED_PROXY_IPS", "").split(",")
    trusted_proxy_ips = [ip.strip() for ip in trusted_proxy_ips if ip.strip()]
    app.add_middleware(
        ProxyAwareHTTPSRedirectMiddleware,
        enforce_https=is_production,
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
        EnhancedSecurityMiddleware, disable_security_header=not is_production
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
    ]

    for var in REQUIRED_ENV_VARS:
        if not os.getenv(var):
            raise ValueError(f"Missing critical security environment variable: {var}")


def initialize_security_measures(app: FastAPI):
    """Recommended Security Initialization Workflow"""
    validate_environment_config()
    setup_advanced_security(app)
    setup_cors_with_enhanced_security(app)
