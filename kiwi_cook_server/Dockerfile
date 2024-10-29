# Use Python 3.11 slim image as the base for the builder stage
FROM python:3.11-slim-bullseye AS builder

# Set the working directory in the container
WORKDIR /code

# Install necessary dependencies and Poetry
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libffi-dev \
    build-essential \
    && curl -sSL https://install.python-poetry.org | python3 - \
    && ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# Copy only the files needed for installation
COPY pyproject.toml poetry.lock* /code/

# Install dependencies using Poetry, then clean up
RUN poetry config virtualenvs.create false \
    && poetry install --no-root --no-dev --no-interaction --no-ansi \
    && apt-get purge -y --auto-remove gcc libffi-dev build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /root/.cache/pip/*

# Start a new stage for the final image
FROM python:3.11-slim-bullseye

# Set the working directory in the container
WORKDIR /code

# Copy installed packages and necessary files from the builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY / /code

# Install only the absolutely necessary runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates netcat-openbsd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set Python unbuffered environment variable
ENV PYTHONUNBUFFERED=1
ENV ENV=production

# Create a non-root user and switch to it
RUN useradd -m kiwiuser
USER kiwiuser

# Expose port 8000
EXPOSE 8000

# Run the FastAPI app
CMD ["python", "main.py", "--server"]

