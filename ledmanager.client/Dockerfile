# Dockerfile for Vite + React + TypeScript + Tailwind + Antd
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN npm install

COPY . .

RUN npm run build

# Production image
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist .
COPY --from=builder /app/public ./public 

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
