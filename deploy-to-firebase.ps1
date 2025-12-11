# Arogya Vault - Firebase Deployment Script for Windows

Write-Host "🚀 Starting Firebase Deployment for Arogya Vault" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Firebase CLI
Write-Host "📦 Step 1: Checking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>$null
    Write-Host "✅ Firebase CLI installed: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}
Write-Host ""

# Step 2: Login to Firebase
Write-Host "🔐 Step 2: Firebase Login" -ForegroundColor Yellow
Write-Host "Please login to your Firebase account..." -ForegroundColor White
firebase login
Write-Host ""

# Step 3: Navigate to frontend directory
Write-Host "📁 Step 3: Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location -Path "arogya-vault"
Write-Host "✅ In directory: $PWD" -ForegroundColor Green
Write-Host ""

# Step 4: Install dependencies
Write-Host "📥 Step 4: Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host ""

# Step 5: Build production
Write-Host "🔨 Step 5: Building production bundle..." -ForegroundColor Yellow
ng build --configuration production
Write-Host ""

# Step 6: Initialize Firebase (if needed)
Write-Host "🔧 Step 6: Initializing Firebase (if needed)..." -ForegroundColor Yellow
if (!(Test-Path "firebase.json")) {
    Write-Host "Creating firebase.json..." -ForegroundColor White
    firebase init hosting
}
Write-Host ""

# Step 7: Deploy to Firebase
Write-Host "🚀 Step 7: Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now live at:" -ForegroundColor White
Write-Host "  Primary:   https://arogya-vault.web.app" -ForegroundColor Cyan
Write-Host "  Secondary: https://arogya-vault.firebaseapp.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Remember to:" -ForegroundColor Yellow
Write-Host "  1. Deploy backend to cloud service" -ForegroundColor White
Write-Host "  2. Update API URL in environment.prod.ts" -ForegroundColor White
Write-Host "  3. Setup MongoDB Atlas for production database" -ForegroundColor White
Write-Host "  4. Update CORS settings in backend" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
