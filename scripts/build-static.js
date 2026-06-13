const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const basePath = normalizeBasePath(process.env.BASE_PATH || '');
const publicContactWebhookUrl = process.env.PUBLIC_CONTACT_WEBHOOK_URL || '';
const cdnUrl = (process.env.CDN_URL || '').replace(/\/$/, '');


function normalizeBasePath(value) {
  if (!value || value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const sourcePath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

function withStaticRuntime(html) {
  const runtimeConfig = [
    'window.SKYBALL_STATIC_SITE=true;',
    publicContactWebhookUrl
      ? `window.SKYBALL_CONTACT_WEBHOOK_URL=${JSON.stringify(publicContactWebhookUrl)};`
      : ''
  ].join('');
  const staticFlag = `<script>${runtimeConfig}</script>`;
  const withFlag = html.includes('window.SKYBALL_STATIC_SITE')
    ? html
    : html.replace('</head>', `  ${staticFlag}\n</head>`);

  return applyBasePath(withFlag);
}

function applyBasePath(html) {
  let result = html;

  // Apply CDN URL prefix to assets if specified
  if (cdnUrl) {
    result = result
      .replace(/(["'`])\/assets\//g, `$1${cdnUrl}/assets/`)
      .replace(/url\((["']?)\/assets\//g, `url($1${cdnUrl}/assets/`);
  } else if (basePath) {
    result = result
      .replace(/(["'`])\/assets\//g, `$1${basePath}/assets/`)
      .replace(/url\((["']?)\/assets\//g, `url($1${basePath}/assets/`);
  }

  // Apply basePath to css and js
  if (basePath) {
    result = result
      .replace(/(["'`])\/(css|js)\//g, `$1${basePath}/$2/`)
      .replace(/href=(["'])\/#([^"']*)\1/g, `href=$1${basePath}/#$2$1`)
      .replace(/href=(["'])\/\1/g, `href=$1${basePath}/$1`);
  }

  return result;
}

async function renderTemplate(templateName, outputPath, data = {}) {
  const templatePath = path.join(rootDir, 'views', templateName);
  const html = await ejs.renderFile(templatePath, data, {
    root: path.join(rootDir, 'views')
  });
  const finalHtml = withStaticRuntime(html);
  const absoluteOutputPath = path.join(distDir, outputPath);

  ensureDir(path.dirname(absoluteOutputPath));
  fs.writeFileSync(absoluteOutputPath, finalHtml, 'utf8');
}

async function main() {
  fs.rmSync(distDir, { recursive: true, force: true });
  ensureDir(distDir);

  const members = JSON.parse(fs.readFileSync(path.join(rootDir, 'members.json'), 'utf8'));
  const sidak = JSON.parse(fs.readFileSync(path.join(rootDir, 'sidak.json'), 'utf8'));
  const allMembers = { ...members, sidak };

  copyDir(path.join(rootDir, 'public'), distDir);
  copyDir(path.join(rootDir, 'assets'), path.join(distDir, 'assets'));

  await renderTemplate('index.ejs', 'index.html');

  for (const [memberKey, member] of Object.entries(allMembers)) {
    if (memberKey === 'lee') {
      await renderTemplate('lee.ejs', 'portfolio/lee/index.html', { member });
    } else if (memberKey === 'sidak') {
      await renderTemplate('sidak.ejs', 'portfolio/sidak/index.html', { member });
    } else {
      await renderTemplate('portfolio.ejs', `portfolio/${memberKey}/index.html`, { member });
    }
  }

  fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));

  // Generate sitemap.xml
  const siteUrl = (process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://skyballstudio.com')).replace(/\/$/, '');
  const sitemapUrls = [
    `${siteUrl}/`,
    ...Object.keys(allMembers).map(memberKey => `${siteUrl}/portfolio/${memberKey}`)
  ];
  
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url.endsWith('/') ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log(`Generated sitemap.xml with ${sitemapUrls.length} URLs`);

  console.log(`Static build completed in dist/${basePath ? ` with BASE_PATH=${basePath}` : ''}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
