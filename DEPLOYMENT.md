# 🚀 How to Make FixFleet Website Live

This guide shows you how to deploy your FixFleet website so it's accessible online.

---

## **Option 1: FREE Deployment (Recommended for Beginners)**

### **Frontend on Netlify + Backend on Render/Railway**

#### **Step 1: Deploy Backend (Render.com - FREE)**

1. **Create account** at [render.com](https://render.com) (free signup)

2. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub account (or push code to GitHub first)
   - Select your repository

3. **Configure:**
   - **Name:** `fixfleet-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Add Environment Variable:**
   - Key: `PORT`
   - Value: `4000` (or leave blank, Render auto-assigns)

5. **Click "Create Web Service"**
   - Render will deploy your backend and give you a URL like:
     `https://fixfleet-backend.onrender.com`

6. **Copy your backend URL** - you'll need it for Step 2!

---

#### **Step 2: Update Frontend to Use Live Backend**

1. Open `app.js` in your code editor
2. Find this line (around line 3):
   ```javascript
   const API_BASE = 'http://localhost:4000/api';
   ```
3. Replace it with:
   ```javascript
   const API_BASE = 'https://YOUR-BACKEND-URL.onrender.com/api';
   ```
   (Replace `YOUR-BACKEND-URL` with the actual URL from Step 1)

---

#### **Step 3: Deploy Frontend (Netlify - FREE)**

1. **Create account** at [netlify.com](https://netlify.com) (free signup)

2. **Drag & Drop Method (Easiest):**
   - Zip your project folder (but EXCLUDE `node_modules` folder)
   - Go to Netlify dashboard
   - Drag the zip file into the deploy area
   - Wait for it to deploy
   - You'll get a URL like: `https://random-name-12345.netlify.app`

3. **GitHub Method (Better for updates):**
   - Push your code to GitHub
   - In Netlify: "New site from Git"
   - Connect GitHub, select your repo
   - **Build settings:**
     - Build command: (leave empty)
     - Publish directory: `/` (root)

4. **Your website is now LIVE!** 🎉

---

## **Option 2: Deploy Everything on Railway (Easier)**

1. **Sign up** at [railway.app](https://railway.app) (free with $5 credit)

2. **Create New Project:**
   - Click "New Project"
   - "Deploy from GitHub repo" or "Deploy from directory"

3. **For Backend:**
   - Add `server.js` as a service
   - Railway auto-detects Node.js
   - Add environment variable: `PORT=4000`

4. **For Frontend:**
   - Add another service
   - Point to your HTML/CSS/JS files
   - Set build command to empty (static site)

5. **Update `app.js`** with Railway backend URL

---

## **Option 3: Deploy to Vercel (Frontend Only, Static)**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **In your project folder, run:**
   ```bash
   vercel
   ```

3. **Follow the prompts** - your site will be live in seconds!

**Note:** You'll still need a backend elsewhere (Render/Railway) for the API.

---

## **Option 4: GitHub Pages (Frontend Only)**

1. Push your code to GitHub

2. Go to repo → Settings → Pages

3. Select branch: `main` → folder: `/ (root)`

4. Your site will be at: `https://yourusername.github.io/repo-name`

**Note:** GitHub Pages is static only - backend won't work. Use Render/Railway for API.

---

## **Quick Test Checklist**

After deploying:

- [ ] Frontend loads without errors
- [ ] Can search for workers
- [ ] Can register as a worker
- [ ] Can create a booking
- [ ] No CORS errors in browser console
- [ ] Backend API is accessible (try visiting `/api/workers` in browser)

---

## **Troubleshooting**

### **CORS Errors:**
Make sure `server.js` has:
```javascript
app.use(cors());
```

### **Backend Not Responding:**
- Check if backend URL is correct in `app.js`
- Verify backend is running (visit backend URL in browser)
- Check Render/Railway logs for errors

### **Frontend Can't Find Backend:**
- Update `API_BASE` in `app.js` with correct backend URL
- Make sure URL includes `https://` (not `http://`)
- Make sure URL ends with `/api` not `/api/`

---

## **Need Help?**

If you get stuck:
1. Check browser console (F12) for errors
2. Check backend logs in Render/Railway dashboard
3. Make sure all environment variables are set
4. Verify all files are uploaded correctly

---

**Good luck! Your FixFleet website will be live soon! 🚀**

