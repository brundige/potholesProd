# Use a lightweight Node.js image
FROM node:latest

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

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
CMD ["npm", "start"]