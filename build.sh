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

# Create a temporary file for sed operations to handle special characters safely
# Using @ as delimiter to avoid conflicts with URLs containing /
sed "s@SUPABASE_URL_PLACEHOLDER@$SUPABASE_URL@g" /usr/share/nginx/html/index.html > /tmp/index.html.tmp
sed "s@SUPABASE_ANON_KEY_PLACEHOLDER@$SUPABASE_ANON_KEY@g" /tmp/index.html.tmp > /usr/share/nginx/html/index.html
rm /tmp/index.html.tmp

echo "Build complete. Configuration injected successfully."
