// ============================================
// GOOGLE SHEETS API INTEGRATION
// ============================================

// Configuration
const GOOGLE_CONFIG = {
  CLIENT_ID: '212635983060-tsrq8b4cibal7rd6md2sktbs8tne39r.apps.googleusercontent.com',
  API_KEY: 'AIzaSyBNcjZrhke2Br_VDRiHfecajmOhKYBMlok',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive',
  SHEET_ID: '1JF36roL57NtYYK-UWk6Y-FZVsl-tu7sFpk03wjW1fxE'
};

let googleAccessToken = null;
let googleUser = null;

// Initialize Google Auth
function initializeGoogleAuth() {
  if (typeof google === 'undefined') {
    console.warn('Google API not loaded yet');
    return;
  }

  try {
    google.accounts.id.initialize({
      client_id: GOOGLE_CONFIG.CLIENT_ID,
      callback: handleGoogleSignIn,
      ux_mode: 'popup',
      auto_select: false
    });

    // Render button if element exists
    const signInButton = document.getElementById('googleSignIn');
    if (signInButton) {
      google.accounts.id.renderButton(signInButton, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with'
      });
    }
  } catch (error) {
    console.error('Error initializing Google Auth:', error);
  }
}

// Handle Google Sign In
function handleGoogleSignIn(response) {
  const token = response.credential;
  
  // Decode JWT to get user info
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  
  googleUser = JSON.parse(jsonPayload);
  googleAccessToken = token;

  console.log('Google user authenticated:', googleUser.email);
  
  // Redirect to dashboard
  showPage('dashboard');
  loadUserData();
}

// Get OAuth2 Token for API calls
function getOAuth2Token(callback) {
  // For now, using ID token. In production, implement proper OAuth2 flow
  if (googleAccessToken) {
    callback(googleAccessToken);
  } else {
    console.error('No access token available');
  }
}

// Read data from Google Sheet
async function readSheetData(sheetName, range) {
  return new Promise((resolve, reject) => {
    getOAuth2Token((token) => {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_CONFIG.SHEET_ID}/values/${sheetName}!${range}`;
      
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        resolve(data.values || []);
      })
      .catch(error => {
        console.error('Error reading sheet:', error);
        reject(error);
      });
    });
  });
}

// Write data to Google Sheet
async function writeSheetData(sheetName, range, values) {
  return new Promise((resolve, reject) => {
    getOAuth2Token((token) => {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_CONFIG.SHEET_ID}/values/${sheetName}!${range}?valueInputOption=USER_ENTERED`;
      
      fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: values })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Sheet updated:', data);
        resolve(data);
      })
      .catch(error => {
        console.error('Error writing to sheet:', error);
        reject(error);
      });
    });
  });
}

// Load user data from Google Sheets
async function loadUserData() {
  try {
    // Read submissions
    const submissions = await readSheetData('submissions', 'A:D');
    
    // Read participants
    const participants = await readSheetData('participants', 'A:C');
    
    // Read invites
    const invites = await readSheetData('invites', 'A:C');

    console.log('Loaded data from sheets');
    
    // Update app state
    appState.submissions = submissions.slice(1).map(row => ({
      email: row[0],
      date: row[1],
      steps: parseInt(row[2]) || 0,
      calories: parseInt(row[3]) || 0
    }));

    appState.participants = participants.slice(1).map(row => ({
      email: row[0],
      joinDate: row[1],
      status: row[2]
    }));

    appState.currentUser = googleUser.email;
    updateDashboard();
    
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
}

// Submit activity to Google Sheets
async function submitActivityToSheet(email, date, steps, calories) {
  try {
    // Append to submissions sheet
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_CONFIG.SHEET_ID}/values/submissions!A:D:append`;
    
    getOAuth2Token((token) => {
      fetch(appendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [[email, date, steps, calories]]
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Submission added to sheet');
        loadUserData(); // Refresh data
      })
      .catch(error => console.error('Error submitting:', error));
    });
  } catch (error) {
    console.error('Failed to submit activity:', error);
  }
}

// Google Sign Out
function googleSignOut() {
  google.accounts.id.disableAutoSelect();
  googleAccessToken = null;
  googleUser = null;
  appState.currentUser = null;
  showPage('home');
}
