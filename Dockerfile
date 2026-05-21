# Stage 1: Build the Vite application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies for Vite build)
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

# Install tsx globally in the container to run TypeScript server
RUN npm install -g tsx

# Copy the build output from the first stage
COPY --from=build /app/dist ./dist

# Copy server code
COPY --from=build /app/server.ts ./

# Expose the port that Cloud Run expects (8080)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Start the Express server
CMD ["tsx", "server.ts"]
