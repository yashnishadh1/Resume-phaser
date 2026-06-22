# Use a pinned SHA256 digest for python:3.12-slim
FROM python:3.12-slim@sha256:d55cd3841bc6a3c00494be41203b55ab402519be9a1de81177651a5ddba1c676

# Create a non-root user
RUN useradd -m -r -s /bin/bash appuser

# Install system dependencies for Tesseract, PostgreSQL, and basic compilation
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
# Optionally use requirements.lock if we are strictly locking via pip-tools
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy application code and set ownership
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
