# Hull — Fog Signal office TV dashboard.
# No build step: React 18 UMD + in-browser Babel. We just serve the static files.
FROM nginx:1.27-alpine

# App entry + sources
COPY app.html        /usr/share/nginx/html/app.html
COPY tweaks-panel.jsx /usr/share/nginx/html/tweaks-panel.jsx
COPY src/            /usr/share/nginx/html/src/
COPY assets/         /usr/share/nginx/html/assets/
COPY design-system/  /usr/share/nginx/html/design-system/

# Serve app.html at / and keep the kiosk from caching stale JSX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
