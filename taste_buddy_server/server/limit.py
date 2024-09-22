from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.responses import JSONResponse

limiter = Limiter(key_func=get_remote_address)


def rate_limit_exceeded_handler(request, exc):
    response = JSONResponse(
        {
            "error": True,
            "response": "Rate limit exceeded. Too many requests. Please try again later.",
        }
    )
    # From slowapi
    response = request.app.state.limiter._inject_headers(
        response, request.state.view_rate_limit
    )
    return response
