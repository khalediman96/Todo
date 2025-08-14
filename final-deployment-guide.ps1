# Todo App - Final Deployment Guide with Correct Credentials

Write-Host "Todo App Deployment - FINAL SETUP COMPLETE" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# Stable Production URL
$STABLE_URL = "https://todo-pearl-alpha.vercel.app"

Write-Host "STABLE PRODUCTION URL: $STABLE_URL" -ForegroundColor Cyan
Write-Host ""

Write-Host "Environment Variables Configured (UPDATED):" -ForegroundColor Green
Write-Host "1. MONGODB_URI - Connected to MongoDB Atlas" -ForegroundColor White
Write-Host "2. NEXTAUTH_SECRET - Authentication security key" -ForegroundColor White
Write-Host "3. NEXTAUTH_URL - $STABLE_URL" -ForegroundColor White
Write-Host "4. GOOGLE_CLIENT_ID - [YOUR_GOOGLE_CLIENT_ID].apps.googleusercontent.com" -ForegroundColor White
Write-Host "5. GOOGLE_CLIENT_SECRET - [YOUR_GOOGLE_CLIENT_SECRET]" -ForegroundColor White
Write-Host ""

Write-Host "CRITICAL: Google OAuth Console Configuration" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Red
Write-Host ""
Write-Host "You MUST update your Google OAuth settings:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://console.cloud.google.com/apis/credentials" -ForegroundColor Blue
Write-Host "2. Find and click on your OAuth 2.0 Client ID:" -ForegroundColor White
Write-Host "   [YOUR_GOOGLE_CLIENT_ID].apps.googleusercontent.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. In 'Authorized redirect URIs', ADD these URLs:" -ForegroundColor White
Write-Host "   - $STABLE_URL/api/auth/callback/google" -ForegroundColor Green
Write-Host "   - http://localhost:3000/api/auth/callback/google" -ForegroundColor Green
Write-Host ""
Write-Host "4. In 'Authorized JavaScript origins', ADD these URLs:" -ForegroundColor White
Write-Host "   - $STABLE_URL" -ForegroundColor Green
Write-Host "   - http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "5. Click 'Save' button" -ForegroundColor White
Write-Host ""

Write-Host "Test Your Deployment:" -ForegroundColor Cyan
Write-Host "Main App:      $STABLE_URL" -ForegroundColor White
Write-Host "Health Check:  $STABLE_URL/api/health" -ForegroundColor White
Write-Host "Auth Test:     $STABLE_URL/api/auth-test" -ForegroundColor White
Write-Host "Login Page:    $STABLE_URL/login" -ForegroundColor White
Write-Host "Dashboard:     $STABLE_URL/dashboard" -ForegroundColor White
Write-Host ""

Write-Host "Quick Tests (Run these after OAuth setup):" -ForegroundColor Yellow
Write-Host "1. Test health: Invoke-RestMethod '$STABLE_URL/api/health'" -ForegroundColor Gray
Write-Host "2. Test auth: Invoke-RestMethod '$STABLE_URL/api/auth-test'" -ForegroundColor Gray
Write-Host "3. Visit login page: Start-Process '$STABLE_URL/login'" -ForegroundColor Gray
Write-Host ""

Write-Host "SUCCESS! Your Todo app is deployed and ready!" -ForegroundColor Green
Write-Host "Remember: Update Google OAuth settings before testing login" -ForegroundColor Yellow
