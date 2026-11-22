# hansteve.com

Steve Han’s personal site. SvelteKit pre-renders the portfolio, CV and project pages as static HTML.

```sh
npm ci
npm run dev
```

Use Node.js 22. To check types and build the public site:

```sh
npm run check
npm run build
```

GitHub Actions builds `build/` and deploys it to GitHub Pages from `main`. The build uses `https://hansteve.com` for canonical URLs. The public build excludes writing drafts.
