# Hongyu Qu · Academic Homepage

Live site: [quhongyu.github.io](https://quhongyu.github.io/)

Static academic homepage built with HTML, CSS and JavaScript. It includes biography, research interests, scrollable news, publications, honors, education, research experience and academic service.

## Update the website

- Edit `index.template.html` for biography, research interests, honors and experiences.
- Edit `content/publications.json` for publications, author contribution markers, categories and project roles.
- Edit `content/profile.json` for news and academic service.
- Edit `content/scholar.json` for the dated Google Scholar citation snapshot.
- Add publication figures to `Figures/`.
- Edit `assets/style.css` and `assets/main.js` for appearance and interactions.

With Node.js installed, run:

```sh
npm run build
npm run check
npm run dev
```

Preview at http://127.0.0.1:4173. After editing, commit the regenerated `index.html` together with the source changes.

GitHub Pages serves the `main` branch root. The tracked `.nojekyll` file keeps the site buildless; no Ruby, Jekyll, npm dependencies or API keys are needed.

Publications are ordered as accepted first-author papers, accepted co-first-author papers, first-author arXiv papers, then other coauthored work, with newer years first within each group. Empty `topics` arrays keep papers visible only under All.

The original website is retained on the backup branch [backup/homepage-before-redesign-2026-11-26](https://github.com/quhongyu/quhongyu.github.io/tree/backup/homepage-before-redesign-2026-11-26).

## Attribution

Layout adapted from Binqian Xu’s homepage and AcadHomepage. See `LICENSE` for the retained MIT license.
