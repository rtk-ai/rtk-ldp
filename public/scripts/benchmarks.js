/* RTK benchmarks dashboard — client-side rendering.
 * Reads static JSON from /data/benchmarks/ (populated at deploy time from S3).
 *
 * The JSON is first-party (produced by benchmark-sessions/export_dashboard.py):
 * versions are validated numeric strings, ecosystem ids come from a fixed map.
 * Dynamic strings are still HTML-escaped via esc() before any innerHTML write.
 */
(function () {
  'use strict';

  var DATA_BASE = '/data/benchmarks';

  // No ecosystem list to maintain: the display name is derived from the id in
  // the data, and every ecosystem uses the same dot color (for now). New
  // ecosystems appear automatically — nothing to edit here.
  var ECO_DOT = '#00e599';
  function ecoName(id) {
    return String(id)
      .split(/[-_]/)
      .map(function (w) { return w ? w.charAt(0).toUpperCase() + w.slice(1) : w; })
      .join(' ');
  }
  function ecoMeta(id) { return { name: ecoName(id), color: ECO_DOT }; }

  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; }); }

  function fmtPct(x) {
    if (x === null || x === undefined || isNaN(x)) return '—';
    return (x >= 0 ? '+' : '') + Number(x).toFixed(1) + '%';
  }
  function fmtUsd(x) { return '$' + Number(x).toFixed(4); }
  function fmtUsdTotal(x) { return '$' + Number(x).toFixed(2); }
  function fmtCompact(n) {
    try { return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n); }
    catch (e) { return String(Math.round(n)); }
  }
  function fmtRate(x) { return Math.round(Number(x) * 100) + '%'; }

  // The "latest" tag is verified against the real current RTK release on GitHub
  // (https://github.com/rtk-ai/rtk/releases) rather than trusting the benchmark
  // index alone. releases/latest returns the latest *stable* tag (e.g. "v0.42.0")
  // and already excludes the "dev-*-rc.*" pre-releases, so the tag only appears
  // on the version that is actually the current published release. Falls back to
  // the index value if the API is unreachable (offline / rate-limited).
  var GH_LATEST_URL = 'https://api.github.com/repos/rtk-ai/rtk/releases/latest';
  function normVer(v) { return String(v).replace(/^v/i, '').trim(); }
  function fetchLatestRelease() {
    return fetch(GH_LATEST_URL, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.tag_name ? normVer(j.tag_name) : null; })
      .catch(function () { return null; });
  }

  var state = { index: null, versions: {}, trend: [], cur: null, latestRelease: null };

  function $(id) { return document.getElementById(id); }
  var elSidebar, elMobile, elEmpty, elContent, elTitle, elSubtitle, elPdf, elData, elKpis, elTable, elExtra;

  function getJSON(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' -> ' + r.status);
      return r.json();
    });
  }

  function boot() {
    getJSON(DATA_BASE + '/index.json')
      .then(function (index) {
        state.index = index;
        var versions = (index && index.versions) || [];
        if (!versions.length) { showEmpty(); return null; }
        return Promise.all(
          [
            getJSON(DATA_BASE + '/trend.json').catch(function () { return []; }),
            fetchLatestRelease()
          ].concat(
            versions.map(function (v) {
              return getJSON(DATA_BASE + '/' + v + '/metrics.json')
                .then(function (data) { state.versions[v] = data; })
                .catch(function () { /* skip unreadable version file */ });
            })
          )
        ).then(function (res) { state.trend = res[0] || []; state.latestRelease = res[1] || null; });
      })
      .then(function () {
        if (!state.index || !state.index.versions || !state.index.versions.length) return;
        buildSidebar();
        window.addEventListener('hashchange', render);
        render();
      })
      .catch(function (err) { console.error('[benchmarks]', err); showEmpty(); });
  }

  function showEmpty() {
    if (elSidebar) { elSidebar.textContent = ''; var d = document.createElement('div'); d.className = 'bench-sidebar-loading'; d.textContent = 'No data'; elSidebar.appendChild(d); }
    if (elEmpty) elEmpty.hidden = false;
    if (elContent) elContent.hidden = true;
  }

  function parseHash() {
    var h = (location.hash || '').replace(/^#/, '');
    var parts = h.split('/');
    var version = parts[0] || '';
    var scope = parts[1] || 'all';
    if (!state.versions[version]) version = state.index.latest_version || state.index.versions[0];
    if (scope !== 'all') {
      var ecos = (state.versions[version] && state.versions[version].ecosystems) || [];
      if (!ecos.some(function (e) { return e.ecosystem === scope; })) scope = 'all';
    }
    return { version: version, scope: scope };
  }
  function setHash(version, scope) { location.hash = '#' + version + '/' + (scope || 'all'); }

  function buildSidebar() {
    elSidebar.textContent = '';
    var cur = parseHash();
    var realLatest = state.latestRelease; // verified GitHub release (normalized), or null
    state.index.versions.forEach(function (v) {
      var vdata = state.versions[v];
      if (!vdata) return;
      // Tag "latest" only if this version is the real current release. When the
      // API is unavailable (realLatest === null), fall back to the index value.
      var isLatest = realLatest
        ? normVer(v) === realLatest
        : v === (state.index.latest_version || state.index.versions[0]);
      var open = v === cur.version;

      var group = document.createElement('div');
      group.className = 'bench-vgroup';
      group.setAttribute('data-open', open ? 'true' : 'false');
      group.setAttribute('data-version', v);

      var toggle = document.createElement('button');
      toggle.className = 'bench-vgroup-toggle';
      toggle.innerHTML = '<span>v' + esc(v) + (isLatest ? ' <span class="bench-latest-tag">latest</span>' : '') + '</span><span class="chev">▾</span>';
      toggle.addEventListener('click', function () {
        group.setAttribute('data-open', group.getAttribute('data-open') === 'true' ? 'false' : 'true');
      });

      var links = document.createElement('div');
      links.className = 'bench-vlinks';
      var aggSamples = (vdata.aggregate && (vdata.aggregate.sample_size_on + vdata.aggregate.sample_size_off)) || vdata.sample_size || 0;
      links.appendChild(makeLink(v, 'all', 'All', null, aggSamples));
      (vdata.ecosystems || []).forEach(function (e) {
        var m = ecoMeta(e.ecosystem);
        links.appendChild(makeLink(v, e.ecosystem, m.name, m.color, (e.sample_size_on || 0) + (e.sample_size_off || 0)));
      });

      group.appendChild(toggle);
      group.appendChild(links);
      elSidebar.appendChild(group);
    });

    elMobile.textContent = '';
    state.index.versions.forEach(function (v) {
      var vdata = state.versions[v];
      if (!vdata) return;
      var og = document.createElement('optgroup');
      og.label = 'v' + v;
      var oAll = document.createElement('option');
      oAll.value = v + '/all'; oAll.textContent = 'All ecosystems';
      og.appendChild(oAll);
      (vdata.ecosystems || []).forEach(function (e) {
        var o = document.createElement('option');
        o.value = v + '/' + e.ecosystem;
        o.textContent = ecoMeta(e.ecosystem).name;
        og.appendChild(o);
      });
      elMobile.appendChild(og);
    });
    elMobile.addEventListener('change', function () {
      var parts = elMobile.value.split('/');
      setHash(parts[0], parts[1]);
    });
  }

  function makeLink(version, scope, label, dotColor, samples) {
    var btn = document.createElement('button');
    btn.className = 'bench-vlink';
    btn.setAttribute('data-version', version);
    btn.setAttribute('data-scope', scope);
    if (dotColor) {
      var dot = document.createElement('span');
      dot.className = 'bench-eco-dot';
      dot.style.background = dotColor;
      btn.appendChild(dot);
    }
    var name = document.createElement('span');
    name.textContent = label;
    btn.appendChild(name);
    if (samples) {
      var s = document.createElement('span');
      s.className = 'samples';
      s.textContent = String(samples);
      btn.appendChild(s);
    }
    btn.addEventListener('click', function () { setHash(version, scope); });
    return btn;
  }

  function syncActive(cur) {
    var btns = elSidebar.querySelectorAll('.bench-vlink');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.classList.toggle('active', b.getAttribute('data-version') === cur.version && b.getAttribute('data-scope') === cur.scope);
    }
    var groups = elSidebar.querySelectorAll('.bench-vgroup');
    for (var j = 0; j < groups.length; j++) {
      if (groups[j].getAttribute('data-version') === cur.version) groups[j].setAttribute('data-open', 'true');
    }
    if (elMobile) elMobile.value = cur.version + '/' + cur.scope;
  }

  function metricFor(cur) {
    var vdata = state.versions[cur.version];
    if (cur.scope === 'all') return vdata.aggregate;
    var found = (vdata.ecosystems || []).filter(function (e) { return e.ecosystem === cur.scope; })[0];
    return found || vdata.aggregate;
  }
  function sig(p) { return (p !== null && p !== undefined && p < 0.05); }
  function signClass(x) { return x > 0 ? 'pos' : (x < 0 ? 'neg' : 'muted'); }

  function render() {
    if (!state.index) return;
    var cur = parseHash();
    state.cur = cur;
    if (location.hash !== '#' + cur.version + '/' + cur.scope) {
      history.replaceState(null, '', '#' + cur.version + '/' + cur.scope);
    }
    syncActive(cur);
    elEmpty.hidden = true;
    elContent.hidden = false;

    var vdata = state.versions[cur.version];
    var m = metricFor(cur);
    var isAll = cur.scope === 'all';
    var ecoName = isAll ? 'all ecosystems' : ecoMeta(cur.scope).name;

    elTitle.textContent = 'RTK v' + cur.version + ' — ' + ecoName;
    var sessions = isAll
      ? (vdata.sample_size || ((m.sample_size_on || 0) + (m.sample_size_off || 0)))
      : ((m.sample_size_on || 0) + (m.sample_size_off || 0));
    elSubtitle.textContent =
      sessions + ' sessions (ON ' + (m.sample_size_on || 0) + ' / OFF ' + (m.sample_size_off || 0) + ')' +
      ' · pass rate ' + fmtRate(m.pass_rate.on) + ' ON / ' + fmtRate(m.pass_rate.off) + ' OFF';

    renderPdf(cur, vdata, m);
    renderData(cur, vdata);
    renderKpis(m, isAll);
    renderImpact(m);
    renderTable(cur, vdata, m);
    renderExtra(m);
  }

  function renderPdf(cur, vdata, m) {
    elPdf.textContent = '';
    var links = [];
    if (cur.scope === 'all') {
      // Only the combined report here — per-ecosystem PDFs live in their own section.
      if (vdata.pdf_combined_public_url)
        links.push({ url: vdata.pdf_combined_public_url, label: 'All ecosystems (combined)' });
    } else if (m.pdf_public_url) {
      links.push({ url: m.pdf_public_url, label: ecoMeta(cur.scope).name + ' report (PDF)' });
    }
    if (!links.length) {
      var span = document.createElement('span');
      span.className = 'bench-content-sub';
      span.textContent = 'No PDF report available.';
      elPdf.appendChild(span);
      return;
    }
    appendDownloadLinks(elPdf, links);
  }

  var DOWNLOAD_SVG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  function appendDownloadLinks(el, links) {
    links.forEach(function (l) {
      var a = document.createElement('a');
      a.className = 'bench-pdf-link';
      a.href = l.url;
      a.setAttribute('download', '');
      a.innerHTML = DOWNLOAD_SVG;
      a.appendChild(document.createTextNode(l.label));
      el.appendChild(a);
    });
  }

  // Raw CSV downloads for the current scope, built at fetch time from data/
  // (see scripts/fetch-benchmarks.py) and listed in metrics.json data_downloads.
  function renderData(cur, vdata) {
    if (!elData) return;
    elData.textContent = '';
    var downloads = (vdata.data_downloads || {})[cur.scope] || [];
    appendDownloadLinks(elData, downloads);
  }

  function kpiCard(label, value, cls, foot, isSig) {
    var el = document.createElement('div');
    el.className = 'bench-kpi';
    el.innerHTML =
      '<div class="bench-kpi-label">' + esc(label) + '</div>' +
      '<div class="bench-kpi-value ' + esc(cls) + '">' + esc(value) +
        (isSig ? ' <span class="sig" title="p &lt; 0.05">*</span>' : '') + '</div>' +
      '<div class="bench-kpi-foot">' + esc(foot) + '</div>';
    return el;
  }
  function renderKpis(m, isAll) {
    var c = m.cost, b = m.bash_bytes;
    var nOn = m.sample_size_on || 0, nOff = m.sample_size_off || 0;
    elKpis.textContent = '';
    var bashFoot, costFoot;
    if (isAll) {
      // "All" view: totals derived for display only (mean × sample size) — the
      // import is untouched; savings % stays the aggregate figure from the data.
      bashFoot = 'ON ' + fmtBytes(b.on_mean * nOn) + ' vs OFF ' + fmtBytes(b.off_mean * nOff) + ' total';
      costFoot = 'ON ' + fmtUsdTotal(c.on_mean_usd * nOn) + ' vs OFF ' + fmtUsdTotal(c.off_mean_usd * nOff) + ' total';
    } else {
      bashFoot = 'ON ' + fmtBytes(b.on_mean) + ' vs OFF ' + fmtBytes(b.off_mean) + ' avg/run';
      costFoot = 'ON ' + fmtUsd(c.on_mean_usd) + ' vs OFF ' + fmtUsd(c.off_mean_usd) + ' avg/run';
    }
    elKpis.appendChild(kpiCard('Bash output savings', fmtPct(b.savings_pct), sig(b.p_value) ? signClass(b.savings_pct) : 'neutral', bashFoot, sig(b.p_value)));
    elKpis.appendChild(kpiCard('Cost savings', fmtPct(c.savings_pct), sig(c.p_value) ? signClass(c.savings_pct) : 'neutral', costFoot, sig(c.p_value)));
  }

  // "Savings chain": RTK's direct, big win on Bash output cascades downstream
  // into (smaller) input-token and cost savings. Rendered as a clean DOM flow
  // (no canvas) so the causal chain reads at a glance — magnitude bars are
  // scaled to the largest link, so the chain visibly narrows source → bottom line.
  function renderImpact(m) {
    var bash = m.bash_bytes || {}, tok = m.tokens || {}, cost = m.cost || {};
    function n(x) { return (x === null || x === undefined || isNaN(x)) ? 0 : Number(x); }
    function absPct(x) { return Math.abs(n(x)).toFixed(1) + '%'; }
    var bashSav = n(bash.savings_pct), tokSav = n(tok.savings_pct), costSav = n(cost.savings_pct);

    // Left column note: lead with the big direct win, then the honest cascade.
    // Built with DOM nodes (textContent only) — no innerHTML.
    var note = $('bench-impact-note');
    if (note) {
      note.textContent = '';
      var strong = function (t) { var s = document.createElement('strong'); s.textContent = t; return s; };
      var txt = function (t) { return document.createTextNode(t); };
      note.appendChild(txt('RTK cuts '));
      note.appendChild(strong(absPct(bashSav)));
      note.appendChild(txt(' of bash output bytes, which cascades into '));
      note.appendChild(strong(absPct(tokSav)));
      note.appendChild(txt(' fewer input tokens for an average of '));
      note.appendChild(strong(absPct(costSav)));
      note.appendChild(txt(' lower cost.'));
    }



    var host = $('bench-impact-chain');
    if (!host) return;
    host.textContent = '';

    var steps = [
      { label: 'Bash output',  sav: bashSav, off: fmtBytes(bash.off_mean),   on: fmtBytes(bash.on_mean),   tag: 'RTK OSS surface', hero: true },
      { label: 'Input tokens', sav: tokSav,  off: fmtTok(tok.off_mean),      on: fmtTok(tok.on_mean),      tag: 'sent to the model' },
      { label: 'Cost (USD)',   sav: costSav, off: fmtUsd(cost.off_mean_usd), on: fmtUsd(cost.on_mean_usd), tag: 'the bottom line' }
    ];
    var connectors = ['part of input tokens', 'billed per token and additional to Output tokens'];
    var maxAbs = Math.max(Math.abs(bashSav), Math.abs(tokSav), Math.abs(costSav), 1);

    var mk = function (cls, t) { var e = document.createElement('div'); e.className = cls; if (t != null) e.textContent = t; return e; };
    var span = function (cls, t) { var e = document.createElement('span'); e.className = cls; e.textContent = t; return e; };

    steps.forEach(function (s, i) {
      if (i > 0) {
        var conn = mk('bench-chain-conn');
        var arrow = span('bench-chain-arrow', '↓');
        arrow.setAttribute('aria-hidden', 'true');
        conn.appendChild(arrow);
        conn.appendChild(span('bench-chain-conn-lab', connectors[i - 1] || ''));
        host.appendChild(conn);
      }
      var neg = s.sav < 0;
      var step = mk('bench-chain-step' + (s.hero ? ' is-hero' : '') + (neg ? ' is-neg' : ''));

      var head = mk('bench-chain-head');
      head.appendChild(span('bench-chain-metric', s.label));
      head.appendChild(span('bench-chain-pct', fmtPct(s.sav)));
      step.appendChild(head);

      var barWrap = mk('bench-chain-bar');
      var bar = document.createElement('span');
      bar.style.width = Math.max(Math.abs(s.sav) / maxAbs * 100, 3) + '%';
      barWrap.appendChild(bar);
      step.appendChild(barWrap);

      step.appendChild(mk('bench-chain-sub', s.off + ' → ' + s.on + ' · ' + s.tag));
      host.appendChild(step);
    });
  }

  // The * marker has no color of its own — it inherits the cell's (see .sig in the page CSS).
  function cellPct(x, p) {
    var cls = sig(p) ? signClass(x) : 'muted';
    return '<td class="num ' + cls + '">' + fmtPct(x) + (sig(p) ? ' <span class="sig" title="p &lt; 0.05">*</span>' : '') + '</td>';
  }
  function fmtDur(ms) {
    if (!ms) return '—';
    var s = ms / 1000;
    return s >= 60 ? Math.round(s / 60) + 'm ' + Math.round(s % 60) + 's' : s.toFixed(1) + 's';
  }
  function fmtBytes(b) {
    if (!b && b !== 0) return '—';
    if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
    if (b >= 1024) return (b / 1024).toFixed(1) + ' KB';
    return Math.round(b) + ' B';
  }
  function fmtTok(n) {
    if (!n && n !== 0) return '—';
    return fmtCompact(n);
  }
  function winner(savPct, pVal) {
    if (savPct === null || savPct === undefined) return '<td>—</td>';
    var isSig = sig(pVal);
    if (savPct > 0)  return isSig ? '<td class="win-on">✓ RTK</td>' : '<td class="muted">~ RTK</td>';
    if (savPct < 0)  return isSig ? '<td class="win-off">✗ OFF</td>' : '<td class="muted">~ OFF</td>';
    return '<td>Tie</td>';
  }

  function metricRows(m) {
    var rows = '';
    // Cost
    rows += '<tr class="metric-row">' +
      '<td>Cost (USD)</td>' +
      '<td class="num">' + fmtUsd(m.cost.off_mean_usd || 0) + '</td>' +
      '<td class="num">' + fmtUsd(m.cost.on_mean_usd || 0) + '</td>' +
      cellPct(m.cost.savings_pct, m.cost.p_value) +
      '<td class="num muted">' + (m.cost.p_value !== undefined ? Number(m.cost.p_value).toFixed(3) : '—') + '</td>' +
      winner(m.cost.savings_pct, m.cost.p_value) + '</tr>';
    // Tokens
    rows += '<tr class="metric-row">' +
      '<td>Input tokens</td>' +
      '<td class="num">' + fmtTok(m.tokens.off_mean) + '</td>' +
      '<td class="num">' + fmtTok(m.tokens.on_mean) + '</td>' +
      cellPct(m.tokens.savings_pct, m.tokens.p_value) +
      '<td class="num muted">' + (m.tokens.p_value !== undefined ? Number(m.tokens.p_value).toFixed(3) : '—') + '</td>' +
      winner(m.tokens.savings_pct, m.tokens.p_value) + '</tr>';
    // Bash bytes
    rows += '<tr class="metric-row">' +
      '<td>Bash output bytes <span class="muted">(Primary KPI)</span></td>' +
      '<td class="num">' + fmtBytes(m.bash_bytes.off_mean) + '</td>' +
      '<td class="num">' + fmtBytes(m.bash_bytes.on_mean) + '</td>' +
      cellPct(m.bash_bytes.savings_pct, m.bash_bytes.p_value) +
      '<td class="num muted">' + (m.bash_bytes.p_value !== undefined ? Number(m.bash_bytes.p_value).toFixed(3) : '—') + '</td>' +
      winner(m.bash_bytes.savings_pct, m.bash_bytes.p_value) + '</tr>';
    // API calls
    rows += '<tr class="metric-row">' +
      '<td>API calls <span class="muted">(Behavioral)</span></td>' +
      '<td class="num">' + Number(m.api_calls.off_mean).toFixed(1) + '</td>' +
      '<td class="num">' + Number(m.api_calls.on_mean).toFixed(1) + '</td>' +
      '<td class="num muted">—</td>' +
      '<td class="num muted">—</td>' +
      '<td>—</td></tr>';
    // Duration
    if (m.duration_ms) {
      rows += '<tr class="metric-row">' +
        '<td>Duration</td>' +
        '<td class="num">' + fmtDur(m.duration_ms.off_mean) + '</td>' +
        '<td class="num">' + fmtDur(m.duration_ms.on_mean) + '</td>' +
        '<td class="num muted">—</td>' +
        '<td class="num muted">—</td>' +
        '<td>—</td></tr>';
    }
    // Pass rate
    rows += '<tr class="metric-row">' +
      '<td>Pass rate</td>' +
      '<td class="num">' + fmtRate(m.pass_rate.off) + '</td>' +
      '<td class="num">' + fmtRate(m.pass_rate.on) + '</td>' +
      '<td class="num muted">—</td>' +
      '<td class="num muted">—</td>' +
      '<td>—</td></tr>';
    return rows;
  }

  function ecoCellHtml(id) {
    var meta = ecoMeta(id);
    return '<span class="eco-cell"><span class="bench-eco-dot" style="background:' + esc(meta.color) + '"></span>' + esc(meta.name) + '</span>';
  }

  var TABLE_HEAD = '<thead><tr>' +
    '<th>Metric</th><th>OFF Mean</th><th>ON Mean</th>' +
    '<th>Savings %</th><th>p-value</th><th>Winner</th>' +
    '</tr></thead>';

  function renderTable(cur, vdata) {
    var body = '';
    if (cur.scope === 'all') {
      // One section per ecosystem + aggregate
      var sections = [{ label: '<strong>All ecosystems</strong>', m: vdata.aggregate }];
      (vdata.ecosystems || []).forEach(function (e) {
        sections.push({ label: ecoCellHtml(e.ecosystem), m: e });
      });
      sections.forEach(function (s) {
        body += '<tr class="metric-section-head"><td colspan="7">' + s.label + '</td></tr>';
        body += metricRows(s.m);
      });
    } else {
      state.index.versions.forEach(function (v) {
        var vd = state.versions[v];
        if (!vd) return;
        var e = (vd.ecosystems || []).filter(function (x) { return x.ecosystem === cur.scope; })[0];
        if (!e) return;
        body += '<tr class="metric-section-head"><td colspan="7"><strong>v' + esc(v) + '</strong></td></tr>';
        body += metricRows(e);
      });
    }
    elTable.innerHTML = TABLE_HEAD + '<tbody>' + body + '</tbody>';
  }

  function renderExtra(m) {
    if (!elExtra) return;
    elExtra.textContent = '';
  }

  function cacheRefs() {
    elSidebar = $('bench-sidebar'); elMobile = $('bench-mobile-select');
    elEmpty = $('bench-empty'); elContent = $('bench-content'); elTitle = $('bench-title');
    elSubtitle = $('bench-subtitle'); elPdf = $('bench-pdf-links'); elData = $('bench-data-links'); elKpis = $('bench-kpis');
    elTable = $('bench-table');
    elExtra = $('bench-extra');
  }
  function init() { cacheRefs(); boot(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
