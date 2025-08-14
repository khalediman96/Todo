// lib/utils/env-check.ts
export function checkRequiredEnvVars() {
  const requiredVars = {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };

  // NEXTAUTH_URL is required in production
  if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL) {
    console.error('❌ NEXTAUTH_URL is required in production environment');
    console.error('🔧 Please set NEXTAUTH_URL to your production domain (e.g., https://todo-khalediman96.vercel.app)');
  }

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('🔧 Please set these variables in your Vercel deployment settings');
    return false;
  }

  console.log('✅ All required environment variables are set');
  return true;
}

export function logEnvironmentInfo() {
  console.log('🌍 Environment Info:');
  console.log('📍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔗 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.log('🔐 NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
  console.log('🗄️ MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('📧 GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('🔑 GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
}
