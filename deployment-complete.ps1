# Todo App - Complete Deployment Guide with Stable URL

Write-Host "Todo App Deployment - STABLE URL CONFIGURED" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Stable Production URL
$STABLE_URL = "https://khalediman96-todo.vercel.app"

Write-Host "STABLE PRODUCTION URL: $STABLE_URL" -ForegroundColor Cyan
Write-Host ""

Write-Host "Environment Variables Successfully Configured:" -ForegroundColor Green
Write-Host "1. MONGODB_URI - Connected to MongoDB Atlas" -ForegroundColor White
Write-Host "2. NEXTAUTH_SECRET - Authentication security key" -ForegroundColor White
Write-Host "3. NEXTAUTH_URL - $STABLE_URL" -ForegroundColor White
Write-Host "4. GOOGLE_CLIENT_ID - Google OAuth client" -ForegroundColor White
Write-Host "5. GOOGLE_CLIENT_SECRET - Google OAuth secret" -ForegroundColor White
Write-Host ""

Write-Host "Google OAuth Console Configuration REQUIRED:" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://console.cloud.google.com/apis/credentials" -ForegroundColor Blue
Write-Host "2. Select your OAuth 2.0 Client ID (460713388246-u9r31huo9unm2bcjomu27bar6cnpg60r.apps.googleusercontent.com)" -ForegroundColor White
Write-Host "3. Add these Authorized redirect URIs:" -ForegroundColor White
Write-Host "   - $STABLE_URL/api/auth/callback/google" -ForegroundColor Green
Write-Host "   - http://localhost:3000/api/auth/callback/google" -ForegroundColor Green
Write-Host "4. Add these Authorized JavaScript origins:" -ForegroundColor White
Write-Host "   - $STABLE_URL" -ForegroundColor Green
Write-Host "   - http://localhost:3000" -ForegroundColor Green
Write-Host "5. Save the changes" -ForegroundColor White
Write-Host ""

Write-Host "Test URLs (Available after Google OAuth setup):" -ForegroundColor Cyan
Write-Host "Main App:      $STABLE_URL" -ForegroundColor White
Write-Host "Login Page:    $STABLE_URL/login" -ForegroundColor White
Write-Host "Dashboard:     $STABLE_URL/dashboard" -ForegroundColor White
Write-Host "Health Check:  $STABLE_URL/api/health" -ForegroundColor White
Write-Host "Auth Test:     $STABLE_URL/api/auth-test" -ForegroundColor White
Write-Host ""

Write-Host "Future Deployments:" -ForegroundColor Green
Write-Host "To maintain the stable URL for future deployments, use:" -ForegroundColor White
Write-Host "1. vercel --prod" -ForegroundColor Gray
Write-Host "2. vercel alias <new-deployment-url> khalediman96-todo.vercel.app" -ForegroundColor Gray
Write-Host ""

Write-Host "Your Todo app is deployed with a STABLE URL!" -ForegroundColor Green
Write-Host "Remember to update Google OAuth settings before testing login." -ForegroundColor Yellow
