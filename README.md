# Deep Ranjan — Portfolio

A single-page, interactive portfolio built with plain HTML, CSS and JavaScript.

## Features
- Custom cursor (dot + ring) with magnetic buttons and tilt-on-hover cards
- Mouse-reactive glow background
- Typing animation for the role title
- Scroll-reveal animations and active-section nav highlighting
- Fully responsive (mobile nav menu)

## Structure
```
My_Portfolio/
├── index.html
├── css/style.css
├── js/script.js
├── assets/
│   └── resume.pdf   <- add your compiled resume PDF here
└── README.md
```

## Before publishing
1. Compile `resume.tex` (e.g. on Overleaf) to PDF and save it as `assets/resume.pdf`
   so the "Download Resume" button works.
2. Update the GitHub link in `index.html` (`https://github.com/`) to your actual profile.

## Hosting on GitHub Pages
1. Create a new GitHub repo (e.g. `my-portfolio`) and push the contents of this folder.
2. In the repo, go to **Settings → Pages**.
3. Under **Source**, select the `main` branch and `/ (root)` folder, then save.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

Alternatively, for a `https://<username>.github.io` root site, name the repo
`<username>.github.io` and push these files to its root.
