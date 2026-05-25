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

// Parse "Some Name （note in parens）" → { ssid, note }
function parseGroupHeader(raw) {
  const m = raw.match(/^(.*?)\s*[（(]([^）)]+)[）)]\s*$/);
  if (m) return { ssid: m[1].trim(), note: m[2].trim() };
  return { ssid: raw.trim(), note: '' };
}

// Returns groups: { category, ssid, note, passwords: [{name, description, favorite}] }
function parseMarkdownGroups(content, categoryLabel) {
  const groups = [];
  const lines = content.split('\n');
  let current = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // Top-level group header: starts with "- " and no backtick
    if (/^- /.test(line) && !line.includes('`')) {
      const { ssid, note } = parseGroupHeader(line.replace(/^- /, '').trim());
      current = { category: categoryLabel, ssid, note, passwords: [] };
      groups.push(current);
      continue;
    }

    // Password entry (indented, has backtick)
    if (line.includes('`')) {
      const isFavorite = line.includes('🥳');
      const match = line.match(/`([^`]+)`/);
      if (!match) continue;
      const name = match[1];
      const description = line.slice(line.lastIndexOf('`') + 1).trim();
      if (current) {
        current.passwords.push({ name, description, favorite: isFavorite });
      } else {
        // Orphan item — make it its own group
        current = { category: categoryLabel, ssid: name, note: description, passwords: [] };
        groups.push(current);
      }
    }
  }
  return groups.filter(g => g.ssid);
}

const allGroups = [];

for (const cat of SIMPLE_CATEGORIES) {
  const readmePath = path.join(ROOT, cat.dir, 'README.md');
  if (!fs.existsSync(readmePath)) continue;
  allGroups.push(...parseMarkdownGroups(fs.readFileSync(readmePath, 'utf8'), cat.label));
}

// MoviesAndTV — each .md file is a franchise
const movieDir = path.join(ROOT, 'MoviesAndTV');
fs.readdirSync(movieDir)
  .filter(f => f.endsWith('.md') && f !== 'README.md')
  .forEach(f => {
    allGroups.push(...parseMarkdownGroups(
      fs.readFileSync(path.join(movieDir, f), 'utf8'),
      'Movies & TV'
    ));
  });

const totalPasswords = allGroups.reduce((s, g) => s + g.passwords.length, 0);
const totalFavs      = allGroups.reduce((s, g) => s + g.passwords.filter(p => p.favorite).length, 0);

const ALL_CATEGORIES = [...SIMPLE_CATEGORIES.map(c => c.label), 'Movies & TV'];

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

// Favicon SVG (Wi-Fi signal on indigo rounded square)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#6366f1"/>
  <path d="M4.5 13.5a16 16 0 0 1 23 0M8.5 18a10 10 0 0 1 15 0M12.5 22.5a5 5 0 0 1 7 0M16 27h.5" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none"/>
</svg>`;

// ── HTML template ──────────────────────────────────────────────────
const groupsJson     = JSON.stringify(allGroups);
const categoriesJson = JSON.stringify(ALL_CATEGORIES);
const metaJson       = JSON.stringify(CATEGORY_META);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Awesome Wi-Fi Names</title>
<link rel="icon" href="favicon.svg">
<style>
  :root { --radius: 12px; --font-mono: 'JetBrains Mono','Fira Code','Cascadia Code',ui-monospace,monospace; }

  @media (prefers-color-scheme: light) {
    :root {
      --bg: #f1f5f9; --surface: #fff; --surface2: #f8fafc;
      --border: #e2e8f0; --border2: #cbd5e1;
      --text: #0f172a; --text2: #334155; --muted: #64748b;
      --accent: #6366f1; --accent-bg: #eef2ff;
      --shadow: 0 1px 3px rgba(0,0,0,.08),0 4px 12px rgba(0,0,0,.05);
      --shadow-h: 0 4px 20px rgba(0,0,0,.12);
      --fav-bg:#fef9c3; --fav-text:#92400e; --fav-bd:#fde68a;
      --ssid-bg:#f0fdf4; --ssid-text:#166534; --ssid-bd:#bbf7d0;
      --pwd-bg:#eff6ff;  --pwd-text:#1e40af; --pwd-bd:#bfdbfe;
      --tag-bg:#f1f5f9;
    }
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0d1117; --surface: #161b22; --surface2: #1c2128;
      --border: #30363d; --border2: #484f58;
      --text: #e6edf3; --text2: #adbac7; --muted: #768390;
      --accent: #818cf8; --accent-bg: #1e1b4b;
      --shadow: 0 1px 3px rgba(0,0,0,.4),0 4px 12px rgba(0,0,0,.3);
      --shadow-h: 0 4px 24px rgba(0,0,0,.5);
      --fav-bg:#292011; --fav-text:#fbbf24; --fav-bd:#78350f;
      --ssid-bg:#0d2818; --ssid-text:#4ade80; --ssid-bd:#166534;
      --pwd-bg:#0c1a2e;  --pwd-text:#60a5fa; --pwd-bd:#1e40af;
      --tag-bg:#21262d;
    }
  }

  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}

  /* Header */
  header{padding:52px 24px 32px;text-align:center}
  .logo{display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,#6366f1,#34d399);margin-bottom:16px;box-shadow:0 0 0 4px var(--accent-bg)}
  .logo svg{width:32px;height:32px}
  h1{font-size:clamp(22px,4vw,40px);font-weight:800;letter-spacing:-.5px;margin-bottom:8px}
  h1 span{background:linear-gradient(135deg,#6366f1,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .subtitle{color:var(--muted);font-size:14px}
  .stats{display:inline-flex;gap:18px;margin-top:16px;padding:7px 18px;background:var(--surface);border:1px solid var(--border);border-radius:50px;font-size:13px;color:var(--muted);box-shadow:var(--shadow)}
  .stats strong{color:var(--accent)}

  /* Controls */
  .controls{max-width:820px;margin:0 auto 20px;padding:0 20px}
  .search-wrap{position:relative;margin-bottom:12px}
  .search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
  #search{width:100%;padding:11px 14px 11px 42px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:15px;outline:none;box-shadow:var(--shadow);transition:border-color .15s,box-shadow .15s}
  #search:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-bg),var(--shadow)}
  #search::placeholder{color:var(--muted)}
  .filters{display:flex;flex-wrap:wrap;gap:6px}
  .filter-btn{padding:5px 14px;border-radius:50px;border:1px solid var(--border);background:var(--surface);color:var(--muted);font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;white-space:nowrap;box-shadow:var(--shadow)}
  .filter-btn:hover{color:var(--text);border-color:var(--border2)}
  .filter-btn.active{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 2px 8px rgba(99,102,241,.3)}

  .result-info{max-width:1440px;margin:0 auto 10px;padding:0 20px;font-size:13px;color:var(--muted)}

  /* Grid */
  .grid{max-width:1440px;margin:0 auto;padding:0 20px 80px;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;align-items:start}

  /* Card */
  .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow);transition:box-shadow .15s,transform .15s,border-color .15s;animation:fadeUp .22s ease both}
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .card:hover{box-shadow:var(--shadow-h);transform:translateY(-2px);border-color:var(--border2)}

  /* Card head */
  .card-head{padding:10px 12px 8px;border-bottom:1px solid var(--border);display:flex;flex-wrap:wrap;align-items:center;gap:5px}
  .tag-cat{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:50px;font-size:11px;font-weight:600;background:var(--tag-bg);border:1px solid var(--border);color:var(--muted)}
  .tag-fav{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:50px;font-size:11px;font-weight:600;background:var(--fav-bg);border:1px solid var(--fav-bd);color:var(--fav-text)}

  /* SSID row */
  .ssid-row{display:flex;align-items:center;border-bottom:1px solid var(--border)}
  .row-label{flex-shrink:0;width:50px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;letter-spacing:.4px;border-right:1px solid var(--border);align-self:stretch}
  .row-label.ssid{background:var(--ssid-bg);color:var(--ssid-text)}
  .row-label.pwd{background:var(--pwd-bg);color:var(--pwd-text)}
  .row-value{flex:1;display:flex;align-items:center;padding:9px 8px 9px 11px;gap:6px;min-width:0}
  .name-text{font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text);word-break:break-all;line-height:1.4;flex:1}
  .copy-btn{flex-shrink:0;background:none;border:none;cursor:pointer;color:var(--muted);padding:4px;border-radius:6px;transition:color .12s,background .12s;display:flex;align-items:center}
  .copy-btn:hover{color:var(--accent);background:var(--accent-bg)}
  .copy-btn.ok{color:#22c55e}

  /* PWD block: label spans all password rows */
  .pwd-block{display:flex;border-top:1px solid var(--border)}
  .pwd-block .row-label{align-items:flex-start;padding-top:10px;width:50px}
  .pwd-list{flex:1;min-width:0}
  .pwd-item{display:flex;align-items:flex-start;padding:8px 8px 8px 11px;gap:6px;border-bottom:1px solid var(--border)}
  .pwd-item:last-child{border-bottom:none}
  .pwd-item-body{flex:1;min-width:0;display:flex;align-items:center;gap:6px}
  .pwd-item-inner{flex:1;min-width:0}
  .pwd-desc{font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4}

  /* Note under SSID */
  .ssid-note{padding:5px 12px 7px 12px;font-size:11px;color:var(--muted);font-style:italic;border-bottom:1px solid var(--border)}

  /* Empty */
  .empty{grid-column:1/-1;text-align:center;padding:80px 24px;color:var(--muted)}
  .empty-icon{font-size:44px;margin-bottom:10px}

  /* Toast */
  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(70px);background:var(--text);color:var(--bg);padding:8px 20px;border-radius:50px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.25);transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .3s;opacity:0;pointer-events:none;z-index:200;white-space:nowrap}
  .toast.show{transform:translateX(-50%) translateY(0);opacity:1}

  footer{text-align:center;padding:0 24px 40px;font-size:13px;color:var(--muted)}
  footer a{color:var(--accent);text-decoration:none}
  footer a:hover{text-decoration:underline}
  @media(max-width:540px){.grid{grid-template-columns:1fr}}
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
  <p class="subtitle">Creative SSID + password pairings for every personality</p>
  <div class="stats">
    <div><strong>${allGroups.length}</strong> sets</div>
    <div><strong>${totalPasswords}</strong> passwords</div>
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
    <input id="search" type="text" placeholder="Search SSID, passwords, themes…" autocomplete="off" spellcheck="false">
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
const ALL_GROUPS   = ${groupsJson};
const CATEGORIES   = ${categoriesJson};
const META         = ${metaJson};

let activeCategory = 'All';
let searchQuery    = '';

// Build filter buttons
const filtersEl = document.getElementById('filters');
[['All', '🌐'], ...CATEGORIES.map(c => [c, META[c]?.icon || ''])].forEach(([cat, icon]) => {
  const btn = document.createElement('button');
  btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
  btn.dataset.cat = cat;
  btn.textContent = icon + ' ' + cat;
  btn.addEventListener('click', () => {
    activeCategory = cat;
    filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    render();
  });
  filtersEl.appendChild(btn);
});

const COPY_SVG  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const CHECK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

function esc(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function copyBtn(name) {
  return '<button class="copy-btn" data-name="' + esc(name) + '" title="Copy">' + COPY_SVG + '</button>';
}

function groupCard(g, idx) {
  const m = META[g.category] || {};
  const hasFav = g.passwords.some(p => p.favorite);
  const delay  = Math.min(idx * 18, 380);

  const noteHtml = g.note
    ? '<div class="ssid-note">' + esc(g.note) + '</div>'
    : '';

  let pwdHtml = '';
  if (g.passwords.length > 0) {
    const items = g.passwords.map(p => {
      const desc = p.description
        ? '<div class="pwd-desc">' + esc(p.description) + '</div>'
        : '';
      return (
        '<div class="pwd-item">' +
          '<div class="pwd-item-body">' +
            '<div class="pwd-item-inner">' +
              '<span class="name-text">' + esc(p.name) + '</span>' +
              desc +
            '</div>' +
            copyBtn(p.name) +
          '</div>' +
        '</div>'
      );
    }).join('');
    pwdHtml =
      '<div class="pwd-block">' +
        '<div class="row-label pwd">PWD</div>' +
        '<div class="pwd-list">' + items + '</div>' +
      '</div>';
  }

  return (
    '<div class="card" style="animation-delay:' + delay + 'ms">' +
      '<div class="card-head">' +
        '<span class="tag-cat">' + (m.icon || '') + ' ' + esc(g.category) + '</span>' +
        (hasFav ? '<span class="tag-fav">🥳 Fav</span>' : '') +
      '</div>' +
      '<div class="ssid-row">' +
        '<div class="row-label ssid">SSID</div>' +
        '<div class="row-value">' +
          '<span class="name-text">' + esc(g.ssid) + '</span>' +
          copyBtn(g.ssid) +
        '</div>' +
      '</div>' +
      noteHtml +
      pwdHtml +
    '</div>'
  );
}

function render() {
  const q = searchQuery.toLowerCase();
  const filtered = ALL_GROUPS.filter(g => {
    if (activeCategory !== 'All' && g.category !== activeCategory) return false;
    if (!q) return true;
    return (
      g.ssid.toLowerCase().includes(q) ||
      (g.note || '').toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.passwords.some(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      )
    );
  });

  const total = ALL_GROUPS.length;
  document.getElementById('result-info').textContent =
    filtered.length === total ? '' : filtered.length + ' set' + (filtered.length !== 1 ? 's' : '') + ' found';

  const grid = document.getElementById('grid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty"><div class="empty-icon">📡</div><p>No results. Try a different search or category.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map((g, i) => groupCard(g, i)).join('');

  // Wire up copy buttons
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
  }

  grid.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.name).then(() => {
        btn.classList.add('ok'); btn.innerHTML = CHECK_SVG;
        showToast('Copied: ' + btn.dataset.name);
        setTimeout(() => { btn.classList.remove('ok'); btn.innerHTML = COPY_SVG; }, 2000);
      });
    });
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
fs.writeFileSync(path.join(DIST, 'favicon.svg'), faviconSvg, 'utf8');
console.log(`Built dist/ — ${allGroups.length} sets, ${totalPasswords} passwords, ${totalFavs} favorites.`);
