# 🔧 FixFleet Render Deployment Troubleshooting

## 🚨 Common Render Deployment Issues & Fixes

### **Issue 1: "Build Failed" or "Module Not Found"**

**Symptoms:**
- Build log shows dependency installation errors
- `npm install` fails
- Module not found errors

**Solutions:**

1. **Check package.json for missing dependencies:**
   ```json
   {
     "dependencies": {
       "cors": "^2.8.5",
       "express": "^4.19.2",
       "google-auth-library": "^9.0.0",
       "twilio": "^4.20.0",
       "dotenv": "^16.3.1",
       "jsonwebtoken": "^9.0.2",
       "bcryptjs": "^2.4.3",
       "axios": "^1.6.2"
     }
   }
   ```

2. **Force clean install on Render:**
   - In Render dashboard, go to your service
   - Manual Deploy → "Clear build cache & deploy"

3. **Check Node.js version:**
   - Go to Render service settings
   - Set Node Version to: `18.17.0` or later

---

### **Issue 2: "Cannot find module" errors**

**Symptoms:**
- Server starts but crashes immediately
- Missing module errors in logs

**Solution:**
Make sure your `server.js` has proper imports:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
```

---

### **Issue 3: "Port already in use" or server not starting**

**Symptoms:**
- Server doesn't start on Render
- Port binding errors

**Fix:**
Your `server.js` already handles this correctly:
```javascript
const PORT = process.env.PORT || 4000;
```

---

### **Issue 4: Environment variables not working**

**Symptoms:**
- OAuth doesn't work
- Twilio fails
- CORS issues

**Solutions:**

1. **Add all environment variables in Render:**
   - Go to Render service → Environment
   - Add these variables (leave empty if not using):

   ```
   PORT=4000
   FRONTEND_URL=https://your-netlify-site.netlify.app
   JWT_SECRET=your-super-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=https://your-render-service.onrender.com/api/auth/google/callback
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   FACEBOOK_REDIRECT_URI=https://your-render-service.onrender.com/api/auth/facebook/callback
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

2. **Important:** Update redirect URIs to match your Render URL

---

## 🎯 Step-by-Step Render Deployment (Fixed)

### **Step 1: Prepare Your Code**

1. **Make sure you have these files:**
   - ✅ `server.js`
   - ✅ `package.json` (with all dependencies)
   - ✅ `.env.example` (optional, for reference)

2. **Test locally first:**
   ```bash
   npm install
   npm start
   ```
   Should see: "FixFleet API running on http://localhost:4000"

### **Step 2: Deploy to Render**

1. **Go to [render.com](https://render.com)** and sign up/login

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo (recommended) OR upload files

3. **Configure Service:**
   - **Name:** `fixfleet-backend` (or any name)
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main` or your branch
   - **Root Directory:** Leave empty (`.`)

4. **Build Settings:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. **Environment Variables (CRITICAL):**
   Add these in Render dashboard → Environment:

   | Key | Value | Notes |
   |-----|-------|-------|
   | PORT | `4000` | Required |
   | FRONTEND_URL | `https://your-netlify-site.netlify.app` | Your frontend URL |
   | JWT_SECRET | `your-random-secret-key-here` | Generate: `openssl rand -base64 32` |

   **Optional (add if using these services):**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `FACEBOOK_APP_ID`
   - `FACEBOOK_APP_SECRET`
   - `FACEBOOK_REDIRECT_URI`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

6. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes
   - Should see: "Your service is live!"

---

### **Step 3: Verify Deployment**

1. **Check the URL:**
   - Should be: `https://fixfleet-backend-xyz.onrender.com`

2. **Test API endpoints:**
   - Visit: `https://your-render-url.onrender.com/api/workers`
   - Should return JSON with demo workers

3. **Check logs:**
   - Go to Render service → Logs
   - Should show: "FixFleet API running on http://0.0.0.0:4000"
   - Should show service status (OAuth/Twilio configured or not)

---

## 🔍 Debugging Render Deployment

### **Check Build Logs:**
1. Go to Render service dashboard
2. Click "Logs" tab
3. Look for errors during:
   - `npm install`
   - `npm start`

### **Common Build Errors:**

**Error: `npm ERR! code ENOTFOUND`**
- Solution: Check internet connection, try redeploy

**Error: `Module not found`**
- Solution: Verify package.json dependencies match imports in server.js

**Error: `Cannot read property of undefined`**
- Solution: Missing environment variables

### **Manual Redeploy:**
1. Go to Render service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Or: "Clear build cache & deploy"

---

## 🌐 Update Frontend to Use Render Backend

Once backend is deployed, update your frontend:

1. **Open `app.js`**
2. **Find line 5-8:**
   ```javascript
   const API_BASE = window.API_BASE_URL ||
     (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:4000/api'
       : '');
   ```

3. **Replace with:**
   ```javascript
   const API_BASE = 'https://your-render-backend.onrender.com/api';
   ```
   (Replace with your actual Render URL)

---

## 🚨 Emergency Fixes

### **If nothing works:**

1. **Create a minimal server.js:**
   ```javascript
   const express = require('express');
   const app = express();
   const PORT = process.env.PORT || 4000;

   app.get('/api/test', (req, res) => {
     res.json({ message: 'Hello from Render!' });
   });

   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

2. **Simplify package.json:**
   ```json
   {
     "name": "fixfleet-backend",
     "version": "1.0.0",
     "main": "server.js",
     "scripts": { "start": "node server.js" },
     "dependencies": { "express": "^4.19.2" }
   }
   ```

3. **Deploy minimal version first**
4. **Then add features one by one**

---

## 📞 Still Having Issues?

**Provide this information when asking for help:**

1. **Render build logs** (copy the full error)
2. **Your package.json** content
3. **Your server.js** (first 20 lines)
4. **What step is failing**

**Most deployment issues are:**
- Missing environment variables
- Wrong Node.js version
- Missing dependencies in package.json

Let me know what specific error you're seeing! 🤝
