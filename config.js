// Configuration file for environment variables
// This works for both local development and Netlify deployment

const config = {
  supabase: {
    // For Netlify: Set these as environment variables in your Netlify dashboard
    // For local: These fallback values will be used
    url: '${VITE_SUPABASE_URL}' !== '${VITE_SUPABASE_URL}' 
      ? '${VITE_SUPABASE_URL}'
      : 'https://dlveprsuwfbqqshlvgig.supabase.co',
    anonKey: '${VITE_SUPABASE_ANON_KEY}' !== '${VITE_SUPABASE_ANON_KEY}'
      ? '${VITE_SUPABASE_ANON_KEY}'
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdmVwcnN1d2ZicXFzaGx2Z2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTE5NTksImV4cCI6MjA2NTk4Nzk1OX0.p6uFAH3mXgr18JwVXetO2oiAnYa8Gu6YVHj4_uTulJQ'
  },
  
  youtube: {
    apiKey: '${VITE_YOUTUBE_API_KEY}' !== '${VITE_YOUTUBE_API_KEY}'
      ? '${VITE_YOUTUBE_API_KEY}'
      : 'AIzaSyCYk-HJnkIzjp42on-u1MCVA_wgKDfv_fA'
  }
};

// Make config globally available
window.EmbarkConfig = config;
