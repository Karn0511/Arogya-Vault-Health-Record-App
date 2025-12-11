# 🚀 Complete Deployment Guide for Arogya Vault

## 🎯 Quick Overview
Your app has two domains already set up:
- **Primary**: https://arogya-vault.web.app
- **Secondary**: https://arogya-vault.firebaseapp.com

## 📋 Prerequisites
- [x] Firebase project created (Health App - arogya-vault)
- [ ] Firebase CLI installed
- [ ] MongoDB Atlas account (for production database)
- [ ] Backend hosting decided (Firebase Functions, Cloud Run, or Heroku)

---

## Part 1: Local Testing (Do This First!)

### Step 1: Verify Docker Containers
```bash
docker ps
```
Should show 4 running containers:
- arogya-mongodb (port 27017)
- arogya-backend (port 5000)
- arogya-frontend (port 4200)
- arogya-mongo-express (port 8081)

### Step 2: Test New Features
1. Open http://localhost:4200
2. **Test Password Toggle**: Login page → Click eye icon → Password reveals/hides
3. **Test Boot Screen**: Login with `amit@example.com` / `patient123` → Watch loading animation (3 seconds)
4. **Test Real Data**: Dashboard should show real appointments from MongoDB (no mock data)
5. **Test Admin**: Login with `admin@arogya.com` / `admin123` → Logout button works

---

## Part 2: Firebase Hosting Setup

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Build Production Angular App
```bash
cd "e:\new health app\arogya-vault"
npm install
ng build --configuration production
```

This creates `dist/arogya-vault/browser` with optimized files.

## Step 3: Initialize Firebase (If not done)
```bash
firebase init hosting
```

Select:
- Use existing project: arogya-vault
- Public directory: `dist/arogya-vault/browser`
- Configure as single-page app: Yes
- Set up automatic builds: No
- Overwrite index.html: No

## Step 4: Update firebase.json Configuration

Your `firebase.json` should look like:
```json
{
  "hosting": {
    "public": "dist/arogya-vault/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## Step 5: Deploy to Firebase
```bash
firebase deploy --only hosting
```

## Step 6: Update Environment for Production

Update `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'YOUR_BACKEND_API_URL', // Update this with your backend URL
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "arogya-vault.firebaseapp.com",
    projectId: "arogya-vault",
    storageBucket: "arogya-vault.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

## Important Notes

### Backend Deployment
Your Angular app is frontend only. You need to deploy the backend separately:

**Option 1: Deploy Backend to Firebase Functions**
```bash
cd "e:\new health app\arogya-vault\backend"
firebase init functions
firebase deploy --only functions
```

**Option 2: Deploy Backend to Heroku/Railway/Render**
- Create account on hosting provider
- Connect your GitHub repo
- Deploy backend as Node.js app
- Update `apiUrl` in environment.prod.ts

**Option 3: Deploy Backend to Cloud Run (Recommended)**
```bash
gcloud builds submit --tag gcr.io/arogya-vault/backend
gcloud run deploy backend --image gcr.io/arogya-vault/backend --platform managed
```

### MongoDB Database
For production, use:
- **MongoDB Atlas** (Recommended): Free tier available at mongodb.com/cloud/atlas
- Update `MONGO_URI` in backend environment variables

## Quick Deploy Commands

### Local Test Build
```bash
cd "e:\new health app\arogya-vault"
npm run build
firebase serve
```

### Production Deploy
```bash
cd "e:\new health app\arogya-vault"
npm run build --prod
firebase deploy
```

## Access Your Deployed App
- **Primary**: https://arogya-vault.web.app
- **Secondary**: https://arogya-vault.firebaseapp.com

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Firebase CLI Issues
```bash
npm install -g firebase-tools --force
firebase logout
firebase login
```

### 404 Errors After Deploy
Make sure `rewrites` in firebase.json are configured for SPA routing.

## Environment Variables for Backend

Create `.env` file for production backend:
```env
PORT=5000
MONGO_URI=mongodb+srv://your-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
CORS_ORIGIN=https://arogya-vault.web.app,https://arogya-vault.firebaseapp.com
GEMINI_API_KEY=your-gemini-api-key
```

## Complete Deployment Checklist

- [ ] Build Angular app with production config
- [ ] Deploy frontend to Firebase Hosting
- [ ] Deploy backend to cloud service
- [ ] Setup MongoDB Atlas database
- [ ] Update environment variables
- [ ] Test login functionality
- [ ] Test API endpoints
- [ ] Check CORS configuration
- [ ] Verify SSL certificates
- [ ] Test on mobile devices

---

**Need Help?**
- Firebase Docs: https://firebase.google.com/docs/hosting
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
