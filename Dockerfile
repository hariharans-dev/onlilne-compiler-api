FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy Python files
COPY pythonfile/ /usr/src/app/pythonfile/

# Install Python
RUN apt-get update && apt-get install -y python3

# Expose the application port
EXPOSE 3000

# Start the Node.js application
CMD ["npm", "start"]
