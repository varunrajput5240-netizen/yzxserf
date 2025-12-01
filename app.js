// Simple in-browser data + interaction layer for FixFleet demo

// BACKEND URL CONFIGURATION
// =========================
// For LOCAL development: Uses http://localhost:4000/api (automatic)
// For PRODUCTION: Update the line below with your deployed backend URL
// Example: const API_BASE = 'https://fixfleet-backend.onrender.com/api';
//
// Or create a config.js file with: window.API_BASE_URL = 'https://your-backend-url.com/api';
const API_BASE = window.API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:4000/api' 
    : ''); // Empty = demo mode (works offline, no real backend needed)

const demoWorkers = [
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
    availability: 'Available now',
    coordinates: { x: 55, y: 42 },
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
    availability: 'Wrapping a job nearby',
    coordinates: { x: 30, y: 60 },
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
    availability: 'Available now',
    coordinates: { x: 65, y: 65 },
  },
  {
    id: 4,
    name: 'Priya Nair',
    skill: 'cleaning',
    bio: 'Deep cleaning specialist for move-in & festival makeovers.',
    phone: '+91 98765 11004',
    rating: 4.9,
    jobs: 210,
    experienceYears: 4,
    distanceKm: 3.4,
    availability: 'Available today',
    coordinates: { x: 40, y: 30 },
  },
  {
    id: 5,
    name: 'Sanjay Patel',
    skill: 'appliance',
    bio: 'Certified technician for ACs, fridges and washing machines.',
    phone: '+91 98765 11005',
    rating: 4.6,
    jobs: 98,
    experienceYears: 5,
    distanceKm: 1.8,
    availability: 'Available now',
    coordinates: { x: 75, y: 36 },
  },
];

let userLocation = null;
let workerLocation = null;
let activeRole = 'user';
let currentResults = [...demoWorkers];
let selectedWorkerId = null;

function $(selector) {
  return document.querySelector(selector);
}

function createEl(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function workerImageForSkill(skill) {
  switch (skill) {
    case 'electrician':
      return 'https://images.pexels.com/photos/4386327/pexels-photo-4386327.jpeg?auto=compress&cs=tinysrgb&w=200';
    case 'plumber':
      return 'https://images.pexels.com/photos/5854188/pexels-photo-5854188.jpeg?auto=compress&cs=tinysrgb&w=200';
    case 'carpenter':
      return 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=200';
    case 'cleaning':
      return 'https://images.pexels.com/photos/4107283/pexels-photo-4107283.jpeg?auto=compress&cs=tinysrgb&w=200';
    case 'appliance':
      return 'https://images.pexels.com/photos/5591770/pexels-photo-5591770.jpeg?auto=compress&cs=tinysrgb&w=200';
    case 'painting':
      return 'https://images.pexels.com/photos/6476584/pexels-photo-6476584.jpeg?auto=compress&cs=tinysrgb&w=200';
    default:
      return 'https://images.pexels.com/photos/8485739/pexels-photo-8485739.jpeg?auto=compress&cs=tinysrgb&w=200';
  }
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2600);
}

function setupSmoothScroll() {
  document.querySelectorAll('.nav-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-scroll');
      const el = target && document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

async function apiGetWorkers(params) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/workers?${query}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load workers');
  return res.json();
}

async function apiRegisterWorker(payload) {
  const res = await fetch(`${API_BASE}/workers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to register worker');
  return res.json();
}

async function apiCreateBooking(payload) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

function setupRoleToggle() {
  const tabs = document.querySelectorAll('.role-tab');
  const panelUser = $('#panel-user');
  const panelWorker = $('#panel-worker');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const role = tab.getAttribute('data-role');
      activeRole = role;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      if (role === 'user') {
        panelUser.classList.remove('hidden');
        panelWorker.classList.add('hidden');
      } else {
        panelWorker.classList.remove('hidden');
        panelUser.classList.add('hidden');
      }
    });
  });

  $('#switch-to-worker')?.addEventListener('click', () => {
    tabs.forEach((t) => {
      const role = t.getAttribute('data-role');
      if (role === 'worker') t.click();
    });
    document.querySelector('#for-workers')?.scrollIntoView({ behavior: 'smooth' });
  });

  $('#switch-to-user')?.addEventListener('click', () => {
    tabs.forEach((t) => {
      const role = t.getAttribute('data-role');
      if (role === 'user') t.click();
    });
    document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth' });
  });

  $('#cta-become-worker')?.addEventListener('click', () => {
    tabs.forEach((t) => {
      const role = t.getAttribute('data-role');
      if (role === 'worker') t.click();
    });
    document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth' });
  });
}

function setupUrgencyPills() {
  const pills = document.querySelectorAll('.pill');
  const urgencyInput = $('#urgency');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const value = pill.getAttribute('data-urgency');
      if (urgencyInput && value) urgencyInput.value = value;
    });
  });
}

function fakeGeolocation(target) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const loc = {
        lat: 28.6139 + (Math.random() - 0.5) * 0.02,
        lng: 77.209 + (Math.random() - 0.5) * 0.02,
      };
      if (target === 'user') userLocation = loc;
      if (target === 'worker') workerLocation = loc;
      resolve(loc);
    }, 650);
  });
}

function setupLocationButtons() {
  const userBtn = $('#detect-location');
  const workerBtn = $('#worker-detect-location');
  const userStatus = $('#location-status');
  const workerStatus = $('#worker-location-status');

  if (userBtn && userStatus) {
    userBtn.addEventListener('click', async () => {
      userBtn.disabled = true;
      userStatus.textContent = 'Detecting your location…';
      const loc = await fakeGeolocation('user');
      userStatus.textContent = `Location set near (${loc.lat.toFixed(3)}, ${loc.lng.toFixed(
        3
      )})`;
      showToast('Your location has been updated for better matching.');
      userBtn.disabled = false;
    });
  }

  if (workerBtn && workerStatus) {
    workerBtn.addEventListener('click', async () => {
      workerBtn.disabled = true;
      workerStatus.textContent = 'Detecting your location…';
      const loc = await fakeGeolocation('worker');
      workerStatus.textContent = `You’ll appear near (${loc.lat.toFixed(3)}, ${loc.lng.toFixed(
        3
      )})`;
      showToast('Your worker location has been saved for local jobs.');
      workerBtn.disabled = false;
    });
  }
}

function setupServiceCards() {
  const cards = document.querySelectorAll('.service-card');
  const serviceSelect = $('#service-type');
  const form = $('#user-search-form');

  if (!cards.length || !serviceSelect || !form) return;

  cards.forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
      let value = '';
      if (title.includes('electric')) value = 'electrician';
      else if (title.includes('plumb')) value = 'plumber';
      else if (title.includes('carpent')) value = 'carpenter';
      else if (title.includes('clean')) value = 'cleaning';
      else if (title.includes('appliance')) value = 'appliance';
      else if (title.includes('paint')) value = 'painting';

      if (value) {
        serviceSelect.value = value;
        showToast(`Looking for nearby ${title}…`);
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function renderMap(workers) {
  const map = $('#fake-map');
  const count = $('#map-count');
  if (!map || !count) return;

  map.querySelectorAll('.map-worker-pin').forEach((el) => el.remove());

  (workers || []).forEach((w) => {
    const pin = createEl('div', 'map-worker-pin');
    pin.dataset.skill = w.skill;
    const pos = w.coordinates || { x: 40 + Math.random() * 40, y: 30 + Math.random() * 40 };
    pin.style.left = `${pos.x}%`;
    pin.style.top = `${pos.y}%`;
    pin.title = `${w.name} • ${w.rating.toFixed(1)}★`;
    pin.addEventListener('click', () => {
      selectWorker(w.id);
      const cardEl = document.querySelector(`.worker-card[data-id="${w.id}"]`);
      if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    map.appendChild(pin);
  });

  count.textContent = `${workers.length} online`;
}

function serviceLabel(skill) {
  switch (skill) {
    case 'electrician':
      return 'Electrician';
    case 'plumber':
      return 'Plumber';
    case 'carpenter':
      return 'Carpenter';
    case 'cleaning':
      return 'Home Cleaning';
    case 'appliance':
      return 'Appliance Repair';
    case 'painting':
      return 'Painting';
    default:
      return 'Home Services';
  }
}

function renderWorkersList(workers) {
  const list = $('#workers-list');
  const subtitle = $('#results-subtitle');
  if (!list || !subtitle) return;

  list.innerHTML = '';

  if (!workers.length) {
    subtitle.textContent = 'No workers match this filter yet – try another service type.';
    const empty = createEl('div');
    empty.textContent = 'No professionals found for this combination just yet.';
    empty.style.fontSize = '0.85rem';
    empty.style.color = '#9ca3af';
    list.appendChild(empty);
    return;
  }

  const selectedSkill =
    document.querySelector('#service-type') && document.querySelector('#service-type').value;
  const skillText = selectedSkill ? serviceLabel(selectedSkill) : 'all services';

  subtitle.textContent = `Showing ${workers.length} professionals around you for ${skillText}.`;

  workers.forEach((w) => {
    const card = createEl('article', 'worker-card');
    card.dataset.id = String(w.id);

    const avatarWrap = createEl('div', 'avatar-wrap');
    const avatar = createEl('div', 'avatar');
    const img = createEl('img', 'worker-photo');
    img.src = workerImageForSkill(w.skill);
    img.alt = `${w.name} – ${serviceLabel(w.skill)}`;
    avatar.appendChild(img);

    const badge = createEl('div', 'avatar-badge');
    badge.textContent =
      w.skill === 'electrician'
        ? '⚡'
        : w.skill === 'plumber'
        ? '💧'
        : w.skill === 'carpenter'
        ? '🪚'
        : w.skill === 'cleaning'
        ? '🧹'
        : w.skill === 'appliance'
        ? '🧊'
        : w.skill === 'painting'
        ? '🎨'
        : '🔧';

    avatarWrap.append(avatar, badge);

    const main = createEl('div', 'worker-main');
    const nameEl = createEl('h3', 'worker-name');
    nameEl.textContent = w.name;
    const skillEl = createEl('p', 'worker-skill');
    skillEl.textContent = serviceLabel(w.skill);

    const meta = createEl('div', 'worker-meta');
    const ratingChip = createEl('span', 'chip rating');
    ratingChip.textContent = `${w.rating.toFixed(1)}★ · ${w.jobs} jobs`;
    const distanceChip = createEl('span', 'chip distance');
    distanceChip.textContent = `${w.distanceKm.toFixed(1)} km away`;
    const expChip = createEl('span', 'chip experience');
    expChip.textContent = `${w.experienceYears}+ yrs exp.`;
    meta.append(ratingChip, distanceChip, expChip);

    main.append(nameEl, skillEl, meta);

    const right = createEl('div', 'worker-cta');
    const availability = createEl('span', 'availability-pill');
    availability.textContent = w.availability;
    const callHint = createEl('span');
    callHint.textContent = 'Tap to view & book';
    right.append(availability, callHint);

    card.append(avatarWrap, main, right);
    card.addEventListener('click', () => selectWorker(w.id));

    list.appendChild(card);
  });
}

function selectWorker(id) {
  selectedWorkerId = id;
  document.querySelectorAll('.worker-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.id === String(id));
  });
  const worker = currentResults.find((w) => w.id === id);
  if (!worker) return;

  const empty = document.querySelector('.booking-empty');
  const details = $('#booking-details');
  if (empty && details) {
    empty.classList.add('hidden');
    details.classList.remove('hidden');
  }

  const avatar = $('#booking-avatar');
  const name = $('#booking-name');
  const skill = $('#booking-skill');
  const rating = $('#booking-rating');
  const note = $('#booking-note');

  if (avatar) {
    avatar.className = 'avatar';
    avatar.innerHTML = '';
    const img = createEl('img', 'worker-photo');
    img.src = workerImageForSkill(worker.skill);
    img.alt = `${worker.name} – ${serviceLabel(worker.skill)}`;
    avatar.appendChild(img);
  }
  if (name) name.textContent = worker.name;
  if (skill) skill.textContent = `${serviceLabel(worker.skill)} · ${worker.experienceYears}+ years`;
  if (rating)
    rating.textContent = `${worker.rating.toFixed(1)}★ · ${worker.jobs} completed · ${worker.availability}`;
  if (note)
    note.textContent = `We’ll share your contact with ${worker.name.split(' ')[0]} only after you confirm the booking.`;
}

function sortWorkers(workers, mode) {
  const sorted = [...workers];
  if (mode === 'rating') {
    sorted.sort((a, b) => b.rating - a.rating);
  } else if (mode === 'experience') {
    sorted.sort((a, b) => b.experienceYears - a.experienceYears);
  } else {
    sorted.sort((a, b) => a.distanceKm - b.distanceKm);
  }
  return sorted;
}

function setupSorting() {
  const sortSelect = $('#sort-by');
  if (!sortSelect) return;
  sortSelect.addEventListener('change', () => {
    const mode = sortSelect.value;
    currentResults = sortWorkers(currentResults, mode);
    renderWorkersList(currentResults);
    renderMap(currentResults);
  });
}

function setupSearchForm() {
  const form = $('#user-search-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const typeSelect = $('#service-type');
    const urgency = $('#urgency')?.value || 'now';
    const selectedType = typeSelect?.value || '';

    const sortBy = document.querySelector('#sort-by')?.value || 'distance';

    try {
      const apiWorkers = await apiGetWorkers({
        skill: selectedType,
        urgency,
        sortBy,
      });
      currentResults = apiWorkers;
    } catch (_err) {
      // Fallback to in-browser demo data
      let filtered = [...demoWorkers];
      if (selectedType) {
        filtered = filtered.filter((w) => w.skill === selectedType);
      }
      if (urgency === 'now') {
        filtered = filtered.filter((w) => w.availability.toLowerCase().includes('now'));
      }
      currentResults = sortWorkers(filtered, sortBy);
    }

    selectedWorkerId = null;
    renderWorkersList(currentResults);
    renderMap(currentResults);
    showToast('Updated matches based on your need and urgency.');
    document.querySelector('#results-section')?.scrollIntoView({ behavior: 'smooth' });
  });
}

function setupWorkerRegistration() {
  const form = $('#worker-register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#worker-name')?.value.trim();
    const skill = $('#worker-skill')?.value;
    const bio = $('#worker-bio')?.value.trim() || 'New FixFleet professional in your area.';
    const phone = $('#worker-phone')?.value.trim();

    if (!name || !skill || !phone) {
      showToast('Please fill in your name, main skill and contact number.');
      return;
    }

    let newWorker;
    try {
      newWorker = await apiRegisterWorker({ name, skill, bio, phone });
    } catch (_err) {
      // Fallback to local-only worker
      newWorker = {
        id: Date.now(),
        name,
        skill,
        bio,
        phone,
        rating: 5.0,
        jobs: 0,
        experienceYears: 1,
        distanceKm: (Math.random() * 3 + 0.5).toFixed(1) * 1,
        availability: 'Available now',
      };
      demoWorkers.push(newWorker);
    }

    if (!newWorker.coordinates) {
      newWorker.coordinates = {
        x: 40 + Math.random() * 30,
        y: 35 + Math.random() * 30,
      };
    }

    currentResults = sortWorkers([...currentResults, newWorker], 'distance');
    renderWorkersList(currentResults);
    renderMap(currentResults);

    form.reset();
    showToast('Welcome to FixFleet! You now appear in nearby searches.');
  });
}

function setupBookingForm() {
  const form = $('#booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      showToast('Please select a professional before booking.');
      return;
    }
    const issue = $('#booking-issue')?.value.trim();
    const time = $('#booking-time')?.value;
    const phone = $('#booking-phone')?.value.trim();
    if (!issue || !time || !phone) {
      showToast('Please share the issue, time and your contact number.');
      return;
    }
    const worker = currentResults.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    try {
      await apiCreateBooking({
        workerId: worker.id,
        issue,
        time,
        phone,
      });
      showToast(
        `Booking request sent to ${worker.name.split(' ')[0]} – they will confirm shortly.`
      );
    } catch (_err) {
      showToast(
        `Booking simulated for ${worker.name.split(' ')[0]} (backend not reachable, demo mode).`
      );
    }
    form.reset();
  });
}

// Authentication state
let currentUser = null;

// Authentication functions
async function apiLoginEmail(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

async function apiSignupEmail(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error('Signup failed');
  return res.json();
}

async function apiSignupMobile(name, phone) {
  const res = await fetch(`${API_BASE}/auth/signup-mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone }),
  });
  if (!res.ok) throw new Error('Mobile signup failed');
  return res.json();
}

async function apiLoginMobile(phone) {
  const res = await fetch(`${API_BASE}/auth/login-mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error('Mobile login failed');
  return res.json();
}

async function apiVerifyOTP(phone, otp) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });
  if (!res.ok) throw new Error('OTP verification failed');
  return res.json();
}

async function apiGetGoogleAuthUrl() {
  const res = await fetch(`${API_BASE}/auth/google`);
  if (!res.ok) throw new Error('Failed to get Google auth URL');
  const data = await res.json();
  return data.authUrl;
}

async function apiGetFacebookAuthUrl() {
  const res = await fetch(`${API_BASE}/auth/facebook`);
  if (!res.ok) throw new Error('Failed to get Facebook auth URL');
  const data = await res.json();
  return data.authUrl;
}

function setUser(user, token = null) {
  currentUser = user;
  if (user) {
    localStorage.setItem('fixfleet_user', JSON.stringify(user));
    if (token) {
      localStorage.setItem('fixfleet_token', token);
    }
    updateNavForUser(user);
  } else {
    localStorage.removeItem('fixfleet_user');
    localStorage.removeItem('fixfleet_token');
    updateNavForGuest();
  }
}

function getUser() {
  if (currentUser) return currentUser;
  const stored = localStorage.getItem('fixfleet_user');
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  return null;
}

function getToken() {
  return localStorage.getItem('fixfleet_token');
}

// Handle OAuth callback from URL
function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userParam = urlParams.get('user');
  const error = urlParams.get('error');
  
  if (error) {
    showToast(`OAuth error: ${error}`);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  
  if (token && userParam) {
    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      setUser(user, token);
      showToast(`Welcome, ${user.name || user.email || 'User'}!`);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error('Failed to parse OAuth callback:', err);
    }
  }
}

function updateNavForUser(user) {
  const navCta = document.querySelector('.nav-cta');
  if (!navCta) return;
  
  const name = user.name || user.email || user.phone || 'User';
  const initial = name.charAt(0).toUpperCase();
  
  navCta.innerHTML = `
    <div class="user-profile" id="user-profile">
      <div class="user-avatar">${initial}</div>
      <span class="user-name">${name.split(' ')[0]}</span>
    </div>
    <button class="btn-3d btn-3d-signup" id="btn-logout">Logout</button>
  `;
  
  $('#btn-logout')?.addEventListener('click', () => {
    setUser(null);
    showToast('Logged out successfully');
  });
}

function updateNavForGuest() {
  const navCta = document.querySelector('.nav-cta');
  if (!navCta) return;
  
  navCta.innerHTML = `
    <button class="btn-3d btn-3d-login" id="btn-login">Login</button>
    <button class="btn-3d btn-3d-signup" id="btn-signup">Sign Up</button>
    <button class="btn ghost" id="switch-to-worker">I'm a worker</button>
    <button class="btn primary" id="switch-to-user">I need help</button>
  `;
  
  setupAuthButtons();
  setupRoleToggle(); // Re-setup role toggle buttons
}

function setupAuthModal() {
  const modal = $('#auth-modal');
  const closeBtn = $('#auth-modal-close');
  const backdrop = modal?.querySelector('.auth-modal-backdrop');
  
  // Close modal
  closeBtn?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });
  
  backdrop?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });
  
  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
      modal?.classList.add('hidden');
    }
  });
  
  // View switching
  document.querySelectorAll('.auth-link[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchAuthView(view);
    });
  });
  
  document.querySelectorAll('.auth-back[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchAuthView(view);
    });
  });
}

function switchAuthView(viewName) {
  document.querySelectorAll('.auth-view').forEach((v) => v.classList.remove('active'));
  const target = document.querySelector(`#auth-view-${viewName}`);
  if (target) target.classList.add('active');
}

function showAuthModal(view = 'login') {
  const modal = $('#auth-modal');
  if (!modal) return;
  
  switchAuthView(view);
  modal.classList.remove('hidden');
}

function setupAuthButtons() {
  $('#btn-login')?.addEventListener('click', () => {
    showAuthModal('login');
  });
  
  $('#btn-signup')?.addEventListener('click', () => {
    showAuthModal('signup');
  });
}

function setupAuthForms() {
  // Email Login
  $('#login-form-email')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#login-email')?.value.trim();
    const password = $('#login-password')?.value;
    
    if (!email || !password) {
      showToast('Please enter email and password');
      return;
    }
    
    try {
      const result = await apiLoginEmail(email, password);
      setUser(result.user || result, result.token);
      $('#auth-modal')?.classList.add('hidden');
      showToast(`Welcome back, ${(result.user || result).name || email}!`);
      e.target.reset();
    } catch (err) {
      showToast('Login failed. Please check your credentials.');
    }
  });
  
  // Email Signup
  $('#signup-form-email')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#signup-name')?.value.trim();
    const email = $('#signup-email')?.value.trim();
    const password = $('#signup-password')?.value;
    
    if (!name || !email || !password) {
      showToast('Please fill all fields');
      return;
    }
    
    if (password.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    
    try {
      const result = await apiSignupEmail(name, email, password);
      setUser(result.user || result, result.token);
      $('#auth-modal')?.classList.add('hidden');
      showToast(`Welcome to FixFleet, ${name}!`);
      e.target.reset();
    } catch (err) {
      showToast('Signup failed. Email may already be registered.');
    }
  });
  
  // Mobile Signup
  $('#signup-form-mobile')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#mobile-signup-name')?.value.trim();
    const phone = $('#mobile-signup-number')?.value.trim();
    
    if (!name || !phone) {
      showToast('Please enter name and mobile number');
      return;
    }
    
    try {
      const result = await apiSignupMobile(name, phone);
      showToast(result.demo ? `[DEMO] OTP would be: ${result.otp || '123456'}` : `OTP sent to ${phone}. Check your messages!`);
      // Store phone and name for OTP verification
      window.pendingMobileAuth = { phone, name, isSignup: true };
      // Switch to OTP verification view
      switchAuthView('mobile-otp');
      e.target.reset();
    } catch (err) {
      showToast('Failed to send OTP. Please try again.');
    }
  });
  
  // Mobile Login
  $('#login-form-mobile')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = $('#mobile-login-number')?.value.trim();
    
    if (!phone) {
      showToast('Please enter your mobile number');
      return;
    }
    
    try {
      const result = await apiLoginMobile(phone);
      showToast(result.demo ? `[DEMO] OTP would be: ${result.otp || '123456'}` : `OTP sent to ${phone}. Check your messages!`);
      // Store phone for OTP verification
      window.pendingMobileAuth = { phone, isSignup: false };
      // Switch to OTP verification view
      switchAuthView('mobile-otp');
      e.target.reset();
    } catch (err) {
      showToast('Failed to send OTP. Please try again.');
    }
  });
  
  // Social Login Buttons - Real OAuth
  document.querySelectorAll('#login-google, #signup-google').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const authUrl = await apiGetGoogleAuthUrl();
        // Redirect to Google OAuth
        window.location.href = authUrl;
      } catch (err) {
        showToast('Google sign-in unavailable. Check backend configuration.');
      }
    });
  });
  
  document.querySelectorAll('#login-facebook, #signup-facebook').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        const authUrl = await apiGetFacebookAuthUrl();
        // Redirect to Facebook OAuth
        window.location.href = authUrl;
      } catch (err) {
        showToast('Facebook sign-in unavailable. Check backend configuration.');
      }
    });
  });
  
  document.querySelectorAll('#login-mobile, #signup-mobile').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.id.includes('login')) {
        showAuthModal('mobile-login');
      } else {
        showAuthModal('mobile');
      }
    });
  });
  
  // OTP Input - Only allow numbers
  $('#otp-input')?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });
  
  // OTP Verification Form
  $('#verify-otp-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = $('#otp-input')?.value.trim();
    const pending = window.pendingMobileAuth;
    
    if (!otp || otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP');
      return;
    }
    
    if (!pending || !pending.phone) {
      showToast('Session expired. Please try again.');
      switchAuthView(pending?.isSignup ? 'mobile' : 'mobile-login');
      return;
    }
    
    try {
      const result = await apiVerifyOTP(pending.phone, otp);
      setUser(result.user, result.token);
      $('#auth-modal')?.classList.add('hidden');
      showToast(`Welcome${pending.isSignup ? ' to FixFleet' : ' back'}, ${result.user.name || 'User'}!`);
      window.pendingMobileAuth = null;
      e.target.reset();
    } catch (err) {
      showToast('Invalid OTP. Please try again.');
    }
  });
  
  // Resend OTP
  $('#resend-otp-btn')?.addEventListener('click', async () => {
    const pending = window.pendingMobileAuth;
    if (!pending || !pending.phone) {
      showToast('Session expired. Please try again.');
      return;
    }
    
    try {
      if (pending.isSignup) {
        await apiSignupMobile(pending.name, pending.phone);
      } else {
        await apiLoginMobile(pending.phone);
      }
      showToast('OTP resent! Check your messages.');
    } catch (err) {
      showToast('Failed to resend OTP. Please try again.');
    }
  });
  
  // OTP back button
  $('#otp-back-btn')?.addEventListener('click', () => {
    const pending = window.pendingMobileAuth;
    if (pending?.isSignup) {
      switchAuthView('mobile');
    } else {
      switchAuthView('mobile-login');
    }
  });
  
  // Update OTP phone display
  function updateOTPPhoneDisplay() {
    const pending = window.pendingMobileAuth;
    const display = $('#otp-phone-display');
    if (display && pending) {
      display.textContent = `Enter the 6-digit code sent to ${pending.phone}`;
    }
  }
  
  // Watch for OTP view activation
  const otpObserver = new MutationObserver(() => {
    if (document.querySelector('#auth-view-mobile-otp')?.classList.contains('active')) {
      updateOTPPhoneDisplay();
    }
  });
  
  const otpView = document.querySelector('#auth-view-mobile-otp');
  if (otpView) {
    otpObserver.observe(otpView, { attributes: true, attributeFilter: ['class'] });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Handle OAuth callback first
  handleOAuthCallback();
  
  setupSmoothScroll();
  setupRoleToggle();
  setupUrgencyPills();
  setupLocationButtons();
  setupServiceCards();
  setupSorting();
  setupSearchForm();
  setupWorkerRegistration();
  setupBookingForm();
  setupAuthModal();
  setupAuthButtons();
  setupAuthForms();
  
  // Check if user is already logged in
  const user = getUser();
  if (user) {
    updateNavForUser(user);
  } else {
    updateNavForGuest();
  }

  // Try to hydrate from backend, otherwise fall back to local demo data
  (async () => {
    try {
      const apiWorkers = await apiGetWorkers({ sortBy: 'distance' });
      currentResults = apiWorkers.map((w) => ({
        ...w,
        coordinates: {
          x: 40 + Math.random() * 30,
          y: 35 + Math.random() * 30,
        },
      }));
    } catch (_err) {
      currentResults = sortWorkers(demoWorkers, 'distance');
      currentResults = currentResults.map((w) => ({
        ...w,
        coordinates: w.coordinates || {
          x: 40 + Math.random() * 30,
          y: 35 + Math.random() * 30,
        },
      }));
    }
    renderWorkersList(currentResults);
    renderMap(currentResults);
  })();
});


