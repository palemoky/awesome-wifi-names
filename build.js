const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const SIMPLE_CATEGORIES = [
  { dir: 'Aliens',      label: 'Aliens',       icon: '👽', color: '#16a34a' },
  { dir: 'China',       label: 'China',         icon: '🐉', color: '#dc2626' },
  { dir: 'Computer',    label: 'Computer',      icon: '💻', color: '#0891b2' },
  { dir: 'Math',        label: 'Math',          icon: '∑',  color: '#d97706' },
  { dir: 'SolarSystem', label: 'Solar System',  icon: '🪐', color: '#7c3aed' },
  { dir: 'USA',         label: 'USA',           icon: '🦅', color: '#2563eb' },
  { dir: 'Others',      label: 'Others',        icon: '✨', color: '#db2777' },
];

// Returns array of groups: { category, group, items: [{name, description, favorite}] }
function parseMarkdownGroups(content, categoryLabel) {
  const groups = [];
  const lines = content.split('\n');
  let currentGroup = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    if (/^- /.test(line) && !line.includes('`')) {
      currentGroup = { category: categoryLabel, group: line.replace(/^- /, '').trim(), items: [] };
      groups.push(currentGroup);
      continue;
    }

    if (line.includes('`')) {
      const isFavorite = line.includes('🥳');
      const match = line.match(/`([^`]+)`/);
      if (!match) continue;
      const name = match[1];
      const afterName = line.slice(line.lastIndexOf('`') + 1).trim();
      if (currentGroup) {
        currentGroup.items.push({ name, description: afterName, favorite: isFavorite });
      } else {
        const g = { category: categoryLabel, group: null, items: [{ name, description: afterName, favorite: isFavorite }] };
        groups.push(g);
        currentGroup = g;
      }
    }
  }
  return groups.filter(g => g.items.length > 0);
}

const allGroups = [];

for (const cat of SIMPLE_CATEGORIES) {
  const readmePath = path.join(ROOT, cat.dir, 'README.md');
  if (!fs.existsSync(readmePath)) continue;
  const content = fs.readFileSync(readmePath, 'utf8');
  allGroups.push(...parseMarkdownGroups(content, cat.label));
}

// MoviesAndTV: each .md file (skip README.md), franchise name as default group
const movieDir = path.join(ROOT, 'MoviesAndTV');
const movieFiles = fs.readdirSync(movieDir).filter(f => f.endsWith('.md') && f !== 'README.md');
for (const file of movieFiles) {
  const content = fs.readFileSync(path.join(movieDir, file), 'utf8');
  const franchise = path.basename(file, '.md');
  const groups = parseMarkdownGroups(content, 'Movies & TV');
  for (const g of groups) {
    if (!g.group) g.group = franchise;
  }
  allGroups.push(...groups);
}

const totalNames = allGroups.reduce((s, g) => s + g.items.length, 0);
const totalFavs = allGroups.reduce((s, g) => s + g.items.filter(i => i.favorite).length, 0);

const ALL_CATEGORIES = [
  ...SIMPLE_CATEGORIES.map(c => c.label),
  'Movies & TV',
];

const CATEGORY_META = {
  'Aliens':      { icon: '👽', color: '#16a34a' },
  'China':       { icon: '🐉', color: '#dc2626' },
  'Computer':    { icon: '💻', color: '#0891b2' },
  'Math':        { icon: '∑',  color: '#d97706' },
  'Solar System':{ icon: '🪐', color: '#7c3aed' },
  'USA':         { icon: '🦅', color: '#2563eb' },
  'Others':      { icon: '✨', color: '#db2777' },
  'Movies & TV': { icon: '🎬', color: '#ea580c' },
};

const groupsJson      = JSON.stringify(allGroups);
const categoriesJson  = JSON.stringify(ALL_CATEGORIES);
const metaJson        = JSON.stringify(CATEGORY_META);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Awesome Wi-Fi Names</title>
<style>
  /* ── Tokens ── */
  :root {
    --radius: 12px;
    --font-mono: 'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace;
  }
  /* Light */
  @media (prefers-color-scheme: light) {
    :root {
      --bg:        #f1f5f9;
      --surface:   #ffffff;
      --surface2:  #f8fafc;
      --border:    #e2e8f0;
      --border2:   #cbd5e1;
      --text:      #0f172a;
      --text-2:    #334155;
      --text-muted:#64748b;
      --accent:    #6366f1;
      --accent-bg: #eef2ff;
      --shadow:    0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.04);
      --shadow-hover: 0 4px 16px rgba(0,0,0,.12);
      --fav-bg:    #fef9c3;
      --fav-text:  #92400e;
      --fav-border:#fde68a;
      --ssid-bg:   #f0fdf4;
      --ssid-text: #166534;
      --ssid-border:#bbf7d0;
      --pwd-bg:    #eff6ff;
      --pwd-text:  #1e40af;
      --pwd-border:#bfdbfe;
      --tag-bg:    #f1f5f9;
    }
  }
  /* Dark */
  @media (prefers-color-scheme: dark) {
    :root {
      --bg:        #0d1117;
      --surface:   #161b22;
      --surface2:  #1c2128;
      --border:    #30363d;
      --border2:   #484f58;
      --text:      #e6edf3;
      --text-2:    #adbac7;
      --text-muted:#768390;
      --accent:    #818cf8;
      --accent-bg: #1e1b4b;
      --shadow:    0 1px 3px rgba(0,0,0,.4), 0 4px 12px rgba(0,0,0,.3);
      --shadow-hover: 0 4px 20px rgba(0,0,0,.5);
      --fav-bg:    #292011;
      --fav-text:  #fbbf24;
      --fav-border:#78350f;
      --ssid-bg:   #0d2818;
      --ssid-text: #4ade80;
      --ssid-border:#166534;
      --pwd-bg:    #0c1a2e;
      --pwd-text:  #60a5fa;
      --pwd-border:#1e40af;
      --tag-bg:    #21262d;
    }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Header ── */
  header {
    padding: 56px 24px 36px;
    text-align: center;
  }
  .logo {
    display: inline-flex; align-items: center; justify-content: center;
    width: 64px; height: 64px; border-radius: 18px;
    background: linear-gradient(135deg, #6366f1, #34d399);
    margin-bottom: 18px;
    box-shadow: 0 0 0 4px var(--accent-bg);
  }
  .logo svg { width: 34px; height: 34px; }
  h1 {
    font-size: clamp(24px, 4vw, 42px);
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--text);
    margin-bottom: 8px;
  }
  h1 span {
    background: linear-gradient(135deg, #6366f1, #34d399);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .subtitle { color: var(--text-muted); font-size: 15px; }
  .stats {
    display: inline-flex; gap: 20px;
    margin-top: 18px;
    padding: 8px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 50px;
    font-size: 13px; color: var(--text-muted);
    box-shadow: var(--shadow);
  }
  .stats strong { color: var(--accent); }

  /* ── Controls ── */
  .controls {
    max-width: 860px; margin: 0 auto 24px; padding: 0 20px;
  }
  .search-wrap { position: relative; margin-bottom: 14px; }
  .search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none;
  }
  #search {
    width: 100%;
    padding: 12px 14px 12px 44px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text); font-size: 15px;
    outline: none;
    box-shadow: var(--shadow);
    transition: border-color .15s, box-shadow .15s;
  }
  #search:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-bg), var(--shadow);
  }
  #search::placeholder { color: var(--text-muted); }
  .filters { display: flex; flex-wrap: wrap; gap: 6px; }
  .filter-btn {
    padding: 5px 14px; border-radius: 50px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-muted); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all .15s; white-space: nowrap;
    box-shadow: var(--shadow);
  }
  .filter-btn:hover { color: var(--text); border-color: var(--border2); }
  .filter-btn.active {
    background: var(--accent); border-color: var(--accent);
    color: #fff; box-shadow: 0 2px 8px rgba(99,102,241,.35);
  }

  /* ── Result info ── */
  .result-info {
    max-width: 1440px; margin: 0 auto 12px;
    padding: 0 20px; font-size: 13px; color: var(--text-muted);
  }

  /* ── Grid ── */
  .grid {
    max-width: 1440px; margin: 0 auto;
    padding: 0 20px 80px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
    align-items: start;
  }

  /* ── Card ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: box-shadow .15s, transform .15s, border-color .15s;
    animation: fadeUp .25s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .card:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
    border-color: var(--border2);
  }

  /* Card head: category + group */
  .card-head {
    padding: 12px 14px 10px;
    border-bottom: 1px solid var(--border);
    display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  }
  .tag-cat {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 50px;
    font-size: 11px; font-weight: 600;
    background: var(--tag-bg); border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .tag-fav {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 2px 8px; border-radius: 50px;
    font-size: 11px; font-weight: 600;
    background: var(--fav-bg); border: 1px solid var(--fav-border);
    color: var(--fav-text);
  }
  .group-name {
    width: 100%; font-size: 12px; color: var(--text-muted);
    font-style: italic; margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Rows: SSID / PWD */
  .card-body { padding: 0; }
  .name-row {
    display: flex; align-items: stretch;
    border-bottom: 1px solid var(--border);
  }
  .name-row:last-child { border-bottom: none; }

  .row-label {
    flex-shrink: 0; width: 52px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; letter-spacing: .5px;
    border-right: 1px solid var(--border);
  }
  .row-label.ssid {
    background: var(--ssid-bg); color: var(--ssid-text);
  }
  .row-label.pwd {
    background: var(--pwd-bg); color: var(--pwd-text);
  }

  .row-value {
    flex: 1; display: flex; align-items: center;
    padding: 10px 10px 10px 12px;
    gap: 8px; min-width: 0;
  }
  .name-text {
    font-family: var(--font-mono);
    font-size: 14px; font-weight: 600;
    color: var(--text);
    word-break: break-all; line-height: 1.4;
    flex: 1;
  }
  .copy-btn {
    flex-shrink: 0;
    background: none; border: none; cursor: pointer;
    color: var(--text-muted); padding: 4px; border-radius: 6px;
    transition: color .12s, background .12s;
    display: flex; align-items: center;
  }
  .copy-btn:hover { color: var(--accent); background: var(--accent-bg); }
  .copy-btn.ok { color: #22c55e; }

  /* Extra alternatives */
  .alternatives {
    padding: 8px 14px 10px;
    border-top: 1px dashed var(--border);
    font-size: 11px; color: var(--text-muted);
  }
  .alternatives span {
    display: inline-block;
    font-family: var(--font-mono);
    background: var(--tag-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1px 6px;
    margin: 2px 2px 0 0;
    cursor: pointer;
    transition: background .12s, color .12s;
    color: var(--text-2);
  }
  .alternatives span:hover { background: var(--accent-bg); color: var(--accent); }

  /* Description */
  .description {
    padding: 6px 14px 10px;
    font-size: 12px; color: var(--text-muted); line-height: 1.5;
  }

  /* ── Empty ── */
  .empty {
    grid-column: 1/-1; text-align: center;
    padding: 80px 24px; color: var(--text-muted);
  }
  .empty-icon { font-size: 44px; margin-bottom: 10px; }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 28px; left: 50%;
    transform: translateX(-50%) translateY(70px);
    background: var(--text); color: var(--bg);
    padding: 9px 20px; border-radius: 50px;
    font-size: 13px; font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,.25);
    transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .3s;
    opacity: 0; pointer-events: none; z-index: 200;
    white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

  /* ── Footer ── */
  footer {
    text-align: center; padding: 0 24px 40px;
    font-size: 13px; color: var(--text-muted);
  }
  footer a { color: var(--accent); text-decoration: none; }
  footer a:hover { text-decoration: underline; }

  @media (max-width: 540px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>

<header>
  <div class="logo">
    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1.5 8.5a14.5 14.5 0 0 1 21 0M5 12a12 12 0 0 1 14 0M8.5 15.5a8 8 0 0 1 7 0M12 19h.01"/>
    </svg>
  </div>
  <h1>Awesome <span>Wi-Fi Names</span></h1>
  <p class="subtitle">Creative, funny &amp; unique network names — with matching passwords</p>
  <div class="stats">
    <div><strong>${totalNames}</strong> names</div>
    <div><strong>8</strong> categories</div>
    <div><strong>${totalFavs}</strong> favorites</div>
  </div>
</header>

<div class="controls">
  <div class="search-wrap">
    <span class="search-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    </span>
    <input id="search" type="text" placeholder="Search names, groups, themes…" autocomplete="off" spellcheck="false">
  </div>
  <div class="filters" id="filters"></div>
</div>

<div class="result-info" id="result-info"></div>
<div class="grid" id="grid"></div>

<footer>
  <p>Open source · <a href="https://github.com/palemoky/awesome-wifi-names" target="_blank" rel="noopener">GitHub</a> · MIT License</p>
</footer>

<div class="toast" id="toast"></div>

<script>
const ALL_GROUPS = ${groupsJson};
const CATEGORIES = ${categoriesJson};
const META = ${metaJson};

let activeCategory = 'All';
let searchQuery = '';

// Filter buttons
const filtersEl = document.getElementById('filters');
[['All','🌐'],...CATEGORIES.map(c=>[c,META[c]?.icon||''])].forEach(([cat,icon]) => {
  const btn = document.createElement('button');
  btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
  btn.dataset.cat = cat;
  btn.textContent = icon + ' ' + cat;
  btn.addEventListener('click', () => {
    activeCategory = cat;
    filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    render();
  });
  filtersEl.appendChild(btn);
});

function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

const COPY_ICON = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>\`;
const CHECK_ICON = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>\`;

function nameRow(labelClass, labelText, name) {
  return \`<div class="name-row">
    <div class="row-label \${labelClass}">\${labelText}</div>
    <div class="row-value">
      <span class="name-text">\${esc(name)}</span>
      <button class="copy-btn" data-name="\${esc(name)}" title="Copy">\${COPY_ICON}</button>
    </div>
  </div>\`;
}

function groupCard(g, idx) {
  const m = META[g.category] || {};
  const hasFav = g.items.some(i => i.favorite);
  const desc = g.items.map(i => i.description).filter(Boolean)[0] || '';
  const extras = g.items.slice(2);

  let rows = nameRow('ssid', 'SSID', g.items[0].name);
  if (g.items.length >= 2) rows += nameRow('pwd', 'PWD', g.items[1].name);

  const altHtml = extras.length > 0
    ? \`<div class="alternatives">
        <span style="margin-right:6px;font-family:inherit;background:none;border:none;padding:0">Also:</span>
        \${extras.map(e => \`<span data-name="\${esc(e.name)}" title="Click to copy">\${esc(e.name)}</span>\`).join('')}
       </div>\`
    : '';

  const descHtml = desc ? \`<div class="description">\${esc(desc)}</div>\` : '';

  return \`<div class="card" style="animation-delay:\${Math.min(idx*20,400)}ms">
    <div class="card-head">
      <span class="tag-cat">\${m.icon||''} \${esc(g.category)}</span>
      \${hasFav ? '<span class="tag-fav">🥳 Fav</span>' : ''}
      \${g.group ? \`<div class="group-name">\${esc(g.group)}</div>\` : ''}
    </div>
    <div class="card-body">
      \${rows}
    </div>
    \${altHtml}
    \${descHtml}
  </div>\`;
}

function render() {
  const q = searchQuery.toLowerCase();
  const filtered = ALL_GROUPS.filter(g => {
    if (activeCategory !== 'All' && g.category !== activeCategory) return false;
    if (!q) return true;
    return (
      g.items.some(i => i.name.toLowerCase().includes(q) || (i.description||'').toLowerCase().includes(q)) ||
      (g.group||'').toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
    );
  });

  const grid = document.getElementById('grid');
  const info = document.getElementById('result-info');
  const total = ALL_GROUPS.length;
  info.textContent = filtered.length === total ? '' : filtered.length + ' group' + (filtered.length!==1?'s':'') + ' found';

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty"><div class="empty-icon">📡</div><p>No results. Try a different search or category.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map((g, i) => groupCard(g, i)).join('');

  // Copy buttons (SSID / PWD rows)
  grid.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => doCopy(btn.dataset.name, btn));
  });

  // Alt chip click-to-copy
  grid.querySelectorAll('.alternatives span[data-name]').forEach(chip => {
    chip.addEventListener('click', () => {
      navigator.clipboard.writeText(chip.dataset.name).then(() => showToast('Copied: ' + chip.dataset.name));
    });
  });
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

function doCopy(name, btn) {
  navigator.clipboard.writeText(name).then(() => {
    btn.classList.add('ok'); btn.innerHTML = CHECK_ICON;
    showToast('Copied: ' + name);
    setTimeout(() => { btn.classList.remove('ok'); btn.innerHTML = COPY_ICON; }, 2000);
  });
}

document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value; render();
});

render();
</script>
</body>
</html>`;

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
console.log(`Built dist/index.html — ${totalNames} names in ${allGroups.length} groups across 8 categories.`);
