# UpZy - Step Challenge Competition App

A modern, responsive step challenge tracking app built with vanilla HTML, CSS, and JavaScript. Powered by Supabase for real-time data persistence and PostgreSQL database.

## Features

- 🏃 **Step & Calorie Tracking** - Track daily steps and calories burned
- 🏆 **Live Leaderboards** - Daily, weekly, and overall rankings with split bar charts
- 🔥 **Streak Counter** - Maintain daily submission streaks
- 📊 **Challenge-Specific Charts** - Visualize top performers with Chart.js by challenge
- 👥 **Invite-Based Access** - Secure challenge with generated invite codes
- 🔐 **Admin Panel** - Create challenges, manage participants, assign users
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- ☁️ **Supabase Backend** - Real-time PostgreSQL database with REST API
- ⚡ **Fast & Lightweight** - No build tools, pure vanilla code
- 🎨 **Modern UI** - Minimalist design with gamification elements (white background, purple/pink accents)

## Project Structure

```
.
├── index.html                    # Main app file (single-page app)
├── css/
│   └── styles.css               # All styling (minimalist + gamified)
├── js/
│   ├── script.js                # Core app logic and event handling
│   ├── supabase-client.js        # Supabase REST API wrapper
│   └── google-sheets-api.js      # Legacy Google Sheets integration (deprecated)
├── Images/
│   └── UpZyV3.png               # Logo
├── oAuth/                        # OAuth credentials (git ignored)
├── README.md                     # This file
├── SUPABASE_SETUP.md             # Supabase database setup guide
├── .gitignore                    # Git ignore file
└── .github/
    └── copilot-instructions.md   # Copilot setup guide
```

## Getting Started

### Prerequisites
- A Supabase account (free tier available at https://supabase.com)
- A web browser
- A text editor or IDE for editing

### Local Preview

1. Clone the repository:
   ```bash
   git clone https://github.com/krish1225/UpZy.git
   cd UpZy
   ```

2. Start a local server:
   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```
   Then visit `http://localhost:8000`

## Usage

### For Participants

1. Click "Join Challenge"
2. Create an account with email and password
3. Enter your invite code
4. Submit daily steps and calories on the dashboard
5. View your rank on leaderboards
6. Check your daily history table

### For Admins

1. Click "Admin" in bottom navigation (or use admin login)
2. Create new challenges
3. Assign participants to challenges
4. View all participants and submissions
5. Generate invite codes

## Key Pages

- **Home/Dashboard** - Personal stats (Total Steps, Calories, Rank, Streak), daily submission form, and daily history table
- **Leaderboard** - Daily/Weekly/Overall rankings with 50/50 split bar charts (Steps & Calories), filtered by assigned challenges
- **Admin** - Challenge management, participant management, and invite code generation

## Navigation

Fixed bottom navigation bar with:
- 🏠 Home (Dashboard)
- 🏆 Leaderboard
- ⚙️ Admin
- 🚪 Logout

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + REST API)
- **Database**: PostgreSQL with RLS policies
- **Visualization**: Chart.js
- **Authentication**: Email/Password
- **Version Control**: Git + GitHub
- 
## Customization

### Updating Content

Edit `index.html` to customize:
- App name and description
- Form labels and messages
- Page content

Edit `js/script.js` to customize:
- Challenge configuration
- Color scheme
- Functionality

### Styling

Modify `css/styles.css` to change:
- Color scheme (CSS variables in `:root`)
- Fonts and typography
- Spacing and layout
- Animation timings

## Color Scheme

The app uses a modern minimalist design:
- **Primary**: `#7c3aed` (Purple)
- **Secondary**: `#ec4899` (Pink)
- **Background**: `#ffffff` (White)
- **Text Primary**: `#111827` (Dark Gray)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Feel free to fork, modify, and improve UpZy! Submit pull requests or create issues on GitHub.

## License

MIT License - feel free to use this project for personal or commercial use

## Support

For issues or questions, create an issue on GitHub: https://github.com/krish1225/UpZy/issues
