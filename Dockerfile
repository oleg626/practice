# Use nginx to serve static files
FROM nginx:alpine

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY main.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/

# Copy build script
COPY build.sh /build.sh
RUN chmod +x /build.sh

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Fly.io default)
EXPOSE 8080

# Use a startup script to inject environment variables and start nginx
CMD ["/bin/sh", "-c", "/build.sh && nginx -g 'daemon off;'"]
