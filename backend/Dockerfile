# Use an official lightweight Python image
FROM python:3.10-slim

# Set environment variables to prevent Python from writing .pyc files
# and to ensure stdout/stderr are unbuffered
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

# Create a working directory
WORKDIR /app

# Install system dependencies required by EasyOCR and PyTorch
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install them
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create necessary folders
RUN mkdir -p uploads ela_outputs local_model

# Copy the entire backend directory into the container
COPY . /app/

# Expose the Hugging Face Spaces default port
EXPOSE 7860

# Command to run the application using Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--timeout", "120", "app:app"]
