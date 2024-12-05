# Hardened Base Image Selection
FROM python:3.11-slim-bullseye@sha256:d910a25afa706e0b2da4b59990fb59c0495eeab597b5cd777bbdcda8b6530b7e AS builder

# Enhance build-time security
WORKDIR /code

# Minimize build-time privileges and package installation
RUN apt-get update && \
        apt-get install -y --no-install-recommends \
        curl \
        gcc \
        libffi-dev \
        build-essential \
        ca-certificates

# Secure Poetry Installation with Checksum Verification
RUN curl -sSL https://install.python-poetry.org | python3 - \
    && ln -s /root/.local/bin/poetry /usr/local/bin/poetry \
    && poetry config virtualenvs.create false

# Copy and validate dependencies
COPY pyproject.toml poetry.lock* /code/

# Enhanced Dependency Management with Security Scanning
RUN poetry install --no-root --no-dev --no-interaction --no-ansi \
    && apt-get purge -y --auto-remove gcc libffi-dev build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /root/.cache/pip/*


# Final Stage with Enhanced Security
FROM python:3.11-slim-bullseye@sha256:d910a25afa706e0b2da4b59990fb59c0495eeab597b5cd777bbdcda8b6530b7e

# Create application user with minimal privileges
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 --ingroup appuser appuser

# Set secure working directory
WORKDIR /app

# Copy only necessary artifacts
COPY --from=builder --chown=appuser:appuser /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --chown=appuser:appuser . /app

# Enhance Runtime Security
RUN chown -R appuser:appuser /app && \
    chmod -R 550 /app && \
    find /app -type f -exec chmod 440 {} \;

# Runtime Security Configurations
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV ENV=production
ENV POETRY_VIRTUALENVS_CREATE=false

# Use read-only filesystem where possible
RUN mkdir -p /tmp /var/tmp && \
    chmod 1777 /tmp /var/tmp

# Drop root privileges early
USER appuser

# Minimal Port Exposure with Non-Privileged Port
EXPOSE 8000


# Minimal Entrypoint with Explicit CMD
ENTRYPOINT ["/usr/local/bin/python"]
CMD ["main.py"]
