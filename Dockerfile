# ---------- Build (Vite/React) ----------
FROM node:20-alpine AS build
WORKDIR /app

# Instala deps primero (mejor cache)
COPY package*.json ./
RUN npm install

# Copia el resto y construye
COPY . .
RUN npm run build

# ---------- Run (Nginx) ----------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# (Opcional) SPA fallback para React Router
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]