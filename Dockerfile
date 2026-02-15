# Use Node.js to run the Express backend
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy backend server
COPY server.js ./

# Copy frontend static files
COPY public/ ./public/

# Expose port 8080 (Fly.io default)
EXPOSE 8080

# Start the Express server
CMD ["node", "server.js"]
