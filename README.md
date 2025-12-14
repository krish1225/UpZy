# UpZy - Step Challenge Competition App

A modern, responsive step challenge tracking app designed for Google Sites hosting. Built with vanilla HTML, CSS, and JavaScript with Google Sheets integration for real-time data persistence.

## Features

- 🏃 **Step & Calorie Tracking** - Track daily steps and calories burned
- 🏆 **Live Leaderboards** - Daily, weekly, and overall rankings with medals
- 🔥 **Streak Counter** - Maintain daily submission streaks
- 📊 **Progress Charts** - Visualize top performers with Chart.js
- 👥 **Invite-Based Access** - Secure challenge with generated invite codes
- 🔐 **Admin Panel** - Generate invites, manage participants, configure settings
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- ☁️ **Google Sheets Backend** - Real-time data sync with Google Sheets
- ⚡ **Fast & Lightweight** - No build tools, pure vanilla code
- 🎨 **Modern UI** - Minimalist design with gamification elements

## Project Structure

```
.
├── index.html                    # Main app file (single-page app)
├── css/
│   └── styles.css               # All styling (minimalist + gamified)
├── js/
│   ├── script.js                # Core app logic
│   └── google-sheets-api.js      # Google Sheets integration
├── Images/
│   ├── UpZyV3.png               # Logo (runner crossing finish line)
│   ├── UpZy.png                 # Alternative logo
│   └── UpZyV2.png               # Alternative logo
├── oAuth/                        # OAuth credentials (git ignored)
├── README.md                     # This file
├── .gitignore                    # Git ignore file
├── .env.example                  # Environment config template
└── .github/
    └── copilot-instructions.md   # Copilot setup guide
```

## Getting Started

### Prerequisites
- A Google Account (for OAuth authentication)
- A Google Sheet (for data storage)
- A web browser
- A text editor or IDE for editing

### Local Preview

1. Clone the repository:
   ```bash
   git clone https://github.com/krish1225/UpZy.git
   cd UpZy
   ```

2. Configure your Google credentials in `js/google-sheets-api.js`:
   - Add your `CLIENT_ID`
   - Add your `API_KEY`
   - Add your `SHEET_ID`

3. Start local server:
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## Configuration

### Google Sheets Setup

1. Create a Google Sheet with these tabs:
   - `settings` - Challenge configuration
   - `invites` - Invite codes and recipients
   - `participants` - User list
   - `submissions` - Daily step/calorie entries

2. Configure columns:
   - **invites**: email, code, createdAt
   - **participants**: email, joinDate, status
   - **submissions**: email, date, steps, calories

### Environment Variables

Copy `.env.example` to `.env` and fill in:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_API_KEY=your_api_key
GOOGLE_SHEET_ID=your_sheet_id
ADMIN_PASSWORD=your_admin_password
```

## Usage

### For Participants

1. Click "Join Challenge"
2. Sign in with Google OR use invite code
3. Submit daily steps and calories
4. View your rank on leaderboards
5. Maintain your streak!

### For Admins

1. Click "Admin Access"
2. Enter admin password (default: `admin123`)
3. Generate invite codes for participants
4. Configure challenge duration and start date
5. View all participants

## Pages

- **Home** - Introduction and CTAs
- **Join** - Google Sign-In or invite code login
- **Dashboard** - Personal stats, daily submission form, streak counter
- **Leaderboard** - Daily/weekly/overall rankings with charts
- **Admin** - Invite generation, settings, participant management

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Google OAuth 2.0
- **Backend**: Google Sheets API
- **Visualization**: Chart.js
- **Hosting**: Google Sites (or any static host)
- **Version Control**: Git + GitHub

## Customization

### Updating Content

Edit `index.html` to customize:
- App name and description
- Form labels and messages
- Home page content

Edit `js/script.js` to customize:
- Admin password
- Challenge duration
- Color scheme variables (in CSS)

## Deployment to Google Sites

1. Create a new Google Site
2. Add an "Embed" section
3. Paste the UpZy app code or link
4. Configure sharing permissions
5. Share link with participants

## Admin Access

**Default Credentials:**
- Password: `admin123` (change in `js/script.js`)

## Data Storage

All data is stored in Google Sheets, making it:
- Real-time accessible
- Easy to export
- Shareable with team
- Backup-friendly

## Contributing

Feel free to fork, modify, and improve UpZy!

## License

MIT License - feel free to use this project for personal or commercial use

## Support

For issues or questions, create an issue on GitHub: https://github.com/krish1225/UpZy/issues

- Contact email

### Styling

Modify `css/styles.css` to change:
- Color scheme (update CSS variables in `:root`)
- Fonts and typography
- Spacing and layout
- Animation timings

### Adding Interactivity

Edit `js/script.js` to add:
- New interactive features
- Form handling
- Analytics tracking

## Color Scheme

The portfolio uses a modern purple-to-pink gradient:
- **Primary**: `#667eea` (Purple)
- **Secondary**: `#764ba2` (Dark Purple)
- **Accent**: `#f093fb` (Pink)

## Deployment on Google Sites

To host on Google Sites:

1. **Create a new Google Site** at https://sites.google.com
2. **Add an Embed element** and paste your HTML code, or
3. **Upload as a standalone HTML file** using Google Drive
4. Configure the sharing settings as needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Free to use and modify for personal projects.

## Notes

- All CSS is in a single file for easy Google Sites embedding
- No external dependencies or CDNs required
- Fully self-contained for maximum compatibility
