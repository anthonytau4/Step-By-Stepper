# Step by Stepper favicon setup for GitHub Pages

This bundle now includes these favicon files in the site root:

- `favicon.ico`
- `favicon.svg`
- `favicon.png`
- `favicon-32x32.png`
- `favicon-16x16.png`
- `apple-touch-icon.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `site.webmanifest`

## What was already done in this bundle

1. The favicon links were added directly to `index.html` so the current static site works immediately.
2. `_config.yml` was added with `jekyll-seo-tag` enabled.
3. `_includes/head.html` was added as a ready-made Jekyll example file for GitHub Pages theme overrides.

## If your repo is using a Jekyll theme on GitHub Pages

1. Keep the favicon files in the **root** of the publishing source.
2. Use `_includes/head.html` as your override, or merge the favicon lines into your theme's existing head include.
3. Commit and push.

## Suggested commands

```bash
git add -A
git commit -m "Add Step by Stepper favicon"
git push origin main
```

If your Pages source uses `master` or `gh-pages`, push to that branch instead.
