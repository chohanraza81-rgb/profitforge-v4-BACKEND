# Use Node.js 18 Alpine (lightweight)
FROM node:18-alpine

# Install build tools (required for native modules like bcrypt, sharp, etc.)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Check if package-lock.json exists; use npm ci if available, else npm install --production
RUN if [ -f package-lock.json ]; then \
        npm ci --only=production --no-audit --no-fund; \
    else \
        npm install --only=production --no-audit --no-fund; \
    fi

# Copy the rest of the application source
COPY . .

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "src/server.js"]
