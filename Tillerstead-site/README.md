# Tillerstead.com — Static Site

A clean, fast, and accessible static website for Tillerstead LLC (tile • bath • remodel), suitable for GitHub Pages hosting.

## Preview
Open `index.html` locally or serve with any static server.

## Deploy to GitHub Pages
1. Create a new GitHub repo (e.g., `tillerstead-site`).
2. Upload the contents of this folder (or unzip the provided ZIP).
3. In **Settings → Pages**, choose:
   - Source: **Deploy from a branch**
   - Branch: `main` (root)
4. (Optional) Add `CNAME` with your domain: `tillerstead.com` (root of repo).
5. Wait for Pages to build. Visit `https://<your-username>.github.io/tillerstead-site/`

## Custom Domain
- Set a DNS `A` record to GitHub Pages IPs or use a `CNAME` pointing to `<username>.github.io`.
- Add a `CNAME` file in repo root containing `tillerstead.com`.

## Edit Brand
- Colors and spacing are controlled in `assets/css/style.css`.
- Logo: `assets/img/logo.svg`.
- Open Graph image: `assets/img/og-image.png`.

## Notes
- Contact form posts to nowhere on GitHub Pages; for live submissions, use a form backend (Netlify, Formspree, etc.).
