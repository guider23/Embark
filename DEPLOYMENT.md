# Embark - Netlify Deployment Guide

## Environment Variables Setup

To deploy this site to Netlify with proper API key protection, you need to set up environment variables in your Netlify dashboard.

### Required Environment Variables

1. **VITE_SUPABASE_URL**: Your Supabase project URL
2. **VITE_SUPABASE_ANON_KEY**: Your Supabase anonymous key  
3. **VITE_YOUTUBE_API_KEY**: Your YouTube Data API v3 key

### Setting Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add the following variables:

```
VITE_SUPABASE_URL = https://dlveprsuwfbqqshlvgig.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdmVwcnN1d2ZicXFzaGx2Z2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTE5NTksImV4cCI6MjA2NTk4Nzk1OX0.p6uFAH3mXgr18JwVXetO2oiAnYa8Gu6YVHj4_uTulJQ
VITE_YOUTUBE_API_KEY = AIzaSyCYk-HJnkIzjp42on-u1MCVA_wgKDfv_fA
```

### Deployment Process

1. **Automatic Build**: The `build.sh` script will automatically replace placeholders with your environment variables
2. **Static Files**: All files will be served as static content
3. **API Protection**: Your API keys will be injected at build time, not exposed in source code

### Local Development

For local development, the fallback values in `config.js` will be used. You can also create a `.env.local` file:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### File Structure

- `config.js` - Configuration file with environment variable placeholders
- `build.sh` - Build script that replaces placeholders with actual values
- `netlify.toml` - Netlify configuration file
- `.env.example` - Example environment variables file

### Security Notes

1. **Supabase Anon Key**: This is safe to expose in client-side code as it only allows public operations
2. **YouTube API Key**: Restrict this key to your domain in Google Cloud Console
3. **Environment Variables**: Never commit actual API keys to source control

### Troubleshooting

If APIs don't work after deployment:

1. Check that environment variables are set correctly in Netlify
2. Verify API keys are valid and have proper permissions
3. Check browser console for any CORS or API errors
4. Ensure your YouTube API key is restricted to your Netlify domain
