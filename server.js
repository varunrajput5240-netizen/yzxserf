require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Initialize OAuth clients
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/api/auth/google/callback`
);

// Initialize Twilio (will be null if not configured)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio SMS service initialized');
} else {
  console.log('⚠️  Twilio not configured - SMS will use demo mode');
}

// JWT secret for tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// In-memory storage (replace with database in production)
let workers = [
  {
    id: 1,
    name: 'Ravi Sharma',
    skill: 'electrician',
    bio: 'Specialist in wiring, MCB panels and emergency power issues.',
    phone: '+91 98765 11001',
    rating: 4.9,
    jobs: 182,
    experienceYears: 7,
    distanceKm: 1.2,
    availability: 'Available now'
  },
  {
    id: 2,
    name: 'Anita Verma',
    skill: 'plumber',
    bio: 'Fast response for leaks, blockages and bathroom fittings.',
    phone: '+91 98765 11002',
    rating: 4.8,
    jobs: 143,
    experienceYears: 5,
    distanceKm: 2.1,
    availability: 'Wrapping a job nearby'
  },
  {
    id: 3,
    name: 'Imran Khan',
    skill: 'carpenter',
    bio: 'Door fixes, modular kitchen tweaks and custom shelving.',
    phone: '+91 98765 11003',
    rating: 4.7,
    jobs: 121,
    experienceYears: 6,
    distanceKm: 0.9,
    availability: 'Available now'
  }
];

let bookings = [];
let users = [];
let otpStore = {}; // Store OTPs temporarily { phone: { code, expiresAt } }

// Helper function to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to send SMS via Twilio
async function sendSMS(phone, message) {
  if (!twilioClient) {
    console.log(`📱 [DEMO] SMS to ${phone}: ${message}`);
    return { success: true, demo: true };
  }

  try {
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhone,
      to: phone
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Twilio SMS error:', error.message);
    return { success: false, error: error.message };
  }
}

// Helper function to create JWT token
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Email Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  const { password: _, ...userWithoutPassword } = newUser;
  const token = createToken(newUser);
  
  res.status(201).json({ user: userWithoutPassword, token });
});

// Email Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  const token = createToken(user);
  
  res.json({ user: userWithoutPassword, token });
});

// Mobile Signup - Send OTP
app.post('/api/auth/signup-mobile', async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing name or phone' });
  }
  
  // Check if user already exists
  const existing = users.find(u => u.phone === phone);
  if (existing) {
    return res.status(400).json({ error: 'Phone number already registered' });
  }
  
  // Generate OTP
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  otpStore[phone] = { otp, expiresAt, name, isSignup: true };
  
  // Send OTP via SMS
  const message = `Your FixFleet verification code is: ${otp}. Valid for 10 minutes.`;
  const smsResult = await sendSMS(phone, message);
  
  if (!smsResult.success && !smsResult.demo) {
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
  
  res.json({ 
    message: 'OTP sent successfully', 
    phone,
    demo: smsResult.demo || false
  });
});

// Mobile Login - Send OTP
app.post('/api/auth/login-mobile', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Missing phone number' });
  }
  
  // Generate OTP
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  otpStore[phone] = { otp, expiresAt, isSignup: false };
  
  // Send OTP via SMS
  const message = `Your FixFleet login code is: ${otp}. Valid for 10 minutes.`;
  const smsResult = await sendSMS(phone, message);
  
  if (!smsResult.success && !smsResult.demo) {
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
  
  res.json({ 
    message: 'OTP sent successfully', 
    phone,
    demo: smsResult.demo || false
  });
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Missing phone or OTP' });
  }
  
  const stored = otpStore[phone];
  if (!stored) {
    return res.status(400).json({ error: 'OTP not found or expired' });
  }
  
  if (Date.now() > stored.expiresAt) {
    delete otpStore[phone];
    return res.status(400).json({ error: 'OTP expired' });
  }
  
  if (stored.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
  
  // OTP is valid
  const { otp: _, expiresAt: __, isSignup, name } = stored;
  delete otpStore[phone];
  
  let user = users.find(u => u.phone === phone);
  
  if (isSignup && !user) {
    // Create new user
    user = {
      id: Date.now(),
      name,
      phone,
      createdAt: new Date().toISOString()
    };
    users.push(user);
  } else if (isSignup && user) {
    return res.status(400).json({ error: 'User already exists' });
  } else if (!isSignup && !user) {
    // Auto-create for login
    user = {
      id: Date.now(),
      name: 'User',
      phone,
      createdAt: new Date().toISOString()
    };
    users.push(user);
  }
  
  const token = createToken(user);
  res.json({ user, token });
});

// ============================================
// GOOGLE OAUTH
// ============================================

// Initiate Google OAuth
app.get('/api/auth/google', (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent'
  });
  res.json({ authUrl });
});

// Google OAuth callback
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=no_code`);
    }
    
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);
    
    // Get user info from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;
    
    // Find or create user
    let user = users.find(u => u.googleId === googleId || u.email === email);
    
    if (!user) {
      user = {
        id: Date.now(),
        googleId,
        name,
        email,
        picture,
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      users.push(user);
    } else {
      // Update with Google info
      user.googleId = googleId;
      user.name = name;
      user.picture = picture;
      user.provider = 'google';
    }
    
    const token = createToken(user);
    const { password: _, ...userWithoutPassword } = user;
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth?token=${token}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth?error=oauth_failed`);
  }
});

// ============================================
// FACEBOOK OAUTH
// ============================================

// Initiate Facebook OAuth
app.get('/api/auth/facebook', (req, res) => {
  const clientId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `http://localhost:${PORT}/api/auth/facebook/callback`;
  const scope = 'email,public_profile';
  
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
  res.json({ authUrl });
});

// Facebook OAuth callback
app.get('/api/auth/facebook/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=no_code`);
    }
    
    const clientId = process.env.FACEBOOK_APP_ID;
    const clientSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `http://localhost:${PORT}/api/auth/facebook/callback`;
    
    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code
      }
    });
    
    const { access_token } = tokenResponse.data;
    
    // Get user info from Facebook
    const userResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        fields: 'id,name,email,picture',
        access_token
      }
    });
    
    const { id: facebookId, name, email, picture } = userResponse.data;
    const pictureUrl = picture?.data?.url || null;
    
    // Find or create user
    let user = users.find(u => u.facebookId === facebookId || (email && u.email === email));
    
    if (!user) {
      user = {
        id: Date.now(),
        facebookId,
        name,
        email,
        picture: pictureUrl,
        provider: 'facebook',
        createdAt: new Date().toISOString()
      };
      users.push(user);
    } else {
      // Update with Facebook info
      user.facebookId = facebookId;
      user.name = name;
      user.picture = pictureUrl;
      user.provider = 'facebook';
    }
    
    const token = createToken(user);
    const { password: _, ...userWithoutPassword } = user;
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth?token=${token}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`);
  } catch (error) {
    console.error('Facebook OAuth error:', error.response?.data || error.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth?error=oauth_failed`);
  }
});

// ============================================
// EXISTING ENDPOINTS
// ============================================

app.get('/api/workers', (req, res) => {
  const { skill, urgency, sortBy } = req.query;

  let results = [...workers];

  if (skill) {
    results = results.filter((w) => w.skill === skill);
  }

  if (urgency === 'now') {
    results = results.filter((w) => w.availability.toLowerCase().includes('now'));
  }

  if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'experience') {
    results.sort((a, b) => b.experienceYears - a.experienceYears);
  } else {
    results.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  res.json(results);
});

app.post('/api/workers', (req, res) => {
  const { name, skill, bio, phone } = req.body;
  if (!name || !skill || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newWorker = {
    id: Date.now(),
    name,
    skill,
    bio: bio || 'New FixFleet professional in your area.',
    phone,
    rating: 5.0,
    jobs: 0,
    experienceYears: 1,
    distanceKm: Number((Math.random() * 3 + 0.5).toFixed(1)),
    availability: 'Available now'
  };

  workers.push(newWorker);
  res.status(201).json(newWorker);
});

app.post('/api/bookings', (req, res) => {
  const { workerId, issue, time, phone } = req.body;
  if (!workerId || !issue || !time || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const worker = workers.find((w) => w.id === workerId);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found' });
  }

  const booking = {
    id: Date.now(),
    workerId,
    issue,
    time,
    phone,
    status: 'pending'
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

app.listen(PORT, () => {
  console.log(`\n🚀 FixFleet API running on http://localhost:${PORT}`);
  console.log(`\n📋 OAuth Status:`);
  console.log(`   Google: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Facebook: ${process.env.FACEBOOK_APP_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   SMS: ${twilioClient ? '✅ Twilio Active' : '⚠️  Demo Mode'}`);
  console.log(`\n💡 Tip: Create a .env file with your API keys (see .env.example)\n`);
});
