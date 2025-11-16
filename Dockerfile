# ----- Etapa 1: build -----
FROM node:18 AS build

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo manifiestos para aprovechar cache
COPY package*.json ./

# Instalar dependencias (rápido y reproducible si hay lockfile)
RUN npm ci || npm install

# Copiar el resto del código y construir
COPY . .
RUN npm run build

# ----- Etapa 2: Nginx para servir estáticos -----
FROM nginx:alpine

# (Opcional) Copiar una config que maneje rutas SPA y gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Para CRA: el build sale en /app/build
# Para Vite: CAMBIA /app/build por /app/dist
COPY --from=build /app/dist  /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
