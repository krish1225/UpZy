// ============================================
// STEP CHALLENGE APP - CORE LOGIC
// ============================================

// Configuration
const CONFIG = {
  ADMIN_PASSWORD: 'admin123', // Change this to your password
  CHALLENGE_DURATION: 30,
  CHALLENGE_START_DATE: new Date().toISOString().split('T')[0]
};

// Application State
let appState = {
  currentUser: null,
  isAdmin: false,
  submissions: [],
  participants: [],
  inviteCodes: {},
  userPasswords: {} // Store user passwords
};

// Notification System
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.style.display = 'none';
      notification.classList.remove('hide');
    }, 300);
  }, 3000);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initializing...');
  loadAppState();
  setupEventListeners();
  
  showPage('home');
  updateDateTime();
  console.log('App initialized');
});

// Load state from localStorage
function loadAppState() {
  const saved = localStorage.getItem('stepChallengeState');
  if (saved) {
    appState = JSON.parse(saved);
  } else {
    saveAppState();
  }
}

// Save state to localStorage
function saveAppState() {
  localStorage.setItem('stepChallengeState', JSON.stringify(appState));
}

// Setup Event Listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  console.log('Found nav links:', navLinks.length);
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      console.log('Nav click:', page);
      
      // Check permissions
      if (page === 'home') {
        showPage(page);
      } else if (page === 'admin') {
        // Admin page - redirect to login if not admin
        if (appState.isAdmin) {
          showPage(page);
        } else {
          showPage('admin-login');
        }
      } else if (page === 'admin-login') {
        showPage(page);
      } else if (appState.currentUser || appState.isAdmin) {
        showPage(page);
      } else {
        showNotification('Please join or login first', 'error');
      }
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Login/Signup Forms
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // Forgot Password Form
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  }

  // Join with Code Form
  const joinWithCodeForm = document.getElementById('joinWithCodeForm');
  if (joinWithCodeForm) {
    joinWithCodeForm.addEventListener('submit', handleJoinWithCode);
  }

  // Admin Login Form
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
  }

  // Setup Password Form
  const setupPasswordForm = document.getElementById('setupPasswordForm');
  if (setupPasswordForm) {
    setupPasswordForm.addEventListener('submit', handleSetupPassword);
  }

  // Submit Form
  const submitForm = document.getElementById('submitForm');
  if (submitForm) {
    submitForm.addEventListener('submit', handleSubmission);
  }

  // Invite Form
  const inviteForm = document.getElementById('inviteForm');
  if (inviteForm) {
    inviteForm.addEventListener('submit', handleGenerateInvite);
  }

  // Leaderboard Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  console.log('Found tab buttons:', tabBtns.length);
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const tab = this.getAttribute('data-tab');
      console.log('Tab click:', tab);
      switchTab(tab);
    });
  });

  // Set today's date as default
  const dateInput = document.getElementById('dateInput');
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
  
  console.log('Event listeners setup complete');
}

// Page Navigation
function showPage(pageName) {
  console.log('Switching to page:', pageName);
  
  // Hide all pages
  const allPages = document.querySelectorAll('.page');
  console.log('Found pages:', allPages.length);
  allPages.forEach(page => {
    page.style.display = 'none';
    page.classList.remove('active');
  });

  // Show selected page
  const pageSelector = pageName.startsWith('page-') ? pageName : `page-${pageName}`;
  const targetPage = document.getElementById(pageSelector);
  
  if (targetPage) {
    targetPage.style.display = 'block';
    targetPage.classList.add('active');
    console.log('Showing page:', pageSelector);
  } else {
    console.error('Page not found:', pageSelector);
    // Show home as fallback
    const homePage = document.getElementById('page-home');
    if (homePage) {
      homePage.style.display = 'block';
      homePage.classList.add('active');
    }
    return;
  }

  // Update navigation highlight
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === pageName) {
      link.classList.add('active');
    }
  });

  // Update UI based on auth state
  updateUIState();

  // Load page-specific data
  if (pageName === 'login-signup') {
    switchAuthTab('login');
  } else if (pageName === 'dashboard' && appState.currentUser) {
    updateDashboard();
  } else if (pageName === 'leaderboard') {
    updateLeaderboard();
  } else if (pageName === 'admin') {
    if (!appState.isAdmin) {
      showNotification('Admin access required', 'error');
      showPage('home');
      return;
    }
    updateAdminPanel().catch(err => console.error('Error loading admin panel:', err));
  }
}

// Update UI based on authentication
function updateUIState() {
  const logoutBtn = document.getElementById('logoutBtn');
  const navLinks = document.getElementById('navLinks');

  if (appState.currentUser || appState.isAdmin) {
    logoutBtn.style.display = 'block';
  } else {
    logoutBtn.style.display = 'none';
  }

  if (appState.currentUser) {
    document.querySelectorAll('[data-page="dashboard"]').forEach(el => el.style.display = '');
    document.querySelectorAll('[data-page="leaderboard"]').forEach(el => el.style.display = '');
  }

  if (appState.isAdmin) {
    document.querySelectorAll('[data-page="admin"]').forEach(el => el.style.display = '');
  }
}

// ============================================
// AUTHENTICATION
// ============================================

// Tab switching for login/signup/forgot
function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotForm = document.getElementById('forgotPasswordForm');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    forgotForm.style.display = 'none';
  } else if (tab === 'signup') {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    forgotForm.style.display = 'none';
  } else if (tab === 'forgot') {
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    forgotForm.style.display = 'block';
  }
}

// Handle login
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Check email and password against Supabase
  supabase.getUser(email).then(user => {
    if (!user) {
      showNotification('Email not found. Please sign up first.', 'error');
      return;
    }

    if (user.password !== password) {
      showNotification('Incorrect password', 'error');
      return;
    }

    // Login successful
    appState.currentUser = email;
    appState.isAdmin = user.is_admin || false;
    saveAppState();
    updateUIState();

    showNotification('✅ Login successful!', 'success');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';

    // Go to invite code page
    setTimeout(() => {
      document.getElementById('joinCodeEmail').value = email;
      showPage('join-with-code');
    }, 500);
  }).catch(err => {
    console.error('Login error:', err);
    showNotification('Login failed. Please try again.', 'error');
  });
}

// Handle signup
function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

  if (password !== passwordConfirm) {
    showNotification('Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }

  // Check if email already exists in Supabase
  supabase.getUser(email).then(user => {
    if (user) {
      showNotification('Email already exists. Please login instead.', 'error');
      return;
    }

    // Create account in Supabase
    supabase.createUser(email, password).then(result => {
      appState.currentUser = email;
      appState.isAdmin = false;
      saveAppState();
      updateUIState();

      showNotification('✅ Account created successfully!', 'success');
      document.getElementById('signupEmail').value = '';
      document.getElementById('signupPassword').value = '';
      document.getElementById('signupPasswordConfirm').value = '';

      // Go to invite code page
      setTimeout(() => {
        document.getElementById('joinCodeEmail').value = email;
        showPage('join-with-code');
      }, 500);
    }).catch(err => {
      console.error('Signup error:', err);
      showNotification('Signup failed. Please try again.', 'error');
    });
  }).catch(err => {
    console.error('Error checking email:', err);
    showNotification('Error creating account. Please try again.', 'error');
  });
}

// Handle forgot password
function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  const password = document.getElementById('forgotPassword').value;
  const passwordConfirm = document.getElementById('forgotPasswordConfirm').value;

  if (password !== passwordConfirm) {
    showNotification('Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }

  // Check if email exists in Supabase and update password
  supabase.getUser(email).then(user => {
    if (!user) {
      showNotification('Email not found. Please sign up first.', 'error');
      return;
    }

    // Update password in Supabase
    supabase.updateUserPassword(email, password).then(result => {
      showNotification('✅ Password reset successfully!', 'success');
      document.getElementById('forgotEmail').value = '';
      document.getElementById('forgotPassword').value = '';
      document.getElementById('forgotPasswordConfirm').value = '';

      // Go back to login
      setTimeout(() => {
        switchAuthTab('login');
      }, 500);
    }).catch(err => {
      console.error('Password reset error:', err);
      showNotification('Failed to reset password. Please try again.', 'error');
    });
  }).catch(err => {
    console.error('Error checking email:', err);
    showNotification('Error resetting password. Please try again.', 'error');
  });
}

// Handle join with invite code
async function handleJoinWithCode(e) {
  e.preventDefault();
  const email = document.getElementById('joinCodeEmail').value.trim();
  const inviteCode = document.getElementById('joinCodeInput').value.trim().toUpperCase();

  try {
    // Verify invite code with Supabase
    const validInvite = await supabase.getInviteCode(inviteCode);
    
    if (!validInvite) {
      showNotification('Invalid invite code. Please check and try again.', 'error');
      return;
    }

    // Try to add participant to Supabase (ignore if already exists)
    try {
      await supabase.addParticipant(email);
    } catch (error) {
      // Ignore duplicate key error - user already exists
      if (!error.message.includes('duplicate')) {
        throw error;
      }
    }
    
    appState.currentUser = email;
    saveAppState();
    updateUIState();
    
    showNotification('✅ Successfully joined the challenge!', 'success');
    document.getElementById('joinCodeInput').value = '';
    
    setTimeout(() => {
      showPage('dashboard');
    }, 500);
  } catch (error) {
    console.error('Join error:', error);
    showNotification('Error joining challenge. Please try again.', 'error');
  }
}

async function handleJoin(e) {
  e.preventDefault();
  const email = document.getElementById('joinEmail').value.trim();
  const inviteCode = document.getElementById('inviteCode').value.trim().toUpperCase();

  try {
    // Verify invite code with Supabase
    const validInvite = await supabase.getInviteCode(inviteCode);
    
    if (!validInvite) {
      showNotification('Invalid invite code. Please check and try again.', 'error');
      return;
    }

    // Initialize userPasswords if not exists
    if (!appState.userPasswords) {
      appState.userPasswords = {};
    }

    // Check if this is a new user (first join)
    const isNewUser = !appState.userPasswords[email];

    // Try to add participant to Supabase (ignore if already exists)
    try {
      await supabase.addParticipant(email);
    } catch (error) {
      // Ignore duplicate key error - user already exists
      if (!error.message.includes('duplicate')) {
        throw error;
      }
    }
    
    appState.currentUser = email;
    saveAppState();
    updateUIState();

    if (isNewUser) {
      // First time login - show password setup
      document.getElementById('setupEmail').value = email;
      document.getElementById('setupPasswordForm').reset();
      showPage('setup-password');
    } else {
      // Returning user - go to dashboard
      showNotification('✅ Welcome back!', 'success');
      document.getElementById('joinEmail').value = '';
      document.getElementById('inviteCode').value = '';
      showPage('dashboard');
    }
  } catch (error) {
    console.error('Join error:', error);
    showNotification('Error joining challenge. Please try again.', 'error');
  }
}

function handleAdminLogin(e) {
  e.preventDefault();
  const password = document.getElementById('adminPassword').value;

  if (password === CONFIG.ADMIN_PASSWORD) {
    appState.isAdmin = true;
    saveAppState();
    updateUIState();
    document.getElementById('adminPassword').value = '';
    showNotification('✅ Admin access granted', 'success');
    showPage('admin');
  } else {
    showNotification('Incorrect password', 'error');
  }
}

function logout() {
  // Clear auth state
  appState.currentUser = null;
  appState.isAdmin = false;
  saveAppState();
  updateUIState();
  showPage('home');
}

function handleSetupPassword(e) {
  e.preventDefault();
  const email = document.getElementById('setupEmail').value;
  const password = document.getElementById('setupPassword').value;
  const passwordConfirm = document.getElementById('setupPasswordConfirm').value;

  if (password !== passwordConfirm) {
    showNotification('Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }

  // Store password (in production, this should be hashed on server)
  appState.userPasswords[email] = password;
  saveAppState();

  showNotification('✅ Password set successfully!', 'success');
  document.getElementById('setupPasswordForm').reset();
  
  // Go to dashboard
  setTimeout(() => {
    showPage('dashboard');
  }, 500);
}

// ============================================
// DASHBOARD
// ============================================

function updateDashboard() {
  if (!appState.currentUser) return;

  const email = appState.currentUser;
  document.getElementById('userNameDisplay').textContent = email.split('@')[0];

  // Calculate stats
  const userSubmissions = appState.submissions.filter(s => s.email === email);
  const totalSteps = userSubmissions.reduce((sum, s) => sum + s.steps, 0);
  const totalCalories = userSubmissions.reduce((sum, s) => sum + s.calories, 0);
  const streak = calculateStreak(email);

  document.getElementById('totalSteps').textContent = totalSteps.toLocaleString();
  document.getElementById('totalCalories').textContent = totalCalories.toLocaleString();
  document.getElementById('streak').textContent = streak;

  // Calculate rank
  const rankings = calculateOverallRankings();
  const userRank = rankings.findIndex(r => r.email === email) + 1;
  document.getElementById('currentRank').textContent = userRank > 0 ? `#${userRank}` : '-';

  // Days remaining
  const startDate = new Date(CONFIG.CHALLENGE_START_DATE);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + CONFIG.CHALLENGE_DURATION);
  const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
  document.getElementById('daysRemaining').textContent = `${Math.max(0, daysRemaining)} days remaining`;
}

async function handleSubmission(e) {
  e.preventDefault();
  
  const steps = parseInt(document.getElementById('stepsInput').value);
  const calories = parseInt(document.getElementById('caloriesInput').value);
  const date = document.getElementById('dateInput').value;

  if (!appState.currentUser) {
    showNotification('Please login first', 'error');
    return;
  }

  try {
    // Save to Supabase (insert or update if exists)
    await supabase.upsertSubmission(appState.currentUser, date, steps, calories);
    
    // Also save locally
    const existing = appState.submissions.find(
      s => s.email === appState.currentUser && s.date === date
    );

    if (existing) {
      existing.steps = steps;
      existing.calories = calories;
    } else {
      appState.submissions.push({
        email: appState.currentUser,
        date,
        steps,
        calories
      });
    }

    saveAppState();
    showNotification('✅ Submission saved!', 'success');
    
    document.getElementById('submitForm').reset();
    const dateInput = document.getElementById('dateInput');
    dateInput.valueAsDate = new Date();
    
    updateDashboard();
  } catch (error) {
    console.error('Submission error:', error);
    showNotification('Error saving submission. Please try again.', 'error');
  }
}

// ============================================
// LEADERBOARD
// ============================================

function switchTab(tab) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
  });

  // Show selected tab
  document.getElementById(`tab-${tab}`).style.display = 'block';

  // Update active button
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    }
  });

  // Update leaderboard
  updateLeaderboard();
}

function updateLeaderboard() {
  updateDailyLeaderboard();
  updateWeeklyLeaderboard();
  updateOverallLeaderboard();
  updateProgressChart();
}

function updateDailyLeaderboard() {
  const today = new Date().toISOString().split('T')[0];
  const todaySubmissions = appState.submissions.filter(s => s.date === today);
  const dailyRankings = todaySubmissions
    .sort((a, b) => b.steps - a.steps)
    .slice(0, 10);

  renderLeaderboard('dailyLeaderboard', dailyRankings, 'steps');
}

function updateWeeklyLeaderboard() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  const weeklySubmissions = appState.submissions.filter(
    s => s.date >= weekAgoStr
  );

  const weeklyByEmail = {};
  weeklySubmissions.forEach(s => {
    if (!weeklyByEmail[s.email]) {
      weeklyByEmail[s.email] = { email: s.email, steps: 0, calories: 0 };
    }
    weeklyByEmail[s.email].steps += s.steps;
    weeklyByEmail[s.email].calories += s.calories;
  });

  const weeklyRankings = Object.values(weeklyByEmail)
    .sort((a, b) => b.steps - a.steps)
    .slice(0, 10);

  renderLeaderboard('weeklyLeaderboard', weeklyRankings, 'steps');
}

function updateOverallLeaderboard() {
  const rankings = calculateOverallRankings();
  renderLeaderboard('overallLeaderboard', rankings.slice(0, 10), 'steps');
}

function calculateOverallRankings() {
  const byEmail = {};
  appState.submissions.forEach(s => {
    if (!byEmail[s.email]) {
      byEmail[s.email] = { email: s.email, steps: 0, calories: 0 };
    }
    byEmail[s.email].steps += s.steps;
    byEmail[s.email].calories += s.calories;
  });

  return Object.values(byEmail).sort((a, b) => b.steps - a.steps);
}

function renderLeaderboard(elementId, rankings, metric = 'steps') {
  const container = document.getElementById(elementId);
  
  if (rankings.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No data yet</p>';
    return;
  }

  container.innerHTML = rankings.map((item, index) => `
    <div class="leaderboard-item">
      <div class="leaderboard-rank rank-${index + 1}">${getMedalEmoji(index + 1)} ${index + 1}</div>
      <div class="leaderboard-info">
        <div class="leaderboard-name">${item.email.split('@')[0]}</div>
        <div class="leaderboard-email">${item.email}</div>
      </div>
      <div class="leaderboard-score">
        <div class="leaderboard-value">${item[metric].toLocaleString()}</div>
        <div class="leaderboard-label">${metric === 'steps' ? 'Steps' : 'Calories'}</div>
      </div>
    </div>
  `).join('');
}

function getMedalEmoji(rank) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return medals[rank] || '🏃';
}

// ============================================
// ADMIN PANEL
// ============================================

async function handleGenerateInvite(e) {
  e.preventDefault();
  const email = document.getElementById('emailForInvite').value.trim();
  
  if (!email) return;

  try {
    const inviteCode = generateInviteCode();
    
    // Save to Supabase
    await supabase.addInviteCode(inviteCode, email);
    
    // Also save locally for quick reference
    appState.inviteCodes[inviteCode] = { email, createdAt: new Date().toISOString() };
    saveAppState();

    document.getElementById('inviteCodeDisplay').textContent = inviteCode;
    document.getElementById('emailDisplay').textContent = email;
    document.getElementById('generatedInvite').style.display = 'block';
    document.getElementById('emailForInvite').value = '';
  } catch (error) {
    console.error('Error generating invite:', error);
    showNotification('Error generating invite code. Please try again.', 'error');
  }
}

function copyInvite() {
  const code = document.getElementById('inviteCodeDisplay').textContent;
  navigator.clipboard.writeText(code);
  showNotification('✅ Invite code copied to clipboard!', 'success');
}

function generateInviteCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

function saveSettings() {
  const duration = document.getElementById('challengeDuration').value;
  const startDate = document.getElementById('challengeStartDate').value;

  CONFIG.CHALLENGE_DURATION = parseInt(duration);
  CONFIG.CHALLENGE_START_DATE = startDate || CONFIG.CHALLENGE_START_DATE;

  localStorage.setItem('challengeConfig', JSON.stringify(CONFIG));
  showNotification('✅ Settings saved!', 'success');
}

async function updateAdminPanel() {
  // Load settings
  document.getElementById('challengeDuration').value = CONFIG.CHALLENGE_DURATION;
  document.getElementById('challengeStartDate').value = CONFIG.CHALLENGE_START_DATE;

  // Load participants from Supabase
  try {
    const allSubmissions = await supabase.getSubmissions();
    const participantsList = document.getElementById('participantsList');

    if (!allSubmissions || allSubmissions.length === 0) {
      participantsList.innerHTML = '<p>No participants yet</p>';
      return;
    }

    // Group by email
    const byEmail = {};
    allSubmissions.forEach(submission => {
      if (!byEmail[submission.email]) {
        byEmail[submission.email] = { email: submission.email, steps: 0, submissions: 0 };
      }
      byEmail[submission.email].steps += submission.steps || 0;
      byEmail[submission.email].submissions += 1;
    });

    participantsList.innerHTML = Object.values(byEmail).map(participant => {
      return `
        <div class="participant-card">
          <div class="participant-email">${participant.email}</div>
          <div class="participant-status">${participant.submissions} submissions • ${participant.steps.toLocaleString()} steps</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading admin panel:', error);
    document.getElementById('participantsList').innerHTML = '<p>Error loading participants</p>';
  }
}

// ============================================
// UTILITIES
// ============================================

function calculateStreak(email) {
  let streak = 0;
  const submissions = appState.submissions.filter(s => s.email === email);
  
  if (submissions.length === 0) return 0;

  const dates = submissions.map(s => new Date(s.date)).sort((a, b) => b - a);
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const submissionDate of dates) {
    submissionDate.setHours(0, 0, 0, 0);
    const diffDays = (currentDate - submissionDate) / (1000 * 60 * 60 * 24);
    
    if (diffDays === streak) {
      streak++;
      currentDate = new Date(submissionDate);
    } else {
      break;
    }
  }

  return streak;
}

function updateDateTime() {
  setInterval(() => {
    // Update any time-dependent UI
  }, 60000);
}

function updateProgressChart() {
  const ctx = document.getElementById('progressChart');
  if (!ctx) return;

  const rankings = calculateOverallRankings();
  const top5 = rankings.slice(0, 5);

  if (window.progressChartInstance) {
    window.progressChartInstance.destroy();
  }

  window.progressChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top5.map(r => r.email.split('@')[0]),
      datasets: [
        {
          label: 'Total Steps',
          data: top5.map(r => r.steps),
          backgroundColor: '#4f46e5',
          borderColor: '#4338ca',
          borderWidth: 1
        },
        {
          label: 'Total Calories',
          data: top5.map(r => r.calories),
          backgroundColor: '#06b6d4',
          borderColor: '#0891b2',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

