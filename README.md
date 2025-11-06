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
