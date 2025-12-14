# Personal Portfolio Website

A modern, responsive personal portfolio website designed for Google Sites hosting. Built with vanilla HTML, CSS, and JavaScript—no build tools required.

## Features

- 🎨 **Modern Design** - Clean, professional aesthetic with gradient accents
- 📱 **Fully Responsive** - Works perfectly on all devices and screen sizes
- ⚡ **Fast & Lightweight** - No dependencies, pure vanilla code
- 🚀 **Easy to Deploy** - Ready for Google Sites or any static hosting
- ✨ **Smooth Animations** - Subtle transitions and hover effects
- 🔗 **Smooth Navigation** - Active link highlighting and smooth scrolling

## Project Structure

```
.
├── index.html          # Main portfolio page
├── css/
│   └── styles.css      # All styling
├── js/
│   └── script.js       # Interactive features
├── README.md           # This file
└── .github/
    └── copilot-instructions.md
```

## Getting Started

### Prerequisites
- A web browser (no server required for local testing)
- A text editor or IDE for editing

### Local Preview

1. Open `index.html` directly in your browser, or
2. Use Python's built-in server:
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## Customization

### Updating Content

Edit `index.html` to customize:
- Your name and title in the hero section
- About section content
- Project cards and descriptions
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
