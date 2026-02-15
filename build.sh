#!/bin/sh

# Build script for Fly.io deployment
# This script injects environment variables into the HTML file

echo "Building application for Fly.io deployment..."

# Check if environment variables are set
if [ -z "$SUPABASE_URL" ]; then
    echo "Error: SUPABASE_URL environment variable is not set"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "Error: SUPABASE_ANON_KEY environment variable is not set"
    exit 1
fi

# Replace placeholders in index.html
sed -i "s|SUPABASE_URL_PLACEHOLDER|$SUPABASE_URL|g" /usr/share/nginx/html/index.html
sed -i "s|SUPABASE_ANON_KEY_PLACEHOLDER|$SUPABASE_ANON_KEY|g" /usr/share/nginx/html/index.html

echo "Build complete. Configuration injected successfully."
