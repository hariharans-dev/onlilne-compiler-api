# Stage 1: Build Node.js application
FROM node:14 as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Stage 2: Build the final image with Python
FROM node:14

WORKDIR /usr/src/app

# Copy Node.js dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules

# Copy the rest of the application code
COPY --from=builder /usr/src/app /usr/src/app

# Install Python
RUN apt-get update && apt-get install -y python3

# Install only the C compiler
RUN sudo apt-get install build-essential

# Expose the application port
EXPOSE 3000

# Start the Node.js application
CMD ["npm", "start"]
