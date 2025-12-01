# 🚀 Quick Start: Deploy FixFleet in 10 Minutes

## **Easiest Method: Netlify + Render (FREE)**

### **Step 1: Deploy Backend (5 minutes)**

1. Go to [render.com](https://render.com) and sign up (FREE)

2. Click **"New +"** → **"Web Service"**

3. Connect GitHub (or upload your code)

4. Settings:
   - **Name:** `fixfleet-api`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Click **"Create Web Service"**

6. **Copy your backend URL** (e.g., `https://fixfleet-api.onrender.com`)

---

### **Step 2: Update Frontend (2 minutes)**

1. Open `app.js` in your editor

2. Find line 3:
   ```javascript
   const API_BASE = 'http://localhost:4000/api';
   ```

3. Replace with your backend URL:
   ```javascript
   const API_BASE = 'https://fixfleet-api.onrender.com/api';
   ```
   (Use the URL from Step 1)

---

### **Step 3: Deploy Frontend (3 minutes)**

1. Go to [netlify.com](https://netlify.com) and sign up (FREE)

2. **Drag & Drop Method:**
   - Zip your project (EXCLUDE `node_modules` folder)
   - Drag zip into Netlify dashboard
   - Wait 30 seconds
   - **Done!** ✅

3. Or use **GitHub:**
   - Push code to GitHub
   - In Netlify: "New site from Git"
   - Select your repo
   - Deploy!

---

## **Your Website is LIVE!** 🎉

Visit the URL Netlify gives you (e.g., `https://fixfleet-123.netlify.app`)

---

## **Alternative: All-in-One on Railway**

1. Go to [railway.app](https://railway.app) and sign up
2. "New Project" → "Deploy from GitHub"
3. Add two services:
   - Backend: Point to `server.js`
   - Frontend: Point to HTML files
4. Update `app.js` with Railway backend URL
5. **Done!**

---

## **Need Help?**

- Check `DEPLOYMENT.md` for detailed instructions
- Check browser console (F12) for errors
- Make sure backend URL in `app.js` matches your deployed backend

---

**That's it! Your FixFleet website is now live on the internet! 🌐**

