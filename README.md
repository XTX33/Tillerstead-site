# 🌿 Tillerstead.com — Static Site

A clean, fast, and accessible static website for **Tillerstead LLC**
> _Tile • Bath • Remodel — Built on trust, carried out with care._

This repo powers **[tillerstead.com](https://tillerstead.com)** — a New Jersey–licensed home improvement business providing tile, bath, and remodel craftsmanship across Atlantic County and South Jersey.
Optimized for **GitHub Pages** and **Netlify**, using pure **HTML/CSS/JS** for speed and maintainability.

---

## 🧱 Quick Preview (Local)
Serve the site locally from the repo root:

```bash
python3 -m http.server
# then open http://localhost:8000
```

---

## 🔧 Offline-friendly `bundle exec jekyll build`
To keep CI and air‑gapped machines happy, the repo includes a vendored `jekyll` gem (see `vendor/gems/jekyll`). Bundler only has to resolve a path dependency, so no external gem servers are contacted.

```bash
# optional: keep Bundler installs local to the repo
bundle config set --local path 'vendor/bundle'

# install (purely local resolution)
bundle install

# render the site to ./_site using the custom builder
bundle exec jekyll build
```

The custom CLI currently supports the `build` command. Use any static file server (e.g., `python3 -m http.server`) to preview `_site` after a build.

If something fails inside the builder, re-run with `JEKYLL_TRACE=1 bundle exec jekyll build` to surface a full backtrace.

> **Heads-up:** This lightweight builder implements the Liquid features and Markdown coverage used across the site. If you introduce new Liquid tags or filters, add support inside `vendor/gems/jekyll/lib/jekyll/liquid_engine.rb` before expecting the build to pass.

---

## 🎨 Design assets
- `assets/img/patterns/sacred-tile.svg` — geometric tile used for the hero surface texture. Adjust scale and opacity via the `.hero-surface::before` rule in `assets/css/theme.css`.

---

## 🎨 Theme & Design Tokens

The Tillerstead site uses a **token-driven stylesheet** for easy theme customization. All colors, spacing, typography, and visual properties are defined once in design tokens and used throughout the site.

### How to Edit the Theme

**All design tokens are defined in:** `src/styles/tokens.css`

#### Quick Start: Change the Primary Color

1. Open `src/styles/tokens.css`
2. Find the `--color-primary` token (around line 12)
3. Change the color value:
   ```css
   --color-primary: #3b82f6;  /* Change from #1ac87a to blue */
   ```
4. Save and refresh your browser

**That's it!** The primary color will update across:
- All buttons and links
- Hero section accents
- Border highlights
- Call-to-action elements

#### Available Token Categories

| Category | Location | Examples |
|----------|----------|----------|
| **Colors** | `:root` block | `--color-primary`, `--color-accent`, `--color-surface` |
| **Gradients** | Gradient section | `--gradient-primary`, `--gradient-surface` |
| **Typography** | Typography section | `--font-sans`, `--heading-1`, `--font-size-base` |
| **Spacing** | Spacing scale | `--space-1` through `--space-12` |
| **Shadows** | Shadows section | `--shadow-soft`, `--shadow-lift` |
| **Borders** | Border radius section | `--radius-sm`, `--radius-pill` |

#### View All Tokens

Open `public/theme-demo.html` in your browser to see:
- Every token value displayed with visual examples
- Live samples of colors, gradients, typography, and spacing
- All utility classes in action
- Instructions for making changes

```bash
# Serve locally
python3 -m http.server
# then open http://localhost:8000/public/theme-demo.html
```

#### Common Customizations

**Change heading fonts:**
```css
--font-sans: "Your Font", system-ui, sans-serif;
```

**Adjust spacing throughout site:**
```css
--space-4: 1.25rem;  /* Increase from 1rem */
```

**Modify the back-splash gradient:**
```css
--gradient-primary: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

**Update shadow intensity:**
```css
--shadow-soft: 0 20px 35px rgba(2, 6, 23, 0.5);
```

#### Utility Classes

The token system includes utility classes for rapid development:

```html
<!-- Typography -->
<p class="text-primary">Primary colored text</p>
<h2 class="heading-2">Consistent heading style</h2>

<!-- Backgrounds -->
<div class="bg-gradient">Gradient background</div>
<div class="bg-surface-elevated">Elevated surface</div>

<!-- Spacing -->
<div class="mt-4 mb-6 p-5">Margin & padding utilities</div>

<!-- Borders & Shadows -->
<div class="rounded-lg shadow-lift">Styled card</div>
```

See `public/theme-demo.html` for the complete list of utility classes.

#### Browser Support

The token system uses CSS Custom Properties (CSS variables), which are supported in:
- Chrome/Edge 49+
- Firefox 31+
- Safari 9.1+
- All modern mobile browsers

For older browsers, the site will use fallback values defined in the CSS.

---
