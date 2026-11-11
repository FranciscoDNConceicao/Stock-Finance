# ---- Build: compila a app React/Vite ----
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependências primeiro para aproveitar a cache de camadas
COPY finance-app-frontend/package.json finance-app-frontend/package-lock.json ./
RUN npm ci

COPY finance-app-frontend/ ./
RUN npm run build

# ---- Runtime: nginx serve os ficheiros estáticos ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
