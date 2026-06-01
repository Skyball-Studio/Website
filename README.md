# Skyball Studio Portfolio

Production-ready Express/EJS portfolio with a static export for GitHub Pages.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Static Build

```bash
npm run build
```

The static site is written to `dist/`. For GitHub project pages, build with:

```bash
BASE_PATH=/your-repo-name npm run build
```

## GitHub Pages

Push to `main`, then enable Pages in the repository settings with **GitHub Actions** as the source. The included workflow builds and deploys `dist/`.

On GitHub Pages, contact forms open a prepared email because Pages does not run the Express `/api/contact` backend. On Node hosting, the same forms use the backend route.

## Contact Webhook

For Node hosting, keep the webhook private on the server:

```bash
CONTACT_WEBHOOK_URL=https://your-webhook-url npm start
```

The Express API saves the submission locally and forwards it to the webhook.

For GitHub Pages, you can build with a public browser-safe webhook endpoint:

```bash
PUBLIC_CONTACT_WEBHOOK_URL=https://your-public-form-endpoint npm run build
```

Do not use a secret Discord, Slack, Zapier, or Make webhook directly in `PUBLIC_CONTACT_WEBHOOK_URL`; static site values are visible in the browser. Use a public form endpoint or a tiny proxy/API that allows CORS.

## Private Submissions

Local/Node submissions are written to `.data/submissions.json` by default and `.data/` is ignored by git. You can override the path on real hosting:

```bash
SUBMISSIONS_FILE=/secure/path/submissions.json npm start
```

Do not commit real `submissions.json` data. If it was already tracked in git, remove it from tracking with `git rm --cached submissions.json`.
