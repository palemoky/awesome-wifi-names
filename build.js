const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const SIMPLE_CATEGORIES = [
  { dir: 'Aliens',      label: 'Aliens',       icon: '👽', color: '#00ff9d' },
  { dir: 'China',       label: 'China',         icon: '🐉', color: '#ff6b6b' },
  { dir: 'Computer',    label: 'Computer',      icon: '💻', color: '#4ecdc4' },
  { dir: 'Math',        label: 'Math',          icon: '∑',  color: '#ffe66d' },
  { dir: 'SolarSystem', label: 'Solar System',  icon: '🪐', color: '#a78bfa' },
  { dir: 'USA',         label: 'USA',           icon: '🦅', color: '#60a5fa' },
  { dir: 'Others',      label: 'Others',        icon: '✨', color: '#f472b6' },
];

function parseMarkdownItems(content, categoryLabel) {
  const items = [];
  const lines = content.split('\n');
  let currentGroup = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // Top-level group: "- GroupName" (no leading spaces before "-")
    if (/^- /.test(line) && !line.includes('`')) {
      currentGroup = line.replace(/^- /, '').trim();
      continue;
    }

    // Wi-Fi name entry (indented, contains backtick)
    if (line.includes('`')) {
      const isFavorite = line.includes('🥳');
      const match = line.match(/`([^`]+)`/);
      if (!match) continue;
      const name = match[1];
      const afterName = line.slice(line.lastIndexOf('`') + 1).trim();
      items.push({ name, group: currentGroup, description: afterName, favorite: isFavorite, category: categoryLabel });
    }
  }
  return items;
}

// Collect all wifi name items
const allItems = [];

for (const cat of SIMPLE_CATEGORIES) {
  const readmePath = path.join(ROOT, cat.dir, 'README.md');
  if (!fs.existsSync(readmePath)) continue;
  const content = fs.readFileSync(readmePath, 'utf8');
  allItems.push(...parseMarkdownItems(content, cat.label));
}

// MoviesAndTV: read each .md file (skip README.md)
const movieDir = path.join(ROOT, 'MoviesAndTV');
const movieFiles = fs.readdirSync(movieDir).filter(f => f.endsWith('.md') && f !== 'README.md');
for (const file of movieFiles) {
  const content = fs.readFileSync(path.join(movieDir, file), 'utf8');
  const franchise = path.basename(file, '.md');
  const items = parseMarkdownItems(content, 'Movies & TV');
  // Tag franchise as group if item has no group
  for (const item of items) {
    if (!item.group) item.group = franchise;
  }
  allItems.push(...items);
}

const categoriesForFilter = [
  ...SIMPLE_CATEGORIES.map(c => c.label),
  'Movies & TV',
];

const categoryMeta = {
  'Aliens':      { icon: '👽', color: '#00ff9d' },
  'China':       { icon: '🐉', color: '#ff6b6b' },
  'Computer':    { icon: '💻', color: '#4ecdc4' },
  'Math':        { icon: '∑',  color: '#ffe66d' },
  'Solar System':{ icon: '🪐', color: '#a78bfa' },
  'USA':         { icon: '🦅', color: '#60a5fa' },
  'Others':      { icon: '✨', color: '#f472b6' },
  'Movies & TV': { icon: '🎬', color: '#fb923c' },
};

const totalCount = allItems.length;

const itemsJson = JSON.stringify(allItems);
const categoriesJson = JSON.stringify(categoriesForFilter);
const metaJson = JSON.stringify(categoryMeta);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Awesome Wi-Fi Names</title>
<style>
  :root {
    --bg: #07080f;
    --bg2: #0d0f1a;
    --bg3: #111827;
    --border: rgba(255,255,255,0.07);
    --text: #e2e8f0;
    --text-muted: #64748b;
    --accent: #818cf8;
    --accent2: #34d399;
    --radius: 12px;
    --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Background grid ── */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(129,140,248,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(129,140,248,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none; z-index: 0;
  }

  /* ── Header ── */
  header {
    position: relative; z-index: 10;
    padding: 60px 24px 40px;
    text-align: center;
  }
  .logo {
    display: inline-flex;
    align-items: center; justify-content: center;
    width: 72px; height: 72px;
    border-radius: 20px;
    background: linear-gradient(135deg, #818cf8 0%, #34d399 100%);
    margin-bottom: 20px;
    box-shadow: 0 0 40px rgba(129,140,248,0.4);
    animation: pulse 3s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 30px rgba(129,140,248,0.4); }
    50% { box-shadow: 0 0 60px rgba(129,140,248,0.7), 0 0 80px rgba(52,211,153,0.3); }
  }
  .logo svg { width: 38px; height: 38px; fill: white; }
  h1 {
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 800;
    letter-spacing: -1px;
    background: linear-gradient(135deg, #818cf8 0%, #34d399 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .subtitle {
    margin-top: 10px;
    color: var(--text-muted);
    font-size: 16px;
  }
  .stats {
    display: inline-flex; gap: 24px;
    margin-top: 20px;
    padding: 10px 24px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 50px;
    font-size: 13px; color: var(--text-muted);
  }
  .stats span { color: var(--accent); font-weight: 700; }

  /* ── Search & Filter ── */
  .controls {
    position: relative; z-index: 10;
    max-width: 900px;
    margin: 0 auto 32px;
    padding: 0 24px;
  }
  .search-wrap {
    position: relative;
    margin-bottom: 20px;
  }
  .search-icon {
    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none;
  }
  #search {
    width: 100%;
    padding: 14px 16px 14px 48px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  #search:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(129,140,248,0.15);
  }
  #search::placeholder { color: var(--text-muted); }
  .filters {
    display: flex; flex-wrap: wrap; gap: 8px;
  }
  .filter-btn {
    padding: 7px 16px;
    border-radius: 50px;
    border: 1px solid var(--border);
    background: var(--bg2);
    color: var(--text-muted);
    font-size: 13px; font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    display: flex; align-items: center; gap: 6px;
    white-space: nowrap;
  }
  .filter-btn:hover { border-color: rgba(129,140,248,0.4); color: var(--text); }
  .filter-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
    box-shadow: 0 0 16px rgba(129,140,248,0.35);
  }

  /* ── Result count ── */
  .result-info {
    position: relative; z-index: 10;
    max-width: 1400px;
    margin: 0 auto 16px;
    padding: 0 24px;
    color: var(--text-muted);
    font-size: 13px;
  }

  /* ── Grid ── */
  .grid {
    position: relative; z-index: 10;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 80px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }

  /* ── Card ── */
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
    position: relative;
    overflow: hidden;
    animation: fadeIn 0.3s ease both;
    cursor: default;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 60%, rgba(129,140,248,0.04));
    pointer-events: none;
  }
  .card:hover {
    transform: translateY(-2px);
    border-color: rgba(129,140,248,0.3);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .card-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 8px; margin-bottom: 8px;
  }
  .wifi-name {
    font-family: var(--font-mono);
    font-size: 15px; font-weight: 600;
    color: #f1f5f9;
    word-break: break-all;
    line-height: 1.4;
    flex: 1;
  }
  .copy-btn {
    flex-shrink: 0;
    background: none; border: none;
    cursor: pointer;
    color: var(--text-muted);
    padding: 4px;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;
    display: flex; align-items: center;
  }
  .copy-btn:hover { color: var(--accent); background: rgba(129,140,248,0.1); }
  .copy-btn.copied { color: var(--accent2); }
  .card-meta {
    display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
    margin-bottom: 6px;
  }
  .badge-cat {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px;
    border-radius: 50px;
    font-size: 11px; font-weight: 600;
    border: 1px solid;
    opacity: 0.85;
  }
  .badge-fav {
    font-size: 11px; font-weight: 700;
    padding: 2px 8px;
    border-radius: 50px;
    background: rgba(251,191,36,0.12);
    color: #fbbf24;
    border: 1px solid rgba(251,191,36,0.3);
  }
  .group-label {
    font-size: 11px;
    color: var(--text-muted);
    font-style: italic;
  }
  .description {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
    line-height: 1.5;
  }

  /* ── Empty state ── */
  .empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 24px;
    color: var(--text-muted);
  }
  .empty-icon { font-size: 48px; margin-bottom: 12px; }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(80px);
    background: var(--accent);
    color: white;
    padding: 10px 24px;
    border-radius: 50px;
    font-size: 14px; font-weight: 500;
    box-shadow: 0 8px 24px rgba(129,140,248,0.4);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
    opacity: 0; pointer-events: none; z-index: 100;
  }
  .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

  /* ── Footer ── */
  footer {
    position: relative; z-index: 10;
    text-align: center;
    padding: 0 24px 40px;
    color: var(--text-muted);
    font-size: 13px;
  }
  footer a { color: var(--accent); text-decoration: none; }
  footer a:hover { text-decoration: underline; }

  @media (max-width: 600px) {
    .grid { grid-template-columns: 1fr; }
    .stats { gap: 16px; }
  }
</style>
</head>
<body>

<header>
  <div class="logo">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 8.5a14.5 14.5 0 0 1 21 0M5 12a12 12 0 0 1 14 0M8.5 15.5a8 8 0 0 1 7 0M12 19h.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  </div>
  <h1>Awesome Wi-Fi Names</h1>
  <p class="subtitle">Creative, funny &amp; unique network names for every personality</p>
  <div class="stats">
    <div><span id="total-count">${totalCount}</span> names</div>
    <div><span>8</span> categories</div>
    <div><span id="fav-count"></span> favorites</div>
  </div>
</header>

<div class="controls">
  <div class="search-wrap">
    <span class="search-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    </span>
    <input id="search" type="text" placeholder="Search Wi-Fi names, groups, descriptions…" autocomplete="off" spellcheck="false">
  </div>
  <div class="filters" id="filters"></div>
</div>

<div class="result-info" id="result-info"></div>
<div class="grid" id="grid"></div>

<footer>
  <p>Open source · <a href="https://github.com/palemoky/awesome-wifi-names" target="_blank" rel="noopener">GitHub</a> · MIT License</p>
</footer>

<div class="toast" id="toast">Copied to clipboard!</div>

<script>
const ALL_ITEMS = ${itemsJson};
const CATEGORIES = ${categoriesJson};
const META = ${metaJson};

const favCount = ALL_ITEMS.filter(i => i.favorite).length;
document.getElementById('fav-count').textContent = favCount;

let activeCategory = 'All';
let searchQuery = '';

// Build filter buttons
const filtersEl = document.getElementById('filters');
const allBtn = document.createElement('button');
allBtn.className = 'filter-btn active';
allBtn.textContent = '🌐 All';
allBtn.dataset.cat = 'All';
allBtn.addEventListener('click', () => setCategory('All'));
filtersEl.appendChild(allBtn);

CATEGORIES.forEach(cat => {
  const m = META[cat] || {};
  const btn = document.createElement('button');
  btn.className = 'filter-btn';
  btn.textContent = (m.icon || '') + ' ' + cat;
  btn.dataset.cat = cat;
  btn.style.setProperty('--cat-color', m.color || '#818cf8');
  btn.addEventListener('click', () => setCategory(cat));
  filtersEl.appendChild(btn);
});

function setCategory(cat) {
  activeCategory = cat;
  filtersEl.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
    if (b.dataset.cat === cat && cat !== 'All') {
      const color = META[cat]?.color || '#818cf8';
      b.style.background = color;
      b.style.borderColor = color;
      b.style.color = 'white';
      b.style.boxShadow = '0 0 16px ' + color + '55';
    } else if (b.dataset.cat === cat) {
      b.style.background = ''; b.style.borderColor = '';
      b.style.color = ''; b.style.boxShadow = '';
    } else {
      b.style.background = ''; b.style.borderColor = '';
      b.style.color = ''; b.style.boxShadow = '';
    }
  });
  render();
}

function escapeHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function render() {
  const q = searchQuery.toLowerCase();
  const filtered = ALL_ITEMS.filter(item => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      (item.group || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const grid = document.getElementById('grid');
  const info = document.getElementById('result-info');
  info.textContent = filtered.length === ALL_ITEMS.length
    ? ''
    : filtered.length + ' result' + (filtered.length !== 1 ? 's' : '') + ' found';

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty"><div class="empty-icon">📡</div><div>No Wi-Fi names found.<br>Try a different search or category.</div></div>';
    return;
  }

  grid.innerHTML = filtered.map((item, idx) => {
    const m = META[item.category] || {};
    const catColor = m.color || '#818cf8';
    const catIcon = m.icon || '';
    const delay = Math.min(idx * 18, 400);
    return \`<div class="card" style="animation-delay:\${delay}ms">
      <div class="card-header">
        <div class="wifi-name">\${escapeHtml(item.name)}</div>
        <button class="copy-btn" title="Copy" data-name="\${escapeHtml(item.name)}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
      <div class="card-meta">
        <span class="badge-cat" style="color:\${catColor};border-color:\${catColor}33;background:\${catColor}11">\${catIcon} \${escapeHtml(item.category)}</span>
        \${item.favorite ? '<span class="badge-fav">🥳 Fan Fav</span>' : ''}
      </div>
      \${item.group ? \`<div class="group-label">\${escapeHtml(item.group)}</div>\` : ''}
      \${item.description ? \`<div class="description">\${escapeHtml(item.description)}</div>\` : ''}
    </div>\`;
  }).join('');

  // Copy buttons
  grid.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.name).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = \`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>\`;
        showToast('Copied: ' + btn.dataset.name);
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = \`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>\`;
        }, 2000);
      });
    });
  });
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value;
  render();
});

render();
</script>
</body>
</html>`;

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
console.log(`Built dist/index.html — ${totalCount} Wi-Fi names across ${SIMPLE_CATEGORIES.length + 1} categories.`);
