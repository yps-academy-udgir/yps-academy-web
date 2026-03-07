# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
ARG BUILD_CONFIG=production
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:${BUILD_CONFIG}

# ---- Serve stage ----
FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
