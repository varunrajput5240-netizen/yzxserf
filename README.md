# 🏠 FixFleet - On-Demand Home Services Platform

A modern web platform connecting homeowners with trusted local service professionals (electricians, plumbers, carpenters, etc.) for instant booking and reliable repairs.

## ✨ Features

- **For Homeowners:**
  - Search nearby service workers by skill
  - Real-time location-based matching
  - View worker profiles, ratings, and availability
  - Instant booking with preferred time slots

- **For Service Workers:**
  - Easy registration with skills and location
  - Live status dashboard
  - Receive booking requests from nearby customers
  - Build reputation through ratings

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```

3. **Open `index.html` in your browser**

That's it! The website works with demo data if the backend isn't running.

---

## 📦 Deployment - Make It Live!

### **Quick Deploy (10 minutes):**
👉 See **[QUICK_START.md](QUICK_START.md)** for step-by-step instructions

### **Detailed Guide:**
👉 See **[DEPLOYMENT.md](DEPLOYMENT.md)** for comprehensive deployment options

### **Recommended Free Hosting:**
- **Frontend:** Netlify (free, drag & drop)
- **Backend:** Render.com (free tier available)

---

## 📁 Project Structure

```
fixfleet/
├── index.html          # Main HTML page
├── style.css           # Styling
├── app.js              # Frontend JavaScript logic
├── server.js           # Backend API (Express.js)
├── package.json        # Node.js dependencies
├── QUICK_START.md      # 10-minute deployment guide
├── DEPLOYMENT.md       # Detailed deployment instructions
└── README.md           # This file
```

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express
- **Features:** Real-time location simulation, worker registration, booking system

---

## 📝 Configuration

### Local Development
Works automatically with `http://localhost:4000/api`

### Production Deployment
Update `app.js` line 5 with your deployed backend URL:
```javascript
const API_BASE = 'https://your-backend-url.onrender.com/api';
```

---

## 🎯 How It Works

1. **Workers register** with their skills and location
2. **Users search** for services they need
3. **System matches** nearby available workers
4. **Users book** instantly with preferred time
5. **Workers receive** booking requests

---

## 🌐 Live Demo

After deployment, your website will be accessible at:
- **Frontend:** `https://your-site.netlify.app`
- **Backend API:** `https://your-backend.onrender.com/api`

---

## 📚 Need Help?

- Check browser console (F12) for errors
- See DEPLOYMENT.md for troubleshooting
- Verify backend URL is correct in `app.js`
- Make sure backend is running before testing

---

## 📄 License

This is a demo/prototype project for educational purposes.

---

**Built with ❤️ to make household repairs fast, reliable, and easily accessible for everyone!**

