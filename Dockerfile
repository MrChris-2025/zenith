# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --if-present
RUN npm prune --production

# ==========================================
# 2. Production Stage
# ==========================================
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 8080

CMD ["npm", "start"]
