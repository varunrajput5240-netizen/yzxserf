# 🔐 Real OAuth & SMS OTP Setup Guide

## 📋 Prerequisites

Before setting up, you'll need accounts with:
1. **Google Cloud Console** (for Google OAuth)
2. **Facebook Developers** (for Facebook OAuth)
3. **Twilio** (for SMS OTP)

All services have free tiers! 🎉

---

## 🔑 Step 1: Set Up Google OAuth

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: **FixFleet**
   - Support email: Your email
   - Add your email to test users
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: **FixFleet Web Client**
   - Authorized redirect URIs:
     - `http://localhost:4000/api/auth/google/callback` (for local)
     - `https://your-backend-url.com/api/auth/google/callback` (for production)
7. Copy the **Client ID** and **Client Secret**

### 1.2 Add to Environment

Add to your `.env` file:
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
```

---

## 📘 Step 2: Set Up Facebook OAuth

### 2.1 Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** app type
4. Fill in app details:
   - App name: **FixFleet**
   - Contact email: Your email
5. Go to **Settings** → **Basic**
6. Add **Facebook Login** product:
   - Click **Add Product** → Find **Facebook Login** → **Set Up**
7. Configure Facebook Login:
   - Valid OAuth Redirect URIs:
     - `http://localhost:4000/api/auth/facebook/callback`
     - `https://your-backend-url.com/api/auth/facebook/callback`
8. Go to **Settings** → **Basic** and copy:
   - **App ID**
   - **App Secret** (click "Show")

### 2.2 Add to Environment

Add to your `.env` file:
```env
FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here
FACEBOOK_REDIRECT_URI=http://localhost:4000/api/auth/facebook/callback
```

**Note:** For testing, add yourself as a Test User in App Dashboard → Roles → Test Users

---

## 📱 Step 3: Set Up Twilio SMS

### 3.1 Create Twilio Account

1. Go to [Twilio](https://www.twilio.com/)
2. Sign up for free account (free $15.50 credit)
3. Verify your phone number
4. Go to **Console Dashboard**
5. Copy:
   - **Account SID** (from dashboard)
   - **Auth Token** (click "View" to reveal)

### 3.2 Get Phone Number

1. Go to **Phone Numbers** → **Buy a number**
2. Select a number (free for trial accounts)
3. Or use Twilio's test credentials (limited functionality)

### 3.3 Add to Environment

Add to your `.env` file:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📝 Step 4: Create .env File

Create a file named `.env` in your project root:

```env
# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-random-string

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:4000/api/auth/facebook/callback

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**⚠️ Important:** Never commit `.env` file to Git! It's already in `.gitignore`.

---

## 🚀 Step 5: Install Dependencies

Run in your project directory:

```bash
npm install
```

This will install:
- `google-auth-library` - Google OAuth
- `twilio` - SMS service
- `dotenv` - Environment variables
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `axios` - HTTP requests

---

## ✅ Step 6: Test the Setup

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Check console output:**
   - Should show ✅ or ❌ for each service
   - If ❌, check your `.env` file

3. **Test OAuth:**
   - Click "Sign up with Google" → Should redirect to Google
   - Click "Sign up with Facebook" → Should redirect to Facebook

4. **Test SMS:**
   - Enter phone number → Should receive real SMS with OTP
   - Check Twilio console for SMS logs

---

## 🌐 Production Setup

### For Production Deployment:

1. **Update redirect URIs:**
   - Replace `localhost` with your production domain
   - Update in Google Console
   - Update in Facebook App Settings
   - Update in `.env` file

2. **Use environment variables in hosting:**
   - Render: Add variables in Dashboard → Environment
   - Railway: Add in Variables tab
   - Heroku: Use `heroku config:set KEY=value`

3. **Update frontend URL:**
   ```env
   FRONTEND_URL=https://your-frontend-domain.com
   ```

---

## 🐛 Troubleshooting

### Google OAuth not working:
- ✅ Check redirect URI matches exactly (including http/https)
- ✅ Ensure OAuth consent screen is configured
- ✅ Add your email as test user
- ✅ Check browser console for errors

### Facebook OAuth not working:
- ✅ App must be in "Development" mode initially
- ✅ Add test users in App Dashboard
- ✅ Verify redirect URI matches exactly
- ✅ Check App ID and Secret are correct

### SMS not sending:
- ✅ Verify Twilio credentials are correct
- ✅ Check phone number format (+country code)
- ✅ Verify Twilio account has credits
- ✅ Check Twilio console logs for errors

### OTP not verifying:
- ✅ OTP expires in 10 minutes
- ✅ Check phone number matches exactly
- ✅ Verify backend is receiving requests

---

## 📚 Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)

---

## 💡 Tips

1. **Start with Google OAuth** - It's the easiest to set up
2. **Use Twilio trial** - Free credits for testing
3. **Test locally first** - Use `localhost` URLs
4. **Check logs** - Both browser console and server logs
5. **Use demo mode** - Services fall back to demo if not configured

---

**Need help? Check server logs when starting - they show which services are configured!** ✅

