#!/bin/sh
# Replace ${PORT} in Nginx config with the actual environment variable
envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start Nginx
nginx -g 'daemon off;'
