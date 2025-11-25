# ChandraHoro Backend - Multi-stage Docker Build
# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies for building
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Create wheels for all dependencies
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy wheels from builder
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

# Install Python dependencies from wheels
RUN pip install --no-cache /wheels/*

# Create non-root user for security
RUN useradd -m -u 1000 appuser

# Copy application code
COPY --chown=appuser:appuser . .

USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI application with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
