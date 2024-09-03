# Use the official slim Python image as a base image
FROM python:slim-bullseye

# Set the working directory in the container
WORKDIR /code

# Install necessary dependencies including build tools
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    libffi-dev \
    build-essential

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Ensure Poetry is available in the shell by linking it globally
RUN ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# Copy the pyproject.toml and poetry.lock files to the container
COPY pyproject.toml poetry.lock* /code/

# Install dependencies using Poetry
RUN poetry install --no-root --no-dev

# Copy the entire project to the container
COPY . /code/

# Expose port 80
EXPOSE 80

# Run the FastAPI app
CMD ["poetry", "run", "uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "80"]
