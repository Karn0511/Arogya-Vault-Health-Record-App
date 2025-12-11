#!/bin/bash
# Arogya Vault - Firebase Deployment Script

echo "🚀 Starting Firebase Deployment for Arogya Vault"
echo "=================================================="
echo ""

# Step 1: Check Firebase CLI
echo "📦 Step 1: Checking Firebase CLI..."
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI installed"
fi
echo ""

# Step 2: Login to Firebase
echo "🔐 Step 2: Firebase Login"
echo "Please login to your Firebase account..."
firebase login
echo ""

# Step 3: Navigate to frontend directory
echo "📁 Step 3: Navigating to frontend directory..."
cd "arogya-vault" || exit
echo "✅ In directory: $(pwd)"
echo ""

# Step 4: Install dependencies
echo "📥 Step 4: Installing dependencies..."
npm install
echo ""

# Step 5: Build production
echo "🔨 Step 5: Building production bundle..."
ng build --configuration production
echo ""

# Step 6: Deploy to Firebase
echo "🚀 Step 6: Deploying to Firebase Hosting..."
firebase deploy --only hosting
echo ""

echo "=================================================="
echo "✅ Deployment Complete!"
echo ""
echo "Your app is now live at:"
echo "  Primary:   https://arogya-vault.web.app"
echo "  Secondary: https://arogya-vault.firebaseapp.com"
echo ""
echo "⚠️  IMPORTANT: Remember to:"
echo "  1. Deploy backend to cloud service"
echo "  2. Update API URL in environment.prod.ts"
echo "  3. Setup MongoDB Atlas for production database"
echo "=================================================="
