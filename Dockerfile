# Stage 1: Build the Vite application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Node/Express
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the build output from the first stage
COPY --from=build /app/dist ./dist

# Copy native server code (no tsx or tsc compilation needed in production)
COPY --from=build /app/server.js ./

# Expose the port that Cloud Run expects (8080)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Start the Express server natively
CMD ["node", "server.js"]
