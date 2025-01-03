# Use a lightweight Node.js image
FROM node:latest

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip


# Set the working directory
WORKDIR /app

# Copy package.json and install Node.js dependencies
COPY package.json ./
RUN npm install

# Copy requirements.txt and install Python dependencies
COPY requirements.txt ./
RUN pip3 install -r requirements.txt

# Install dependencies with clean cache
RUN npm install --production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
