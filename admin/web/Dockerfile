# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept optional build-time args for Vite envs
ARG VITE_API_BASE_URL
ARG VITE_STATIC_BASE_URL
ARG VITE_ADMIN_API_KEY
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_STATIC_BASE_URL=${VITE_STATIC_BASE_URL}
ENV VITE_ADMIN_API_KEY=${VITE_ADMIN_API_KEY}

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
RUN npm run build

# Runtime stage (Nginx static)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]