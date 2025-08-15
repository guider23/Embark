#!/bin/bash

# Build script for Netlify deployment
# This script replaces environment variable placeholders with actual values

echo "Starting build process..."

# Replace environment variables in config.js
if [ -f "config.js" ]; then
    echo "Replacing environment variables in config.js..."
    
    # Replace VITE_SUPABASE_URL
    if [ ! -z "$VITE_SUPABASE_URL" ]; then
        sed -i "s|\${VITE_SUPABASE_URL}|$VITE_SUPABASE_URL|g" config.js
    fi
    
    # Replace VITE_SUPABASE_ANON_KEY
    if [ ! -z "$VITE_SUPABASE_ANON_KEY" ]; then
        sed -i "s|\${VITE_SUPABASE_ANON_KEY}|$VITE_SUPABASE_ANON_KEY|g" config.js
    fi
    
    # Replace VITE_YOUTUBE_API_KEY
    if [ ! -z "$VITE_YOUTUBE_API_KEY" ]; then
        sed -i "s|\${VITE_YOUTUBE_API_KEY}|$VITE_YOUTUBE_API_KEY|g" config.js
    fi
    
    echo "Environment variables replaced successfully!"
else
    echo "config.js not found!"
fi

echo "Build process completed!"
