FROM node:18

WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Add this line to copy the pythonfile directory
COPY pythonfile /usr/src/app/pythonfile

# Install Python and required dependencies
RUN apt-get update && \
    apt-get install -y python3 && \
    rm -rf /var/lib/apt/lists/*

# Expose the application port
EXPOSE 3000

# Command to run your application
CMD [ "node", "app.js" ]
