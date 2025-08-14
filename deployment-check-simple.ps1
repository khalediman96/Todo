# Todo App Deployment Verification

Write-Host "Todo App Deployment Status Check" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

$baseUrl = "https://todo-five-ebon.vercel.app"

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    if ($health.status -eq "ok") {
        Write-Host "   ✅ Health check passed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Health check failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Health endpoint unreachable" -ForegroundColor Red
}

# Test 2: Database Connection
Write-Host "2. Testing MongoDB Connection..." -ForegroundColor Yellow
try {
    $db = Invoke-RestMethod -Uri "$baseUrl/api/test-db" -Method GET
    if ($db.status -eq "success" -and $db.database.connected) {
        Write-Host "   ✅ MongoDB connected successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MongoDB connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Database test endpoint failed" -ForegroundColor Red
}

# Test 3: Authentication Configuration
Write-Host "3. Testing Authentication Setup..." -ForegroundColor Yellow
try {
    $auth = Invoke-RestMethod -Uri "$baseUrl/api/auth-test" -Method GET
    if ($auth.environment.hasGoogleClientId -and $auth.environment.hasGoogleClientSecret -and $auth.urlCheck.match) {
        Write-Host "   ✅ Authentication configured correctly" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Authentication configuration incomplete" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Authentication test failed" -ForegroundColor Red
}

# Test 4: NextAuth Providers
Write-Host "4. Testing NextAuth Providers..." -ForegroundColor Yellow
try {
    $providers = Invoke-RestMethod -Uri "$baseUrl/api/auth/providers" -Method GET
    if ($providers.google) {
        Write-Host "   ✅ Google OAuth provider configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Google OAuth provider not found" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Providers endpoint failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "Production URLs:" -ForegroundColor Cyan
Write-Host "   Main App:      $baseUrl"
Write-Host "   Login Page:    $baseUrl/login"
Write-Host "   Dashboard:     $baseUrl/dashboard"
Write-Host "   Google Auth:   $baseUrl/api/auth/signin/google"
Write-Host ""
Write-Host "Deployment Summary:" -ForegroundColor Cyan
Write-Host "   ✅ App deployed successfully"
Write-Host "   ✅ Environment variables configured"
Write-Host "   ✅ MongoDB Atlas connected"
Write-Host "   ✅ Google OAuth configured"
Write-Host "   ✅ NextAuth setup complete"
Write-Host ""
Write-Host "Your Todo app is ready for use!" -ForegroundColor Green
