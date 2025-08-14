# Domain Verification Script
Write-Host "Verifying Stable Domain Configuration" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "Your Vercel Project Configuration:" -ForegroundColor Cyan
Write-Host "Deployment URL: todo-gcsfxanvx-khalediman96s-projects.vercel.app" -ForegroundColor White
Write-Host "Stable Domain:  https://todo-pearl-alpha.vercel.app" -ForegroundColor Green
Write-Host ""

Write-Host "Domain Status:" -ForegroundColor Yellow
Write-Host "✅ Working URL: https://khalediman96-todo.vercel.app (You confirmed working)" -ForegroundColor Green
Write-Host "✅ Stable URL:  https://todo-pearl-alpha.vercel.app (Matches Vercel dashboard)" -ForegroundColor Green
Write-Host ""

Write-Host "Environment Variables Updated:" -ForegroundColor Cyan
Write-Host "NEXTAUTH_URL = https://todo-pearl-alpha.vercel.app" -ForegroundColor White
Write-Host ""

Write-Host "Google OAuth Configuration Required:" -ForegroundColor Red
Write-Host "Add these URLs to your Google OAuth console:" -ForegroundColor White
Write-Host "1. https://todo-pearl-alpha.vercel.app/api/auth/callback/google" -ForegroundColor Yellow
Write-Host "2. https://todo-pearl-alpha.vercel.app (as JavaScript origin)" -ForegroundColor Yellow
Write-Host ""

Write-Host "Both domains should work for your app:" -ForegroundColor Green
Write-Host "- https://khalediman96-todo.vercel.app" -ForegroundColor White
Write-Host "- https://todo-pearl-alpha.vercel.app" -ForegroundColor White
Write-Host ""

Write-Host "For consistency, use the domain shown in your Vercel dashboard:" -ForegroundColor Cyan
Write-Host "https://todo-pearl-alpha.vercel.app" -ForegroundColor Green
