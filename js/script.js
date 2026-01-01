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

async function loadUserHistory() {
  try {
    if (!appState.currentUser) {
      console.log('No current user, skipping history load');
      return;
    }

    const historyTableBody = document.getElementById('historyTableBody');
    if (!historyTableBody) {
      console.warn('History table body not found');
      return;
    }

    console.log('Loading history for user:', appState.currentUser);

    // First, try to get all submissions to see what's available
    console.log('Fetching all submissions to debug...');
    const allSubmissions = await supabase.getSubmissions();
    console.log('All submissions count:', allSubmissions.length);
    console.log('All submissions sample:', allSubmissions.slice(0, 3));

    // Fetch all submissions for the current user
    let userSubmissions = [];
    try {
      userSubmissions = await supabase.getUserSubmissions(appState.currentUser);
      console.log('User submissions from API (query by email):', userSubmissions);
    } catch (err) {
      console.warn('Failed to get submissions from API, trying fallback:', err);
      // Fallback: get all submissions and filter locally
      userSubmissions = allSubmissions.filter(s => s.email === appState.currentUser);
      console.log('User submissions (filtered locally):', userSubmissions);
      console.log('Current user being searched:', appState.currentUser);
      console.log('Emails in all submissions:', allSubmissions.map(s => s.email).slice(0, 5));
    }

    if (!userSubmissions || userSubmissions.length === 0) {
      console.log('No submissions found for user');
      historyTableBody.innerHTML = '<tr><td colspan="3" style="padding: 2rem; text-align: center; color: #999;">No history data yet</td></tr>';
      return;
    }

    console.log('Rendering', userSubmissions.length, 'submissions');

    // Sort by date descending (most recent first)
    const sortedSubmissions = userSubmissions.sort((a, b) => {
      const dateA = new Date(a.submission_date || a.date);
      const dateB = new Date(b.submission_date || b.date);
      return dateB - dateA;
    });

    // Build table rows
    historyTableBody.innerHTML = sortedSubmissions.map((submission, index) => {
      const date = new Date(submission.submission_date || submission.date);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const steps = submission.steps || 0;
      const weight = submission.weight || 0;
      
      return `
        <tr style="border-bottom: 1px solid var(--border-color); ${index % 2 === 0 ? 'background-color: rgba(255,255,255,0.5);' : ''}">
          <td style="padding: 1rem; text-align: left;">${formattedDate}</td>
          <td style="padding: 1rem; text-align: center; font-weight: 600;">${steps.toLocaleString()}</td>
          <td style="padding: 1rem; text-align: center; font-weight: 600;">${weight.toLocaleString()}</td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading user history:', error);
    const historyTableBody = document.getElementById('historyTableBody');
    if (historyTableBody) {
      historyTableBody.innerHTML = '<tr><td colspan="3" style="padding: 2rem; text-align: center; color: red;">Error loading history</td></tr>';
    }
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
  const inviteCode = document.getElementById('signupInviteCode').value.trim();
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

  if (!inviteCode) {
    showNotification('Please enter an invite code', 'error');
    return;
  }

  // Validate invite code with Supabase
  supabase.validateInviteCode(inviteCode).then(isValid => {
    if (!isValid) {
      showNotification('Invalid invite code. Please check and try again.', 'error');
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
        // Add user to participants table
        supabase.addParticipant(email).then(() => {
          appState.currentUser = email;
          appState.isAdmin = false;
          saveAppState();
          updateUIState();

          showNotification('✅ Account created successfully!', 'success');
          document.getElementById('signupEmail').value = '';
          document.getElementById('signupInviteCode').value = '';
          document.getElementById('signupPassword').value = '';
          document.getElementById('signupPasswordConfirm').value = '';

          // Go to dashboard (or home if not a participant yet)
          setTimeout(() => {
            showPage('home');
          }, 500);
        }).catch(err => {
          console.error('Error adding participant:', err);
          // Still consider signup successful even if adding to participants fails
          appState.currentUser = email;
          appState.isAdmin = false;
          saveAppState();
          updateUIState();
          showNotification('✅ Account created! (Note: Some features may be limited)', 'success');
          setTimeout(() => {
            showPage('home');
          }, 500);
        });
      }).catch(err => {
        console.error('Signup error:', err);
        showNotification('Signup failed. Please try again.', 'error');
      });
    }).catch(err => {
      console.error('Error checking email:', err);
      showNotification('Error creating account. Please try again.', 'error');
    });
  }).catch(err => {
    console.error('Error validating invite code:', err);
    showNotification('Error validating invite code. Please try again.', 'error');
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
    
    // Safety check: ensure userSubmissions is an array
    if (Array.isArray(userSubmissions) && userSubmissions.length > 0) {
      const totalSteps = userSubmissions.reduce((sum, s) => sum + (s.steps || 0), 0);
      
      // Get the most recent weight
      const latestWeight = userSubmissions.length > 0 
        ? userSubmissions[0].weight || 0
        : 0;
      
      // Calculate streak based on submissions
      const streak = calculateStreak(email, userSubmissions);

      const totalStepsEl = document.getElementById('totalSteps');
      if (totalStepsEl) totalStepsEl.textContent = totalSteps.toLocaleString();
      
      const totalCaloriesEl = document.getElementById('totalCalories');
      if (totalCaloriesEl) totalCaloriesEl.textContent = latestWeight.toLocaleString();
      
      const streakEl = document.getElementById('streak');
      if (streakEl) streakEl.textContent = streak;

      // Calculate rank - fetch all submissions from Supabase
      const allSubmissions = await supabase.getSubmissions();
      const rankings = calculateOverallRankings(allSubmissions);
      const userRank = rankings.findIndex(r => r.email === email) + 1;
      const currentRankEl = document.getElementById('currentRank');
      if (currentRankEl) currentRankEl.textContent = userRank > 0 ? `#${userRank}` : '-';

      // Update today's steps and yearly steps
      const today = new Date().toISOString().split('T')[0];
      const todaySubmission = userSubmissions.find(s => s.date === today);
      const todaySteps = todaySubmission ? todaySubmission.steps : 0;
      const todayStepsEl = document.getElementById('todaySteps');
      if (todayStepsEl) todayStepsEl.textContent = todaySteps.toLocaleString();

      const currentYear = new Date().getFullYear();
      const yearSteps = userSubmissions
        .filter(s => new Date(s.date).getFullYear() === currentYear)
        .reduce((sum, s) => sum + (s.steps || 0), 0);
      const yearStepsEl = document.getElementById('yearSteps');
      if (yearStepsEl) yearStepsEl.textContent = yearSteps.toLocaleString();

      // Draw weight loss chart
      appState.weightSubmissions = userSubmissions;
      drawWeightChart(userSubmissions, 'month');

      // Add event listener for chart period selector
      const periodSelect = document.getElementById('weightChartPeriod');
      if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
          drawWeightChart(appState.weightSubmissions, e.target.value);
        });
      }
    } else {
      console.warn('No submissions data available');
    }

    // Always load history table regardless of submissions status
    await loadUserHistory().catch(err => console.error('Error loading history:', err));
  } catch (error) {
    console.error('Error updating dashboard:', error);
    // Still try to load history even if there's an error
    await loadUserHistory().catch(err => console.error('Error loading history:', err));
  }
}

function drawWeightChart(submissions, period = 'month') {
  try {
    const canvas = document.getElementById('weightLossChart');
    if (!canvas) return;

    // Ensure submissions is an array
    if (!Array.isArray(submissions)) {
      console.warn('submissions is not an array in drawWeightChart');
      return;
    }

    // Sort submissions by date
    const sorted = [...submissions].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Get data based on period
  let data;
  if (period === 'year') {
    // Get last 365 days
    data = sorted.slice(-365);
  } else {
    // Get last 30 days (default)
    data = sorted.slice(-30);
  }
  
  if (data.length === 0) {
    canvas.parentElement.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">No weight data yet</p>';
    return;
  }

  // Format labels based on period
  let labels;
  if (period === 'year') {
    // Show week-based labels for year view
    labels = data.map(s => new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  } else {
    // Show daily labels for month view
    labels = data.map(s => new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  
  const chartData = data.map(s => s.weight || 0);

  // Destroy existing chart if it exists
  if (window.weightChartInstance) {
    window.weightChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  window.weightChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Weight (lbs)',
        data: chartData,
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: period === 'year' ? 2 : 3,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { size: 12 },
            color: '#6b7280'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: { color: '#6b7280' },
          grid: { color: '#f3f4f6' }
        },
        x: {
          ticks: { color: '#6b7280' },
          grid: { color: '#f3f4f6' }
        }
      }
    }
  });
  } catch (error) {
    console.error('Error drawing weight chart:', error);
  }
}

async function handleSubmission(e) {
  e.preventDefault();
  
  const steps = parseInt(document.getElementById('stepsInput').value);
  const weight = parseFloat(document.getElementById('weightInput').value);
  const date = document.getElementById('dateInput').value;

  if (!appState.currentUser) {
    showNotification('Please login first', 'error');
    return;
  }

  try {
    // Save to Supabase (insert or update if exists)
    await supabase.upsertSubmission(appState.currentUser, date, steps, weight);
    
    // Also save locally
    const existing = appState.submissions.find(
      s => s.email === appState.currentUser && s.date === date
    );

    if (existing) {
      existing.steps = steps;
      existing.weight = weight;
    } else {
      appState.submissions.push({
        email: appState.currentUser,
        date,
        steps,
        weight
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
  
  // Load all challenges first
  try {
    if (!appState.challenges || appState.challenges.length === 0) {
      appState.challenges = await supabase.getChallenges();
      console.log('Loaded challenges:', appState.challenges);
    }
  } catch (err) {
    console.warn('Failed to load challenges:', err);
  }
  
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
    // Check if user has active challenges
    if (!appState.selectedChallengeFilter) {
      console.log('No active challenge selected');
      renderLeaderboardCharts('daily', []);
      return;
    }
    
    // Use local date instead of UTC
    const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    console.log('Loading daily leaderboard for (local date):', today);
    
    const allSubmissions = await supabase.getSubmissions();
    console.log('All submissions fetched from Supabase:', allSubmissions);
    console.log('Number of submissions:', allSubmissions.length);
    
    if (!allSubmissions || allSubmissions.length === 0) {
      console.warn('No submissions found');
      renderLeaderboardCharts('daily', []);
      return;
    }
    
    // Filter by challenge if selected
    let submissions = allSubmissions;
    if (appState.selectedChallengeFilter) {
      console.log('Filtering by challenge:', appState.selectedChallengeFilter);
      const challengeUsers = await supabase.getChallengeParticipants(appState.selectedChallengeFilter);
      console.log('Challenge participants:', challengeUsers);
      const userEmails = challengeUsers.map(u => u.email);
      submissions = submissions.filter(s => userEmails.includes(s.email));
      console.log('Filtered submissions:', submissions);
    }
    
    const todaySubmissions = submissions.filter(s => {
      // Handle both DATE format (2025-12-16) and TIMESTAMP format (2025-12-16T...)
      let submissionDate = s.submission_date || s.date;
      if (submissionDate.includes('T')) {
        submissionDate = submissionDate.split('T')[0];
      }
      console.log('Comparing submission date:', submissionDate, 'with today:', today);
      return submissionDate === today;
    });
    console.log('Today submissions:', todaySubmissions);

    // Group by email for today
    const dailyByEmail = {};
    todaySubmissions.forEach(s => {
      if (!dailyByEmail[s.email]) {
        dailyByEmail[s.email] = { email: s.email, steps: 0, calories: 0 };
      }
      dailyByEmail[s.email].steps += (s.steps || 0);
      dailyByEmail[s.email].calories += (s.calories || 0);
    });

    const dailyRankings = Object.values(dailyByEmail)
      .sort((a, b) => b.steps - a.steps)
      .slice(0, 10);

    console.log('Daily rankings:', dailyRankings);
    renderLeaderboardCharts('daily', dailyRankings);
  } catch (error) {
    console.error('Error updating daily leaderboard:', error);
  }
}

async function updateWeeklyLeaderboard() {
  try {
    // Check if user has active challenges
    if (!appState.selectedChallengeFilter) {
      console.log('No active challenge selected');
      renderLeaderboardCharts('weekly', []);
      return;
    }
    
    // Use local dates instead of UTC
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD

    const allSubmissions = await supabase.getSubmissions();
    
    // Filter by challenge if selected
    let submissions = allSubmissions;
    if (appState.selectedChallengeFilter) {
      const challengeUsers = await supabase.getChallengeParticipants(appState.selectedChallengeFilter);
      const userEmails = challengeUsers.map(u => u.email);
      submissions = submissions.filter(s => userEmails.includes(s.email));
    }
    
    const weeklySubmissions = submissions.filter(s => {
      // Handle both DATE format and TIMESTAMP format
      let submissionDate = s.submission_date || s.date;
      if (submissionDate.includes('T')) {
        submissionDate = submissionDate.split('T')[0];
      }
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

    renderLeaderboardCharts('weekly', weeklyRankings);
  } catch (error) {
    console.error('Error updating weekly leaderboard:', error);
  }
}

async function updateOverallLeaderboard() {
  try {
    // Check if user has active challenges
    if (!appState.selectedChallengeFilter) {
      console.log('No active challenge selected');
      renderLeaderboardCharts('overall', []);
      return;
    }
    
    const allSubmissions = await supabase.getSubmissions();
    
    // Filter by challenge if selected
    let submissions = allSubmissions;
    if (appState.selectedChallengeFilter) {
      const challengeUsers = await supabase.getChallengeParticipants(appState.selectedChallengeFilter);
      const userEmails = challengeUsers.map(u => u.email);
      submissions = submissions.filter(s => userEmails.includes(s.email));
    }
    
    const overallByEmail = {};
    submissions.forEach(s => {
      if (!overallByEmail[s.email]) {
        overallByEmail[s.email] = { email: s.email, steps: 0, calories: 0 };
      }
      overallByEmail[s.email].steps += (s.steps || 0);
      overallByEmail[s.email].calories += (s.calories || 0);
    });

    const overallRankings = Object.values(overallByEmail)
      .sort((a, b) => b.steps - a.steps)
      .slice(0, 10);

    renderLeaderboardCharts('overall', overallRankings);
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

function renderLeaderboardCharts(type, rankings) {
  // Prepare data
  const labels = rankings.map(r => r.email.split('@')[0]);
  const stepsData = rankings.map(r => r.steps);

  console.log(`${type} Rankings:`, rankings);

  // Chart colors
  const primaryColor = '#7c3aed';

  // If no data, show message
  if (rankings.length === 0) {
    const stepsCtx = document.getElementById(`${type}StepsChart`);
    
    if (stepsCtx) {
      stepsCtx.getContext('2d').fillStyle = 'rgba(0,0,0,0.1)';
      stepsCtx.getContext('2d').fillRect(0, 0, stepsCtx.width, stepsCtx.height);
      const message = 'No data available';
      stepsCtx.getContext('2d').fillStyle = '#999';
      stepsCtx.getContext('2d').font = '16px Arial';
      stepsCtx.getContext('2d').textAlign = 'center';
      stepsCtx.getContext('2d').fillText(message, stepsCtx.width / 2, stepsCtx.height / 2);
    }
    return;
  }

  // Render Steps Chart
  const stepsCtx = document.getElementById(`${type}StepsChart`);
  if (stepsCtx) {
    if (window[`${type}StepsChartInstance`]) {
      window[`${type}StepsChartInstance`].destroy();
    }
    window[`${type}StepsChartInstance`] = new Chart(stepsCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Steps',
          data: stepsData,
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
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

// Assign Users to Challenge Modal Functions
let currentChallengeId = null;
let selectedUsersForChallenge = new Set();

async function openAssignUsersModal(challengeId, challengeName) {
  currentChallengeId = challengeId;
  selectedUsersForChallenge.clear();
  
  // Set challenge name
  document.getElementById('assignChallengeNameDisplay').textContent = challengeName;
  
  // Fetch all users and existing challenge members
  try {
    let users = [];
    let existingMembers = [];
    
    // Try Supabase first
    try {
      users = await supabase.getParticipants();
      // Fetch existing members for this challenge
      existingMembers = await supabase.getChallengeParticipants(challengeId);
    } catch (err) {
      console.warn('Supabase fetch failed:', err);
      users = appState.participants || [];
    }
    
    // Create set of existing member emails for quick lookup
    const existingEmails = new Set(existingMembers.map(m => m.email || m));
    
    // Render users as 3-column table
    const usersList = document.getElementById('usersList');
    if (users.length === 0) {
      usersList.innerHTML = '<p style="text-align: center; color: #999;">No users available</p>';
    } else {
      // Create header row
      let html = `
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; padding: 0.75rem; font-weight: 600; border-bottom: 2px solid #ddd; background: #f9fafb;">
          <div>User Email</div>
          <div style="text-align: center;">Assigned</div>
          <div style="text-align: center;">Action</div>
        </div>
      `;
      
      // Create rows
      html += users
        .map(user => {
          const email = user.email || user;
          const isExisting = existingEmails.has(email);
          return `
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; padding: 0.75rem; align-items: center; border-bottom: 1px solid #eee;">
              <div style="word-break: break-all;">${email}</div>
              <div style="text-align: center;">
                <input type="checkbox" id="user-${email}" value="${email}" 
                       ${isExisting ? 'checked disabled' : ''}
                       onchange="toggleUserSelection(this)">
              </div>
              <div style="text-align: center;">
                ${isExisting ? `<button type="button" onclick="removeUserFromChallenge('${email}', '${challengeId}')" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>` : '<span style="color: #999;">-</span>'}
              </div>
            </div>
          `;
        })
        .join('');
      
      usersList.innerHTML = html;
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

async function removeUserFromChallenge(email, challengeId) {
  if (!confirm(`Are you sure you want to remove ${email} from this challenge?`)) {
    return;
  }
  
  try {
    await supabase.removeUserFromChallenge(email, challengeId);
    showNotification(`Removed ${email} from challenge`, 'success');
    // Refresh the modal
    openAssignUsersModal(challengeId, document.getElementById('assignChallengeNameDisplay').textContent);
  } catch (error) {
    console.error('Error removing user from challenge:', error);
    showNotification('Error removing user from challenge', 'error');
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
    const selector = document.getElementById('challengeSelector');
    if (!select || !selector) return;
    
    // Get challenges assigned to the current user
    let userChallenges = [];
    if (appState.currentUser) {
      try {
        const userChallengeProgress = await supabase.getUserChallenges(appState.currentUser);
        console.log('User challenge progress:', userChallengeProgress);
        
        if (userChallengeProgress && userChallengeProgress.length > 0) {
          // Get the full challenge details for each assigned challenge
          const challengeIds = userChallengeProgress.map(ucp => ucp.challenge_id);
          const allChallenges = await supabase.getChallenges();
          
          // Filter to only active challenges the user is assigned to
          userChallenges = allChallenges.filter(c => 
            challengeIds.includes(c.id) && 
            c.status === 'active'
          );
          console.log('User active challenges (filtered):', userChallenges);
        }
      } catch (err) {
        console.warn('Failed to fetch user challenges from Supabase:', err);
      }
    }
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // Add user's assigned active challenges
    if (userChallenges && userChallenges.length > 0) {
      console.log('Populating dropdown with user active challenges:', userChallenges);
      userChallenges.forEach(challenge => {
        const option = document.createElement('option');
        option.value = challenge.id || challenge.name;
        option.textContent = challenge.name;
        select.appendChild(option);
      });
      
      // If only one challenge, hide dropdown and auto-select it
      if (userChallenges.length === 1) {
        selector.style.display = 'none';
        appState.selectedChallengeFilter = userChallenges[0].id || userChallenges[0].name;
        console.log('Only one challenge found, auto-selected:', appState.selectedChallengeFilter);
        await updateLeaderboard();
      } else {
        // Multiple challenges - show dropdown and auto-select first
        selector.style.display = 'block';
        select.value = select.options[1].value;
        appState.selectedChallengeFilter = select.options[1].value;
        console.log('Auto-selected first active challenge:', appState.selectedChallengeFilter);
        await updateLeaderboard();
      }
    } else {
      console.warn('No active assigned challenges found for user');
      selector.style.display = 'none';
      // Clear selected challenge filter and show empty state
      appState.selectedChallengeFilter = null;
      await updateLeaderboard();
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

