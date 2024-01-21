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

# Install Python and C compiler
RUN apt-get update && \
    apt-get install -y python3 && \
    apt-get install -y wget unzip

# Use a base image with a Linux distribution
FROM debian:bullseye-slim

# Download and install MSYS2 GCC 12.1.0
WORKDIR /tmp
RUN wget https://github.com/msys2/msys2-installer/releases/download/2022-03-01/msys2-base-x86_64-2022-03-01.sfx.exe && \
    chmod +x msys2-base-x86_64-2022-03-01.sfx.exe && \
    ./msys2-base-x86_64-2022-03-01.sfx.exe -o -d / && \
    rm msys2-base-x86_64-2022-03-01.sfx.exe && \
    pacman -Sy --noconfirm && \
    pacman -S --noconfirm mingw-w64-x86_64-gcc

# Clean up
RUN apt-get remove -y wget unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set the working directory
WORKDIR /app

# Expose the application port
EXPOSE 3000

# Start the Node.js application
CMD ["npm", "start"]
