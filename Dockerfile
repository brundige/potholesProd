# Use the official NVIDIA CUDA base image
FROM nvidia/cuda:12.6.2-devel-ubuntu22.04

CMD ["nvidia-smi"]

# Install the latest version of Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_current.x | bash - && \
    apt-get install -y nodejs

# Install the latest version of Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \
    ln -s /usr/bin/python3 /usr/bin/python

# Install dependencies for OpenCV
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 libsm6 libxrender1 libxext6

# Set the working directory
WORKDIR /app

# Create a virtual environment
RUN python3 -m venv /app/venv

# Activate the virtual environment and install Python dependencies
COPY requirements.txt ./
RUN /app/venv/bin/pip install -r requirements.txt

# Copy package.json and install Node.js dependencies
COPY package.json ./
RUN npm install

# Install dependencies with clean cache
RUN npm install --production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["/bin/bash", "-c", "source /app/venv/bin/activate && npm start"]