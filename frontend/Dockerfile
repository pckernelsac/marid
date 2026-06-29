# ── Madrid Dental Studio · Frontend (Vite build → nginx) ──────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install deps against the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Runtime: static assets served by nginx (also reverse-proxies the API)
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/* \
    && rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Usa 127.0.0.1 (NO "localhost"): en Alpine localhost resuelve a ::1 (IPv6) y
# nginx escucha solo en IPv4 → el healthcheck fallaría (unhealthy) y Traefik
# descartaría el contenedor del router (= 404).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1
