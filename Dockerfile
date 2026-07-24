# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run build step if a build script exists
RUN npm run build --if-present

# Prune dev dependencies to keep the image lightweight
RUN npm prune --production

# ==========================================
# 2. Production Stage
# ==========================================
FROM node:20-alpine AS runner

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

# Copy built application and node_modules from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

# Expose the application port
EXPOSE 8080

# Command to start the server
CMD ["npm", "start"]
