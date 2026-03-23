#!/bin/sh
set -e

#envsubst '${VITE_PANOPTES_URL} ${VITE_PANOPTES_IS_EMBEDDED} ${VITE_PANOPTES_SEARCH_PATH} ${VITE_PANOPTES_DETAIL_PATH} ${VITE_PANOPTES_DATASET}' \
#  < /usr/share/nginx/html/index.html > /tmp/index.html && mv /tmp/index.html /usr/share/nginx/html/index.html

for f in /usr/share/nginx/html/assets/*.js; do
  envsubst '${VITE_PANOPTES_URL} ${VITE_PANOPTES_IS_EMBEDDED} ${VITE_PANOPTES_SEARCH_PATH} ${VITE_PANOPTES_DETAIL_PATH} ${VITE_PANOPTES_DATASET}' \
    < "$f" > /tmp/env_sub && mv /tmp/env_sub "$f"
done

exec nginx -g "daemon off;"
