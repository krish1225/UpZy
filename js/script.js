// ============================================
// STEP CHALLENGE APP - CORE LOGIC
// ============================================

// Configuration
const CONFIG = {
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
  userPasswords: {}, // Store user passwords
  challenges: [], // Store created challenges
  selectedChallengeFilter: null // Track selected challenge for leaderboard filtering
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
    // Ensure all required properties exist
    if (!appState.challenges) appState.challenges = [];
    if (!appState.submissions) appState.submissions = [];
    if (!appState.participants) appState.participants = [];
    if (!appState.inviteCodes) appState.inviteCodes = {};
    if (!appState.userPasswords) appState.userPasswords = {};
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
  
  // Navigation links (removed from UI, but keep code for reference)
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

  // Logout button (removed from UI, but keep code for reference)
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

  // Create Challenge Form
  const createChallengeForm = document.getElementById('createChallengeForm');
  if (createChallengeForm) {
    createChallengeForm.addEventListener('submit', handleCreateChallenge);
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

  // Admin Tabs
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const tab = this.getAttribute('data-admin-tab');
      switchAdminTab(tab);
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
  
  // Redirect to dashboard if user clicks 'home' while logged in
  if (pageName === 'home' && (appState.currentUser || appState.isAdmin)) {
    pageName = 'dashboard';
  }
  
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
  } else if (pageName === 'home') {
    // Show leaderboard on home page for logged-in users
    showHomeContent();
  } else if (pageName === 'dashboard' && appState.currentUser) {
    updateDashboard();
  } else if (pageName === 'leaderboard') {
    loadLeaderboardPage();
  } else if (pageName === 'admin') {
    if (!appState.isAdmin) {
      showNotification('Admin access required', 'error');
      showPage('home');
      return;
    }
    updateAdminPanel().catch(err => console.error('Error loading admin panel:', err));
  }
}

// Show appropriate content on home page
function showHomeContent() {
  const heroSection = document.getElementById('hero-section');
  const leaderboardSection = document.getElementById('leaderboard-section');

  if (appState.currentUser || appState.isAdmin) {
    // Hide hero, show leaderboard
    if (heroSection) heroSection.style.display = 'none';
    if (leaderboardSection) leaderboardSection.style.display = 'block';
    updateLeaderboard().catch(err => console.error('Error loading leaderboard:', err));
  } else {
    // Show hero, hide leaderboard
    if (heroSection) heroSection.style.display = 'block';
    if (leaderboardSection) leaderboardSection.style.display = 'none';
  }
}

// Update UI based on authentication
function updateUIState() {
  // Update bottom navigation based on auth state
  const leaderboardNav = document.getElementById('leaderboardNav');
  const adminNav = document.getElementById('adminNav');
  const logoutNavBtn = document.getElementById('logoutNavBtn');

  if (appState.currentUser) {
    // Show leaderboard and logout for logged-in users
    if (leaderboardNav) leaderboardNav.style.display = 'flex';
    if (logoutNavBtn) logoutNavBtn.style.display = 'flex';
    
    document.querySelectorAll('[data-page="dashboard"]').forEach(el => el.style.display = '');
    document.querySelectorAll('[data-page="leaderboard"]').forEach(el => el.style.display = '');
  } else {
    // Hide leaderboard and logout for non-logged-in users
    if (leaderboardNav) leaderboardNav.style.display = 'none';
    if (logoutNavBtn) logoutNavBtn.style.display = 'none';
  }

  if (appState.isAdmin) {
    // Show admin for admins
    if (adminNav) adminNav.style.display = 'flex';
    document.querySelectorAll('[data-page="admin"]').forEach(el => el.style.display = '');
  } else {
    // Hide admin for non-admins
    if (adminNav) adminNav.style.display = 'none';
  }

  // Update home page leaderboard visibility
  const homePage = document.getElementById('page-home');
  if (homePage && homePage.style.display !== 'none') {
    showHomeContent();
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

    // Go to dashboard/activity submission page
    setTimeout(() => {
      document.getElementById('userNameDisplay').textContent = email.split('@')[0];
      showPage('dashboard');
      loadUserStats();
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

  // Check if email already exists as a user in Supabase
  supabase.getUser(email).then(user => {
    if (user) {
      showNotification('Email already has an account. Please login instead.', 'error');
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

      // Go to dashboard (or home if not a participant yet)
      setTimeout(() => {
        showPage('home');
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

  // Check if email exists in Supabase
  supabase.getUser(email).then(user => {
    if (user) {
      // User exists, update password
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
    } else {
      // User doesn't exist, create account with this password
      supabase.createUser(email, password).then(result => {
        showNotification('✅ Account created successfully! You can now login.', 'success');
        document.getElementById('forgotEmail').value = '';
        document.getElementById('forgotPassword').value = '';
        document.getElementById('forgotPasswordConfirm').value = '';

        // Go back to login
        setTimeout(() => {
          switchAuthTab('login');
        }, 500);
      }).catch(err => {
        console.error('Account creation error:', err);
        showNotification('Error creating account. Please try again.', 'error');
      });
    }
  }).catch(err => {
    console.error('Error checking email:', err);
    showNotification('Error processing request. Please try again.', 'error');
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

    // Check if user already exists
    const existingUser = await supabase.getUser(email);
    
    if (!existingUser) {
      // Generate temporary password for new user
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create user in Supabase
      try {
        await supabase.createUser(email, tempPassword);
      } catch (error) {
        // User might already exist, continue
        console.log('User creation note:', error);
      }
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
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;

  // Check credentials against Supabase
  supabase.getUser(email).then(user => {
    if (!user) {
      showNotification('Email not found', 'error');
      return;
    }

    if (user.password !== password) {
      showNotification('Incorrect password', 'error');
      return;
    }

    if (!user.is_admin) {
      showNotification('Admin access denied', 'error');
      return;
    }

    // Admin login successful
    appState.currentUser = email;
    appState.isAdmin = true;
    saveAppState();
    updateUIState();
    document.getElementById('adminEmail').value = '';
    document.getElementById('adminPassword').value = '';
    showNotification('✅ Admin access granted', 'success');
    showPage('admin');
  }).catch(err => {
    console.error('Admin login error:', err);
    showNotification('Login failed. Please try again.', 'error');
  });
}

function logout() {
  // Clear auth state
  appState.currentUser = null;
  appState.isAdmin = false;
  saveAppState();
  updateUIState();
  showPage('home');
  showHomeContent();
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

async function updateDashboard() {
  if (!appState.currentUser) return;

  const email = appState.currentUser;
  document.getElementById('userNameDisplay').textContent = email.split('@')[0];

  // Set today's date in the date input
  const dateInput = document.getElementById('dateInput');
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }

  try {
    // Fetch user submissions from Supabase
    const userSubmissions = await supabase.getUserSubmissions(email);
    
    const totalSteps = userSubmissions.reduce((sum, s) => sum + (s.steps || 0), 0);
    const totalCalories = userSubmissions.reduce((sum, s) => sum + (s.calories || 0), 0);
    
    // Calculate streak based on submissions
    const streak = calculateStreak(email, userSubmissions);

    document.getElementById('totalSteps').textContent = totalSteps.toLocaleString();
    document.getElementById('totalCalories').textContent = totalCalories.toLocaleString();
    document.getElementById('streak').textContent = streak;

    // Calculate rank - fetch all submissions from Supabase
    const allSubmissions = await supabase.getSubmissions();
    const rankings = calculateOverallRankings(allSubmissions);
    const userRank = rankings.findIndex(r => r.email === email) + 1;
    document.getElementById('currentRank').textContent = userRank > 0 ? `#${userRank}` : '-';

    // Days remaining
    const startDate = new Date(CONFIG.CHALLENGE_START_DATE);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + CONFIG.CHALLENGE_DURATION);
    const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    document.getElementById('daysRemaining').textContent = `${Math.max(0, daysRemaining)} days remaining`;
  } catch (error) {
    console.error('Error updating dashboard:', error);
    showNotification('Error loading dashboard data', 'error');
  }
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

function switchAdminTab(tab) {
  // Hide all admin tabs
  document.querySelectorAll('.admin-tab-content').forEach(content => {
    content.classList.remove('active');
    content.style.display = 'none';
  });

  // Show selected admin tab
  const adminTab = document.getElementById(`admin-tab-${tab}`);
  if (adminTab) {
    adminTab.classList.add('active');
    adminTab.style.display = 'block';
  }

  // Update active button
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.adminTab === tab) {
      btn.classList.add('active');
    }
  });

  // Load content for specific tabs
  if (tab === 'participants') {
    loadParticipants();
  } else if (tab === 'challenges') {
    loadChallengesTable();
  }
}

async function loadLeaderboardPage() {
  // Load and display leaderboard on the dedicated leaderboard page
  
  // Show challenge selector for logged-in users
  if (appState.currentUser) {
    const challengeSelector = document.getElementById('challengeSelector');
    if (challengeSelector) challengeSelector.style.display = 'block';
    
    // Populate challenges dropdown
    await populateLeaderboardChallengesDropdown();
  }
  
  await updateLeaderboard();
  setupLeaderboardTabs();
}

async function updateLeaderboard() {
  await updateDailyLeaderboard();
  await updateWeeklyLeaderboard();
  await updateOverallLeaderboard();
  await updateProgressChart();
}

function setupLeaderboardTabs() {
  // Setup tab switching for leaderboard page
  const tabButtons = document.querySelectorAll('#page-leaderboard .tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      
      // Hide all tabs
      document.querySelectorAll('#page-leaderboard .tab-content').forEach(tab => {
        tab.style.display = 'none';
      });
      
      // Remove active class from all buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      
      // Show selected tab
      const selectedTab = document.getElementById('page-leaderboard').querySelector(`#tab-${tabName}`);
      if (selectedTab) {
        selectedTab.style.display = 'block';
      }
      
      // Add active class to clicked button
      this.classList.add('active');
    });
  });
}

async function updateDailyLeaderboard() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allSubmissions = await supabase.getSubmissions();
    
    // Filter by challenge if selected
    let submissions = allSubmissions;
    if (appState.selectedChallengeFilter) {
      const challengeUsers = await supabase.getChallengeParticipants(appState.selectedChallengeFilter);
      const userEmails = challengeUsers.map(u => u.email);
      submissions = submissions.filter(s => userEmails.includes(s.email));
    }
    
    const todaySubmissions = submissions.filter(s => {
      const submissionDate = (s.submission_date || s.date).split('T')[0];
      return submissionDate === today;
    });
    const dailyRankings = todaySubmissions
      .sort((a, b) => (b.steps || 0) - (a.steps || 0))
      .slice(0, 10);

    renderLeaderboard('dailyLeaderboard', dailyRankings, 'steps');
  } catch (error) {
    console.error('Error updating daily leaderboard:', error);
  }
}

async function updateWeeklyLeaderboard() {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const allSubmissions = await supabase.getSubmissions();
    
    // Filter by challenge if selected
    let submissions = allSubmissions;
    if (appState.selectedChallengeFilter) {
      const challengeUsers = await supabase.getChallengeParticipants(appState.selectedChallengeFilter);
      const userEmails = challengeUsers.map(u => u.email);
      submissions = submissions.filter(s => userEmails.includes(s.email));
    }
    
    const weeklySubmissions = submissions.filter(s => {
      const submissionDate = (s.submission_date || s.date).split('T')[0];
      return submissionDate >= weekAgoStr;
    });

    const weeklyByEmail = {};
    weeklySubmissions.forEach(s => {
      if (!weeklyByEmail[s.email]) {
        weeklyByEmail[s.email] = { email: s.email, steps: 0, calories: 0 };
      }
      weeklyByEmail[s.email].steps += (s.steps || 0);
      weeklyByEmail[s.email].calories += (s.calories || 0);
    });

    const weeklyRankings = Object.values(weeklyByEmail)
      .sort((a, b) => b.steps - a.steps)
      .slice(0, 10);

    renderLeaderboard('weeklyLeaderboard', weeklyRankings, 'steps');
  } catch (error) {
    console.error('Error updating weekly leaderboard:', error);
  }
}

async function updateOverallLeaderboard() {
  try {
    const allSubmissions = await supabase.getSubmissions();
    
    // Filter by challenge if selected
    let submissions = allSubmissions;
    if (appState.selectedChallengeFilter) {
      const challengeUsers = await supabase.getChallengeParticipants(appState.selectedChallengeFilter);
      const userEmails = challengeUsers.map(u => u.email);
      submissions = submissions.filter(s => userEmails.includes(s.email));
    }
    
    const rankings = calculateOverallRankings(submissions);
    renderLeaderboard('overallLeaderboard', rankings.slice(0, 10), 'steps');
  } catch (error) {
    console.error('Error updating overall leaderboard:', error);
  }
}

function calculateOverallRankings(submissions = null) {
  const data = submissions || appState.submissions;
  const byEmail = {};
  data.forEach(s => {
    if (!byEmail[s.email]) {
      byEmail[s.email] = { email: s.email, steps: 0, calories: 0 };
    }
    byEmail[s.email].steps += (s.steps || 0);
    byEmail[s.email].calories += (s.calories || 0);
  });

  return Object.values(byEmail).sort((a, b) => b.steps - a.stats);
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

// Handle Create Challenge
async function handleCreateChallenge(e) {
  e.preventDefault();
  
  const name = document.getElementById('challengeName').value.trim();
  const duration = parseInt(document.getElementById('newChallengeDuration').value);
  const startDate = document.getElementById('newChallengeStartDate').value;
  const description = document.getElementById('challengeDescription').value.trim();
  
  if (!name || !startDate) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  try {
    // Ensure challenges array exists
    if (!appState.challenges) appState.challenges = [];
    
    // Create in local state
    const challenge = {
      id: Date.now().toString(),
      name,
      duration,
      startDate,
      description,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    appState.challenges.push(challenge);
    saveAppState();
    
    // Also save to Supabase
    try {
      await supabase.createChallenge(name, duration, startDate, description);
    } catch (supabaseError) {
      console.warn('Supabase save failed, but local save succeeded:', supabaseError);
    }
    
    showNotification('✅ Challenge created successfully!', 'success');
    
    // Reset form
    const form = document.getElementById('createChallengeForm');
    if (form) form.reset();
    
    // Close the modal
    closeCreateChallengeModal();
    
    // Reload challenges list and table
    loadChallengesTable();
  } catch (error) {
    console.error('Error creating challenge:', error);
    showNotification('Error creating challenge', 'error');
  }
}

// Load and display challenges in a table
async function loadChallengesTable() {
  const tableBody = document.getElementById('challengesTableBody');
  
  if (!tableBody) return;
  
  try {
    // Fetch from Supabase first, fallback to local state
    let challenges = [];
    try {
      challenges = await supabase.getChallenges();
    } catch (err) {
      console.warn('Supabase fetch failed, using local challenges:', err);
      challenges = appState.challenges;
    }
    
    if (!challenges || challenges.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">No challenges created yet</td></tr>';
      updateChallengeStats(0, 0);
      return;
    }
    
    // Fetch enrolled users for each challenge
    let totalEnrolled = 0;
    const rows = [];
    
    for (const challenge of challenges) {
      try {
        // Get enrolled users count for this challenge
        let enrolledCount = 0;
        try {
          const participants = await supabase.getChallengeParticipants(challenge.id || challenge.name);
          enrolledCount = participants ? participants.length : 0;
          console.log(`Challenge ${challenge.name}: ${enrolledCount} users`);
        } catch (err) {
          console.warn(`Failed to get participants for challenge ${challenge.id}:`, err);
          enrolledCount = 0;
        }
        
        totalEnrolled += enrolledCount;
        
        const startDate = new Date(challenge.start_date || challenge.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (challenge.duration || 30));
        
        rows.push(`
          <tr>
            <td><strong>${challenge.name}</strong></td>
            <td>${challenge.duration || 30} days</td>
            <td>${startDate.toLocaleDateString()}</td>
            <td>${endDate.toLocaleDateString()}</td>
            <td><span class="status-badge">${enrolledCount}</span></td>
            <td><span class="status-badge status-${challenge.status || 'active'}">${(challenge.status || 'active').charAt(0).toUpperCase() + (challenge.status || 'active').slice(1)}</span></td>
            <td>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button onclick="openAssignUsersModal('${challenge.id || challenge.name}', '${challenge.name}')" class="btn btn-small" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Assign</button>
                <button onclick="openEditChallengeModal('${challenge.id || challenge.name}', '${challenge.name}', ${challenge.duration || 30}, '${challenge.start_date || challenge.startDate}', '${(challenge.description || '').replace(/'/g, "\\'")}', '${challenge.status || 'active'}')" class="btn btn-small" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Edit</button>
                <button onclick="openViewUsersModal('${challenge.id || challenge.name}', '${challenge.name}')" class="btn btn-small" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Users</button>
              </div>
            </td>
          </tr>
        `);
      } catch (error) {
        console.error(`Error loading challenge ${challenge.name}:`, error);
      }
    }
    
    // Set the table HTML with all rows
    tableBody.innerHTML = rows.join('');
    updateChallengeStats(challenges.length, totalEnrolled);
  } catch (error) {
    console.error('Error loading challenges table:', error);
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error loading challenges</td></tr>';
  }
}

// Update challenge stats
function updateChallengeStats(totalChallenges, totalEnrolled) {
  const totalCount = document.getElementById('totalChallengesCount');
  const enrolledCount = document.getElementById('totalUsersInChallengesCount');
  
  if (totalCount) totalCount.textContent = totalChallenges;
  if (enrolledCount) enrolledCount.textContent = totalEnrolled;
}

// View users enrolled in a challenge
async function viewChallengeUsers(challengeId) {
  showNotification('View users for challenge: ' + challengeId, 'info');
  // This will be implemented further
}

// Edit a challenge
async function editChallenge(challengeId) {
  showNotification('Edit challenge: ' + challengeId, 'info');
  // This will be implemented further
}

// Load challenges list
function loadChallengesList() {
  const challengesList = document.getElementById('challengesList');
  
  if (!challengesList) return;
  
  if (appState.challenges.length === 0) {
    challengesList.innerHTML = '<p style="text-align: center; color: #999;">No challenges created yet</p>';
    return;
  }
  
  challengesList.innerHTML = appState.challenges
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(challenge => `
      <div class="challenge-item">
        <h4>${challenge.name}</h4>
        <p><strong>Duration:</strong> ${challenge.duration} days</p>
        <p><strong>Start Date:</strong> ${new Date(challenge.startDate).toLocaleDateString()}</p>
        ${challenge.description ? `<p><strong>Description:</strong> ${challenge.description}</p>` : ''}
        <p><strong>Status:</strong> <span style="color: #10b981;">${challenge.status}</span></p>
      </div>
    `)
    .join('');
}

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
  // Load challenges table
  loadChallengesTable();
  
  // Set default date for new challenge form
  const newChallengeStartDate = document.getElementById('newChallengeStartDate');
  if (newChallengeStartDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    newChallengeStartDate.value = `${year}-${month}-${day}`;
  }
  
  // Load settings
  document.getElementById('challengeDuration').value = CONFIG.CHALLENGE_DURATION;
  document.getElementById('challengeStartDate').value = CONFIG.CHALLENGE_START_DATE;

  // Load challenges table
  loadChallengesTable();
}

// Load and display participants
async function loadParticipants() {
  try {
    const participantsList = document.getElementById('participantsList');
    
    let participants = [];
    try {
      participants = await supabase.getParticipants();
    } catch (err) {
      console.warn('Failed to get participants from Supabase:', err);
      participants = appState.participants || [];
    }

    if (!participants || participants.length === 0) {
      participantsList.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No participants yet</p>';
      return;
    }

    // Display participants in a table
    let html = `
      <table class="challenges-table" style="width: 100%;">
        <thead>
          <tr>
            <th>Email</th>
            <th>Joined Date</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    participants.forEach(participant => {
      const joinedDate = participant.joined_at 
        ? new Date(participant.joined_at).toLocaleDateString() 
        : 'N/A';
      
      html += `
        <tr>
          <td>${participant.email}</td>
          <td>${joinedDate}</td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    participantsList.innerHTML = html;
  } catch (error) {
    console.error('Error loading participants:', error);
    document.getElementById('participantsList').innerHTML = '<p style="text-align: center; color: red;">Error loading participants</p>';
  }
}

// ============================================
// UTILITIES
// ============================================

function calculateStreak(email, userSubmissions = null) {
  let streak = 0;
  const submissions = userSubmissions || appState.submissions.filter(s => s.email === email);
  
  if (submissions.length === 0) return 0;

  const dates = submissions.map(s => new Date(s.submission_date || s.date)).sort((a, b) => b - a);
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

async function updateProgressChart() {
  const ctx = document.getElementById('progressChart');
  if (!ctx) return;

  try {
    const allSubmissions = await supabase.getSubmissions();
    const rankings = calculateOverallRankings(allSubmissions);
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
  } catch (error) {
    console.error('Error updating progress chart:', error);
  }
}

// Assign Users to Challenge Modal Functions
let currentChallengeId = null;
let selectedUsersForChallenge = new Set();

async function openAssignUsersModal(challengeId, challengeName) {
  currentChallengeId = challengeId;
  selectedUsersForChallenge.clear();
  
  // Set challenge name
  document.getElementById('assignChallengeNameDisplay').textContent = challengeName;
  
  // Fetch all users from participants
  try {
    let users = [];
    
    // Try Supabase first
    try {
      users = await supabase.getParticipants();
    } catch (err) {
      console.warn('Supabase fetch failed, using local participants:', err);
      users = appState.participants || [];
    }
    
    // Render users as checkboxes
    const usersList = document.getElementById('usersList');
    if (users.length === 0) {
      usersList.innerHTML = '<p style="text-align: center; color: #999;">No users available</p>';
    } else {
      usersList.innerHTML = users
        .map(user => `
          <div style="display: flex; align-items: center; padding: 0.5rem; border-bottom: 1px solid #eee;">
            <input type="checkbox" id="user-${user.email || user}" value="${user.email || user}" 
                   onchange="toggleUserSelection(this)" style="margin-right: 0.75rem;">
            <label for="user-${user.email || user}" style="flex: 1; margin: 0; cursor: pointer;">
              ${user.email || user}
            </label>
          </div>
        `)
        .join('');
    }
    
    // Show modal
    document.getElementById('assignUsersModal').style.display = 'block';
  } catch (error) {
    console.error('Error loading users:', error);
    showNotification('Error loading users', 'error');
  }
}

function toggleUserSelection(checkbox) {
  if (checkbox.checked) {
    selectedUsersForChallenge.add(checkbox.value);
  } else {
    selectedUsersForChallenge.delete(checkbox.value);
  }
}

async function confirmAssignUsers() {
  if (selectedUsersForChallenge.size === 0) {
    showNotification('Please select at least one user', 'error');
    return;
  }
  
  try {
    let assignedCount = 0;
    const errors = [];
    
    console.log(`Starting to assign ${selectedUsersForChallenge.size} user(s) to challenge ${currentChallengeId}`);
    
    for (const email of selectedUsersForChallenge) {
      try {
        console.log(`Assigning user ${email} to challenge ${currentChallengeId}`);
        // Must save to Supabase - no local fallback
        const result = await supabase.addUserToChallenge(email, currentChallengeId);
        console.log(`Successfully assigned ${email} to Supabase:`, result);
        assignedCount++;
      } catch (err) {
        console.error(`Failed to assign ${email} to Supabase:`, err);
        errors.push({email, error: err.message});
        // Continue trying other users but track the error
      }
    }
    
    console.log(`Assignment complete: ${assignedCount} succeeded, ${errors.length} failed`);
    
    if (assignedCount > 0) {
      showNotification(`✅ Assigned ${assignedCount} user(s) to challenge in Supabase!`, 'success');
      closeAssignUsersModal();
      loadChallengesTable(); // Refresh the table
    } else {
      // All assignments failed
      const errorDetails = errors.map(e => `${e.email}: ${e.error}`).join('\n');
      console.error('All assignments failed:', errorDetails);
      showNotification(`❌ Failed to assign users to Supabase:\n${errorDetails}`, 'error');
    }
    
  } catch (error) {
    console.error('Error during assignment process:', error);
    showNotification(`❌ Error: ${error.message}`, 'error');
  }
}

function closeAssignUsersModal() {
  document.getElementById('assignUsersModal').style.display = 'none';
  currentChallengeId = null;
  selectedUsersForChallenge.clear();
}

// Leaderboard Challenge Filter Functions
async function populateLeaderboardChallengesDropdown() {
  try {
    const select = document.getElementById('leaderboardChallengeSelect');
    if (!select) return;
    
    // Fetch user's challenges
    let userChallenges = [];
    try {
      userChallenges = await supabase.getUserChallenges(appState.currentUser);
    } catch (err) {
      console.warn('Failed to fetch user challenges from Supabase:', err);
      // Fall back to checking all challenges for users
      userChallenges = appState.challenges || [];
    }
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // Add user's challenges
    if (userChallenges && userChallenges.length > 0) {
      userChallenges.forEach(challenge => {
        const option = document.createElement('option');
        option.value = challenge.id || challenge.name;
        option.textContent = challenge.name;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error populating challenges dropdown:', error);
  }
}

async function updateChallengeLeaderboard(challengeId) {
  // Update the selected challenge filter
  appState.selectedChallengeFilter = challengeId || null;
  
  // Refresh all leaderboard tabs
  await updateLeaderboard();
}

// Create Challenge Modal Functions
function openCreateChallengeModal() {
  document.getElementById('createChallengeModal').style.display = 'block';
}

function closeCreateChallengeModal() {
  document.getElementById('createChallengeModal').style.display = 'none';
  document.getElementById('createChallengeForm').reset();
}

// Edit Challenge Modal Functions
let currentEditChallengeId = null;

function openEditChallengeModal(challengeId, challengeName, duration, startDate, description, status) {
  currentEditChallengeId = challengeId;
  
  document.getElementById('editChallengeName').value = challengeName;
  document.getElementById('editChallengeDuration').value = duration || 30;
  document.getElementById('editChallengeStartDate').value = startDate;
  document.getElementById('editChallengeDescription').value = description || '';
  document.getElementById('editChallengeStatus').value = status || 'active';
  
  document.getElementById('editChallengeModal').style.display = 'block';
}

function closeEditChallengeModal() {
  document.getElementById('editChallengeModal').style.display = 'none';
  currentEditChallengeId = null;
}

async function saveEditedChallenge() {
  if (!currentEditChallengeId) return;
  
  const name = document.getElementById('editChallengeName').value.trim();
  const duration = parseInt(document.getElementById('editChallengeDuration').value);
  const startDate = document.getElementById('editChallengeStartDate').value;
  const description = document.getElementById('editChallengeDescription').value.trim();
  const status = document.getElementById('editChallengeStatus').value;
  
  if (!name || !startDate) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }
  
  try {
    // Update in Supabase
    let updateUrl = `${supabase.url}/rest/v1/challenges?id=eq.${currentEditChallengeId}`;
    const updateOptions = {
      method: 'PATCH',
      headers: {
        'apikey': supabase.key,
        'Authorization': `Bearer ${supabase.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name,
        duration,
        start_date: startDate,
        description,
        status,
        updated_at: new Date().toISOString()
      })
    };
    
    const response = await fetch(updateUrl, updateOptions);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    // Also update in local state
    const localChallenge = appState.challenges.find(c => c.id === currentEditChallengeId);
    if (localChallenge) {
      localChallenge.name = name;
      localChallenge.duration = duration;
      localChallenge.startDate = startDate;
      localChallenge.description = description;
      localChallenge.status = status;
      saveAppState();
    }
    
    showNotification('✅ Challenge updated successfully!', 'success');
    closeEditChallengeModal();
    loadChallengesTable();
  } catch (error) {
    console.error('Error updating challenge:', error);
    showNotification('Error updating challenge: ' + error.message, 'error');
  }
}

// View Challenge Users Modal Functions
let currentViewChallengeId = null;

async function openViewUsersModal(challengeId, challengeName) {
  currentViewChallengeId = challengeId;
  document.getElementById('viewChallengeName').textContent = challengeName;
  
  try {
    const participants = await supabase.getChallengeParticipants(challengeId);
    const usersList = document.getElementById('viewChallengeUsersModal').querySelector('#usersList');
    
    if (!participants || participants.length === 0) {
      usersList.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No users assigned to this challenge</p>';
    } else {
      usersList.innerHTML = participants
        .map((user, index) => `
          <div style="padding: 1rem; border-bottom: 1px solid #eee; display: flex; align-items: center;">
            <div style="flex: 1;">
              <div style="font-weight: 500;">${user.email}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">
                Joined: ${new Date(user.joined_at).toLocaleDateString()}
              </div>
            </div>
            <div style="background: ${user.status === 'active' ? '#d1fae5' : '#fee2e2'}; color: ${user.status === 'active' ? '#065f46' : '#7f1d1d'}; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500;">
              ${user.status || 'active'}
            </div>
          </div>
        `)
        .join('');
    }
    
    document.getElementById('viewChallengeUsersModal').style.display = 'block';
  } catch (error) {
    console.error('Error loading challenge users:', error);
    showNotification('Error loading users', 'error');
  }
}

function closeViewUsersModal() {
  document.getElementById('viewChallengeUsersModal').style.display = 'none';
  currentViewChallengeId = null;
}

