import os
import re
import uuid
from typing import Dict

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


class EnhancedSecurityMiddleware(BaseHTTPMiddleware):
    """Comprehensive security middleware with advanced protection mechanisms."""

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
        "X-XSS-Protection": "1; mode=block",
        "Server": "Undisclosed"
    }

    async def dispatch(self, request: Request, call_next):
        # Generate a unique nonce for CSP
        nonce = uuid.uuid4().hex

        try:
            # Advanced request validation
            await self._validate_request(request)

            # Process request
            response: Response = await call_next(request)

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
                    "request_id": str(uuid.uuid4())
                }
            )
        except Exception as exc:
            # Catch-all for unexpected errors
            logger.error(f"Unhandled security exception: {exc}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "error": True,
                    "message": "Security validation failed",
                    "request_id": str(uuid.uuid4())
                }
            )

    async def _validate_request(self, request: Request):
        """Advanced request validation."""
        # Block suspicious user agents
        user_agent = request.headers.get('User-Agent', '')
        if self._is_suspicious_user_agent(user_agent):
            raise HTTPException(status_code=403, detail="Access denied")

        # Rate limiting logic (placeholder - implement with Redis)
        await self._rate_limit_ip(request)

        # Additional custom validation can be added here

    def _is_suspicious_user_agent(self, user_agent: str) -> bool:
        """Detect potentially malicious user agents."""
        suspicious_patterns = [
            "sqlmap", "nikto", "dirbuster", "gobuster",
            "hydra", "nmap", "wget", "curl"
        ]
        return any(pattern in user_agent.lower() for pattern in suspicious_patterns)

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
            self.script_sha = self.redis.script_load(EnhancedSecurityMiddleware.REDIS_RATE_LIMIT_SCRIPT)

        async def rate_limit(self, key: str, limit: str, expiration_time: str):
            try:
                # Execute the preloaded Lua script
                result = self.redis.evalsha(
                    self.script_sha,
                    1,  # Number of keys
                    key,  # The key
                    expiration_time,  # TTL for the key
                    limit  # Rate limit threshold
                )
                return result == 1  # True if the limit is exceeded
            except redis.exceptions.NoScriptError:
                # Reload the script if it has been evicted
                self.script_sha = self.redis.script_load(EnhancedSecurityMiddleware.REDIS_RATE_LIMIT_SCRIPT)
                return await self.rate_limit(key, limit, expiration_time)

    async def _rate_limit_ip(self, request: Request):
        """Rate limiting by IP address with high performance."""
        redis = get_redis()
        limiter = EnhancedSecurityMiddleware.RateLimiter(redis)

        ip_address = request.client.host
        key = f"rate_limit:{ip_address}"
        limit = 100  # 100 requests per minute
        expiration_time = 60  # 1 minute

        # Check rate limit
        if await limiter.rate_limit(key, str(limit), str(expiration_time)):
            # Log suspicious activity
            logger.warning(f"Rate limit exceeded for IP: {ip_address}")
            raise HTTPException(status_code=429, detail="Too many requests")


def setup_cors_with_enhanced_security(app: FastAPI) -> None:
    """Implement strict CORS with advanced validation."""
    ALLOWED_ORIGINS = [
        "https://kiwi-cook.github.io",
        "https://kiwi.jpkmiller.de",
        "https://taste-buddy.uk"
    ]

    def validate_origin(origin: str) -> bool:
        """Strict origin validation."""
        return any(
            re.match(f"^https://({re.escape(allowed_origin.split('//')[1])})", origin)
            for allowed_origin in ALLOWED_ORIGINS
        )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=[
            "Authorization", "Content-Type", "X-Requested-With"
        ],
        max_age=86400  # 24-hour preflight cache
    )


def setup_advanced_security(app: FastAPI) -> None:
    """Comprehensive security setup."""
    # Conditional HTTPS enforcement
    if os.getenv("ENV", "production").lower() == "production":
        app.add_middleware(HTTPSRedirectMiddleware)

    # Trusted Host Middleware with strict validation
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "kiwi-cook.uk",
            "taste-buddy.uk",
            "*.taste-buddy.uk",
            "localhost"
        ]
    )

    # Enhanced Security Middleware
    app.add_middleware(EnhancedSecurityMiddleware)


# Example security configuration
def validate_environment_config():
    """Validate critical security configurations."""
    REQUIRED_ENV_VARS = [
        "MONGO_URI_READ",
        "MONGO_URI_WRITE",
        "SECRET_JWT_KEY",
        "REDIS_HOST",
        "REDIS_PORT",
        "ENV"
    ]

    for var in REQUIRED_ENV_VARS:
        if not os.getenv(var):
            raise ValueError(f"Missing critical security environment variable: {var}")


# Recommended Security Initialization
def initialize_security_measures(app: FastAPI):
    validate_environment_config()
    setup_advanced_security(app)
    setup_cors_with_enhanced_security(app)
