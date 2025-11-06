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

## 🔧 Full Jekyll Build
This site now ships with a Bundler definition so you can run the canonical Jekyll pipeline (matching the GitHub Pages build process) locally.

```bash
# install gems into ./vendor/bundle to keep the repo clean
bundle config set --local path 'vendor/bundle'
bundle install

# build the production site into ./_site
bundle exec jekyll build

# or serve locally with live reload
bundle exec jekyll serve
```

If Bundler cannot reach https://rubygems.org/ (common on locked-down CI or offline environments), retry the `bundle install` step later or mirror the required gems. Once the gems are installed, `bundle exec jekyll build` will run without additional configuration.
