# Stage 1: Build Node.js application
FROM node:14 as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Stage 2: Build the final image with Python and GCC 12.1
FROM debian:sid

WORKDIR /usr/src/app

# Copy Node.js dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules

# Copy the rest of the application code
COPY --from=builder /usr/src/app /usr/src/app

# Install Python
RUN apt-get update && \
    apt-get install -y python3

# Install GCC 12.1 from the official GCC releases
RUN apt-get install -y wget && \
    wget https://ftp.gnu.org/gnu/gcc/gcc-12.1.0/gcc-12.1.0.tar.gz && \
    tar xf gcc-12.1.0.tar.gz && \
    cd gcc-12.1.0 && \
    ./configure && \
    make && \
    make install && \
    cd .. && \
    rm -rf gcc-12.1.0 gcc-12.1.0.tar.gz && \
    apt-get purge -y wget && \
    apt-get autoremove -y

# Expose the application port
EXPOSE 3000

# Start the Node.js application
CMD ["npm", "start"]
