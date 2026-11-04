// Paints the page from the data block the build writes: each family's Kepler window and its
// dark and light sweep, the catalog's search, the hero's solar system, the star field and Kep.
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var data = { families: [], hero: [] };
  try {
    var block = document.getElementById('gallery-data');
    if (block) data = JSON.parse(block.textContent);
  } catch (err) {
    // The page still reads without previews.
  }

  var families = {};
  data.families.forEach(function (f) { families[f.slug] = f; });

  function mix(hex, other, amount) {
    var out = '#';
    for (var i = 1; i < 7; i += 2) {
      var a = parseInt(hex.slice(i, i + 2), 16);
      var b = parseInt(other.slice(i, i + 2), 16);
      out += ('0' + Math.round(a + (b - a) * amount).toString(16)).slice(-2);
    }
    return out;
  }

  function rgba(hex, alpha) {
    return 'rgba(' + parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16) + ',' + alpha + ')';
  }

  // A theme's planet is lit in its brand color: bright on the lit side, dark on the far side.
  function setPlanet(el, preview) {
    var brand = preview.colors.brand;
    el.style.setProperty('--p-hi', mix(brand, '#ffffff', 0.72));
    el.style.setProperty('--p-mid', brand);
    el.style.setProperty('--p-lo', mix(brand, '#000000', 0.68));
    el.style.setProperty('--p-glow', rgba(brand, 0.65));
  }

  // The catalog's cards. Each family's picture is a recreation of Kepler's dashboard (the task
  // list, one task open in the preview panel, its terminal below) painted from the theme's
  // validated colors. A family with a dark and a light theme rests split on a diagonal and sweeps
  // between them. All the text in the window is fixed; no family text goes into its markup.
  var W = 760;
  var H = 500;
  var ICONS = {
    plus: '<path d="M8 3v10M3 8h10"/>',
    chev: '<path d="m4.5 6.5 3.5 3.5 3.5-3.5"/>',
    kebab: '<circle cx="8" cy="3.5" r=".6"/><circle cx="8" cy="8" r=".6"/><circle cx="8" cy="12.5" r=".6"/>',
    check: '<path d="m3.5 8.5 3 3 6-7"/>',
    todo: '<rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path d="m5.5 8 2 2 3.5-4"/>',
    rocket: '<path d="M9.5 2.5c2 0 4 0 4 0s0 2-1 4l-4 4-3-3 4-5ZM5.5 7.5l-2.5.5L2 10l3 .5M8.500 10.500 8 13l2 1 .5-3M4 12.500 2.500 14"/>',
    graph: '<circle cx="8" cy="8" r="5.500"/><circle cx="8" cy="8" r="1.500"/><path d="M8 2.500v4M12.800 10.800 9.300 8.700"/>',
    bolt: '<path d="M9 2 3.500 9.500H8L7 14l5.500-7.500H8L9 2Z"/>',
    term: '<rect x="2" y="3" width="12" height="10" rx="2"/><path d="m4.500 6 2 2-2 2M8 10.500h3"/>',
    spark: '<path d="M8 1.500v13M1.500 8h13M3.400 3.400l9.200 9.200M12.600 3.400l-9.200 9.200"/>',
    gear: '<circle cx="8" cy="8" r="2"/><path d="M8 2v1.500M8 12.500V14M2 8h1.500M12.500 8H14M3.800 3.800l1 1M11.200 11.200l1 1M12.200 3.800l-1 1M4.800 11.200l-1 1"/>',
    msg: '<path d="M2.500 3.500h11v7.500H7L4 13.500V11H2.500V3.500Z"/>',
    ask: '<circle cx="8" cy="8" r="3.500"/><path d="M2 11.500c-1-1.500 2-3.500 5.500-5s7-2 7.500-.5"/>',
    pr: '<circle cx="4" cy="3.500" r="1.500"/><circle cx="4" cy="12.500" r="1.500"/><circle cx="12" cy="12.500" r="1.500"/><path d="M4 5v6M12 11V6.500a2 2 0 0 0-2-2H8"/>',
  };

  function icon(n) { return '<svg class="i" aria-hidden="true"><use href="#kw-' + n + '"/></svg>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // The build keeps a family-file token only when it is a plain hex or oklch() color, so any
  // non-empty string here is one; a missing token counts as unset.
  function isColor(v) { return typeof v === 'string' && v !== ''; }

  // Everything the window paints from. The preview block is what the validator reports; the AI,
  // diff and scrollbar colors are the family's own when it sets them, with a stated fallback when it doesn't.
  // Only the ANSI colors the terminal and its prompt use are set (--a1 to --a6).
  function vars(theme) {
    var p = theme.preview, c = p.colors, a = p.terminal.ansi, s = p.syntax, t = theme.extras || {};
    var out = {
      canvas: c.canvas, raised: c.raised, ink: c.ink, text: c.text, muted: c.muted, edge: c.edge,
      selected: c.selected, 'sel-ink': c.selectedInk, brand: c.brand, fill: c.fill, 'on-fill': c.onFill,
      'term-bg': p.terminal.background, 'term-fg': p.terminal.foreground,
      ai: isColor(t.ai) ? t.ai : s.keyword,
      add: isColor(t['diff-added']) ? t['diff-added'] : rgba(a[2], 0.16),
      rem: isColor(t['diff-removed']) ? t['diff-removed'] : rgba(a[1], 0.16),
      'fill-s': rgba(c.ink, 0.07), 'fill-m': rgba(c.ink, 0.1),
      ok: a[2], warn: a[3], info: a[4], merged: isColor(t.ai) ? t.ai : a[5],
      thumb: isColor(t['scrollbar-thumb']) ? t['scrollbar-thumb'] : (isColor(t['edge-strong']) ? t['edge-strong'] : rgba(c.ink, 0.32)),
    };
    Object.keys(s).forEach(function (k) { out['s-' + k] = s[k]; });
    for (var i = 1; i <= 6; i++) out['a' + i] = a[i];
    return out;
  }
  function paint(el, theme) {
    var v = vars(theme);
    Object.keys(v).forEach(function (k) { el.style.setProperty('--' + k, v[k]); });
    el.style.colorScheme = theme.preview.polarity;
    return el;
  }

  function sy(k, t) { return '<span style="color:var(--s-' + k + ')">' + esc(t) + '</span>'; }
  function an(i, t) { return '<span style="color:var(--a' + i + ')">' + esc(t) + '</span>'; }

  // The edit the open task shows: [line class, line number, sign, code].
  var DIFF = [
    ['', '13', ' ', sy('comment', '// T² ∝ a³, thanks Johannes')],
    ['', '14', ' ', sy('comment', '// keep Kep inside the habitable zone')],
    ['r', '15', '-', sy('keyword', 'export function') + ' ' + sy('function', 'plot') + '(' + sy('variable', 'target') + ': ' + sy('type', 'Star') + ') {'],
    ['a', '15', '+', sy('keyword', 'export function') + ' ' + sy('function', 'plot') + '(' + sy('variable', 'target') + ': ' + sy('type', 'Star') + ', ' + sy('variable', 'fuel') + ' = ' + sy('number', '42') + ') {'],
    ['r', '18', '-', '    ' + sy('function', 'overshoot') + '(' + sy('variable', 'target') + ');'],
    ['a', '18', '+', '    ' + sy('function', 'coast') + '(' + sy('variable', 'target') + ');'],
  ];
  function diffHtml(lines) {
    return '<div class="diff">' + lines.map(function (l) {
      return '<div class="' + l[0] + '"><em>' + l[1] + '</em><u>' + l[2] + '</u><span>' + (l[3] || ' ') + '</span></div>';
    }).join('') + '</div>';
  }
  function tline(left, right) { return '<div class="tl"><span>' + left + '</span><span>' + (right || '') + '</span></div>'; }
  function termPane() {
    var prompt = an(6, '~/mission-control') + ' ' + an(5, 'feat/to-boldly-go') + ' $ pnpm launch';
    var lines = [
      tline(prompt),
      tline(an(2, 'PASS') + ' orbit.test.ts', an(2, '12 checks')),
      tline(an(3, 'WARN') + ' asteroids.test.ts', an(3, 'never tell me the odds')),
      tline(an(1, 'FAIL') + ' landing' + an(4, ':48'), an(1, "Houston, we've had a problem")),
      tline('Checks ' + an(1, '1 failed') + ', ' + an(2, '2,662 passed'), an(6, 'T+1.42s')),
    ];
    return '<div class="pane tpane"><div class="phead">' + icon('term') + 'Terminal</div><div class="tbody">' + lines.join('') + '</div></div>';
  }
  function topBar() {
    return '<div class="top"><span class="tbtn soft">' + icon('plus') + 'New task</span><span class="sp"></span>' +
      '<span class="tbtn">' + icon('ask') + 'Ask</span><span class="ico">' + icon('msg') + '</span><span class="ico">' + icon('gear') + '</span><span class="ava"></span></div>';
  }
  function strip(on) {
    function t(n, i, l) { return '<span class="tab' + (on === n ? ' on' : '') + '">' + icon(i) + l + '</span>'; }
    return '<div class="strip">' + t('todo', 'todo', 'Todo') + t('tasks', 'rocket', 'Tasks') + t('graph', 'graph', 'Agent Graph') + t('new', 'plus', 'New view') +
      '<span class="sp"></span><span class="tab">' + icon('bolt') + 'Automations</span></div>';
  }
  function row(title, st, color, sel, pr) {
    return '<div class="trow' + (sel ? ' sel' : '') + '"><b>' + esc(title) + '</b><span class="sp"></span>' +
      (pr ? '<span class="chipn">' + icon('pr') + '#' + pr + '</span>' : '') +
      '<span class="st" style="color:' + color + '">' + st + '</span></div>';
  }
  function taskList() {
    var g = function (name, n) { return '<div class="ghead">' + icon('chev') + name + ' <span>' + n + '</span></div>'; };
    return '<div class="list">' +
      g('Needs you', 2) +
      row('Open the pod bay doors', 'Waiting', 'var(--warn)') +
      row('Build an Illudium Q-36 modulator', 'Waiting', 'var(--warn)') +
      g('Running', 3) +
      row('Plot a course to Kepler-186f', 'In development', 'var(--info)', true) +
      row('Teach Kep to wave hello', 'In development', 'var(--info)') +
      row('Calibrate the star tracker', 'In development', 'var(--info)') +
      g('Not started', 2) +
      row('Teach Keif to swim in zero-g', 'Exploration', 'var(--muted)') +
      row('Pack snacks for Kep', 'Exploration', 'var(--muted)') +
      g('Done', 2) +
      row('Escape Earth\'s gravity', 'Done', 'var(--merged)', false, '1969') +
      row('Soft-land the rover', 'Done', 'var(--merged)', false, '1977') +
      '</div>';
  }
  function previewPanel() {
    return '<div class="pane ppane">' +
      '<div class="phead">' + icon('chev') + '<span class="ttl">Plot a course to Kepler-186f</span><span class="sp"></span><span class="acts">' + icon('term') + icon('kebab') + '</span></div>' +
      '<div class="chat">' +
        '<p>Kep kept overshooting, so <span class="ic">plot</span> now has a <span class="ic">fuel</span> budget.</p>' +
        '<div class="tooldiff"><div class="tool"><span class="ok">' + icon('check') + '</span>Edit src/nav/course.ts<span class="sp"></span>' + icon('chev') + '</div>' + diffHtml(DIFF) + '</div>' +
        '<div class="sb"></div></div>' +
      '<div class="composer"><div class="row"><span>Type a message…</span><span class="sp"></span><span class="glyph-s">' + icon('spark') + '</span><span>Opus 5.5</span><span class="send">Send</span></div></div>' +
      termPane() +
      '</div>';
  }
  function cardView() {
    return topBar() + strip('tasks') + '<div class="body">' + taskList() + previewPanel() + '</div>';
  }
  function makeWindow(theme) {
    var el = document.createElement('div');
    el.className = 'kw';
    el.style.width = W + 'px';
    el.style.height = H + 'px';
    el.innerHTML = cardView();
    return paint(el, theme);
  }

  // Fits the fixed-size window to its card's width. The box keeps the window's shape in CSS, so
  // only the scale is set here: it changes no box's size, so the observer never re-triggers itself.
  function fit(box, width) {
    box.firstElementChild.style.transform = 'scale(' + width / W + ')';
  }
  var ro = typeof ResizeObserver === 'function' ? new ResizeObserver(function (entries) { entries.forEach(function (e) { fit(e.target, e.contentRect.width); }); }) : null;
  function fitted(child) {
    var box = document.createElement('div');
    box.className = 'fit';
    var scale = document.createElement('div');
    scale.className = 'scale';
    scale.style.width = W + 'px';
    scale.style.height = H + 'px';
    scale.appendChild(child);
    box.appendChild(scale);
    return box;
  }
  function painted(fam) { return fam.themes.filter(function (t) { return t.preview; }); }
  // The family's middle dark and middle light theme, so a long family rests on its most typical pair.
  function pairOf(fam) {
    var dark = painted(fam).filter(function (t) { return t.preview.polarity === 'dark'; });
    var light = painted(fam).filter(function (t) { return t.preview.polarity === 'light'; });
    function mid(l) { return l[Math.floor((l.length - 1) / 2)]; }
    return { dark: dark.length ? mid(dark) : null, light: light.length ? mid(light) : null };
  }
  function splitWindow(pair) {
    var first = pair.dark || pair.light, second = pair.dark && pair.light;
    var root = document.createElement('div');
    root.className = 'split';
    root.style.width = W + 'px';
    root.style.height = H + 'px';
    var a = document.createElement('div');
    a.className = 'layer';
    a.appendChild(makeWindow(first));
    root.appendChild(a);
    if (second) {
      var b = document.createElement('div');
      b.className = 'layer b';
      b.appendChild(makeWindow(second));
      root.appendChild(b);
      root.insertAdjacentHTML('beforeend', '<svg class="seam" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><line x1="' + W + '" y1="0" x2="0" y2="' + H + '" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/></svg>');
    }
    return root;
  }

  function shortName(fam, t) {
    var n = t.name.indexOf(fam.name + ' ') === 0 ? t.name.slice(fam.name.length + 1) : t.name;
    return n === fam.name ? '' : n;
  }
  function updateCard(c) {
    var fam = c.fam, only = !(c.dark && c.light);
    if (c.root) c.root.dataset.mode = c.mode;
    var text;
    if (only) { text = (c.dark ? 'Dark' : 'Light') + ' only'; }
    else if (c.mode === 'dark') { text = shortName(fam, c.dark) || 'Dark'; }
    else if (c.mode === 'light') { text = shortName(fam, c.light) || 'Light'; }
    else { text = (shortName(fam, c.dark) || 'Dark') + ' + ' + (shortName(fam, c.light) || 'Light'); }
    c.vname.textContent = text;
    c.dots.forEach(function (d) {
      var on;
      if (only) on = d.theme === (c.dark || c.light);
      else if (d.theme.preview.polarity === 'dark') on = d.theme === c.dark && c.mode !== 'light';
      else on = d.theme === c.light && c.mode !== 'dark';
      d.el.setAttribute('aria-pressed', String(on));
    });
    if (c.sweep && !only) c.sweep.setAttribute('aria-label', fam.name + ', showing ' + text + '. Sweep to the next view.');
    // A family of one polarity shows its middle theme first and any variant its dots pick.
    if (c.img && only) c.img.setAttribute('aria-label', (c.dark || c.light).name + ' preview');
  }

  var cards = [];
  var sweepAll = document.querySelector('.filters .seg');
  function pressAll(mode) {
    if (!sweepAll) return;
    sweepAll.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); });
  }
  // Sweeps every family at once, one card after another down the catalog.
  function setAll(mode) {
    var shown = 0;
    cards.forEach(function (c) {
      if (c.root) c.root.style.setProperty('--delay', (c.entry.hidden ? 0 : shown++ * 55) + 'ms');
      c.mode = mode;
      // Only read at 50/50: leaving dark or light, the card's sweep picks the other side itself.
      if (mode === 'split') c.dir = 'light';
      updateCard(c);
    });
    pressAll(mode);
  }

  document.querySelectorAll('.entry[data-family]').forEach(function (entry) {
    var fam = families[entry.dataset.family];
    var frame = entry.querySelector('.sweep .frame');
    var vname = entry.querySelector('.vname');
    if (!fam || !frame || !vname || painted(fam).length === 0) return;
    var pair = pairOf(fam), both = !!(pair.dark && pair.light);
    var split = splitWindow(pair);
    var box = fitted(split);
    frame.appendChild(box);
    // The observer's first report fits the box before it is painted, without a layout per card here.
    if (ro) ro.observe(box); else fit(box, box.clientWidth);
    var wins = split.querySelectorAll('.kw');
    var c = { entry: entry, fam: fam, dark: pair.dark, light: pair.light, mode: 'split', dir: 'light', dots: [], vname: vname };
    if (both) { c.root = split; c.sweep = entry.querySelector('button.sweep'); }
    else c.img = entry.querySelector('.sweep[role="img"]');
    entry.querySelectorAll('.swatches button[data-index]').forEach(function (b) {
      var t = fam.themes[Number(b.dataset.index)];
      if (!t || !t.preview) return;
      c.dots.push({ el: b, theme: t });
      b.addEventListener('click', function () {
        // A dot paints its variant into the matching layer and sweeps to it. A family of one
        // polarity has a single layer, which the dot repaints.
        if (!both) {
          if (t.preview.polarity === 'dark') c.dark = t; else c.light = t;
          paint(wins[0], t);
        } else if (t.preview.polarity === 'dark') {
          c.dark = t; paint(wins[0], t); c.mode = 'dark';
        } else {
          c.light = t; paint(wins[1], t); c.mode = 'light';
        }
        if (c.root) c.root.style.setProperty('--delay', '0ms');
        updateCard(c);
        pressAll('');
      });
    });
    if (both && c.sweep) {
      c.sweep.addEventListener('click', function () {
        c.root.style.setProperty('--delay', '0ms');
        // A sweep back and forth, so the picture always passes through 50/50.
        if (c.mode === 'split') { c.mode = c.dir; }
        else { c.dir = c.mode === 'dark' ? 'light' : 'dark'; c.mode = 'split'; }
        updateCard(c);
        pressAll('');
      });
    }
    cards.push(c);
    updateCard(c);
  });

  if (cards.length) {
    document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
      Object.keys(ICONS).map(function (n) { return '<symbol id="kw-' + n + '" viewBox="0 0 16 16">' + ICONS[n] + '</symbol>'; }).join('') + '</defs></svg>');
  }

  // Search by family name, theme name or tag; the segmented control sweeps every family.
  var filters = document.querySelector('.filters');
  if (filters) {
    var find = document.getElementById('find');
    var none = document.querySelector('.none');
    var count = filters.querySelector('.count');
    var entries = Array.prototype.slice.call(document.querySelectorAll('.entry[data-family]'));

    var haystack = function (family) {
      return [family.name].concat(family.tags || [], family.themes.map(function (t) { return t.name; })).join(' ').toLowerCase();
    };

    var apply = function () {
      var terms = find.value.toLowerCase().split(/\s+/).filter(Boolean);
      var shown = 0;
      entries.forEach(function (entry) {
        var family = families[entry.dataset.family];
        if (!family) return;
        var text = haystack(family);
        entry.hidden = !terms.every(function (term) { return text.indexOf(term) !== -1; });
        if (!entry.hidden) shown++;
      });
      var filtering = terms.length > 0;
      count.textContent = filtering ? 'Showing ' + shown + ' of ' + entries.length + (entries.length === 1 ? ' family' : ' families') : '';
      none.hidden = !filtering || shown > 0;
    };

    find.addEventListener('input', apply);
    if (sweepAll) {
      sweepAll.addEventListener('click', function (e) {
        var button = e.target.closest('button');
        if (button) setAll(button.dataset.mode);
      });
      // With no family that has both a dark and a light theme, there is nothing to sweep.
      sweepAll.hidden = !cards.some(function (c) { return c.root; });
    }
    none.querySelector('button').addEventListener('click', function () {
      find.value = '';
      apply();
      find.focus();
    });
    filters.hidden = false;
  }

  // The solar system: each theme rides an orbit, passing behind Kep and in front of it.
  var system = document.getElementById('system');
  var TILT = -18 * Math.PI / 180;
  var INNER = { rx: 36, ry: 12, size: 11, speed: 0.11 };
  var OUTER = { rx: 48, ry: 18, size: 8.5, speed: 0.07 };
  var bodies = [];

  if (system) {
    var placed = [];
    data.hero.forEach(function (ref) {
      var theme = families[ref.slug] && families[ref.slug].themes.filter(function (t) { return t.id === ref.id; })[0];
      if (theme && theme.preview) placed.push(theme);
    });
    // Alternate inner and outer orbits and spread each orbit's bodies evenly; the ghost waits on the outer one.
    var inner = placed.filter(function (_, i) { return i % 2 === 0; });
    var outer = placed.filter(function (_, i) { return i % 2 === 1; });
    var outerCount = outer.length + 1;
    inner.forEach(function (t, i) {
      bodies.push({ theme: t, rx: INNER.rx, ry: INNER.ry, size: INNER.size, speed: INNER.speed, phase: 0.6 + i * 2 * Math.PI / inner.length });
    });
    outer.forEach(function (t, i) {
      bodies.push({ theme: t, rx: OUTER.rx, ry: OUTER.ry, size: OUTER.size, speed: OUTER.speed, phase: 3.4 + i * 2 * Math.PI / outerCount });
    });
    bodies.push({ ghost: true, rx: OUTER.rx, ry: OUTER.ry, size: 6.5, speed: OUTER.speed, phase: 3.4 + outer.length * 2 * Math.PI / outerCount });

    bodies.forEach(function (b) {
      var el = document.createElement('span');
      el.className = 'planet' + (b.ghost ? ' ghost' : '');
      el.dataset.label = b.ghost ? 'Yours next' : b.theme.name;
      el.setAttribute('aria-hidden', 'true');
      if (!b.ghost) setPlanet(el, b.theme.preview);
      system.appendChild(el);
      b.el = el;
    });

    var place = function (time) {
      var w = system.clientWidth;
      bodies.forEach(function (b) {
        var a = b.phase + (reduce ? 0 : time / 1000 * b.speed);
        var x0 = Math.cos(a) * b.rx;
        var y0 = Math.sin(a) * b.ry;
        var x = 50 + x0 * Math.cos(TILT) - y0 * Math.sin(TILT);
        var y = 50 + x0 * Math.sin(TILT) + y0 * Math.cos(TILT);
        var front = Math.sin(a) > 0;
        var depth = 0.82 + 0.18 * (Math.sin(a) + 1) / 2;
        var size = b.size * depth / 100 * w;
        b.el.style.left = x + '%';
        b.el.style.top = y + '%';
        b.el.style.width = size + 'px';
        b.el.style.height = size + 'px';
        b.el.style.fontSize = size / 3 + 'px';
        b.el.style.zIndex = front ? 6 : 4;
        b.el.style.opacity = front ? 1 : 0.85;
      });
      if (!reduce) requestAnimationFrame(place);
    };
    requestAnimationFrame(place);
    if (reduce) addEventListener('resize', function () { place(0); });
  }

  // Kep
  var hero = document.getElementById('hero-kep');
  if (typeof K2 !== 'undefined') {
    ['hero-kep', 'vacant-kep', 'footer-kep'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) K2.mount(el);
    });
    if (hero) K2.follow(hero);
  }

  // Hovering the catalog's empty slot makes Kep perk up.
  var vacant = document.querySelector('.vacant');
  var vacantKep = document.getElementById('vacant-kep');
  if (vacant && vacantKep) {
    vacant.addEventListener('pointerenter', function () { vacantKep.dataset.state = 'found'; });
    vacant.addEventListener('pointerleave', function () { vacantKep.dataset.state = 'listening'; });
  }

  // A deep star field: three layers of stars, the nearest twinkling slowly.
  var canvas = document.getElementById('sky');
  var ctx = canvas && canvas.getContext('2d');
  if (ctx) {
    var stars = [];
    var build = function () {
      var dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var seed = 11;
      var rand = function () { return (seed = (seed * 16807) % 2147483647) / 2147483647; };
      var n = Math.round(innerWidth * innerHeight / 1700);
      stars = [];
      for (var i = 0; i < n; i++) {
        var layer = rand();
        stars.push({ x: rand() * innerWidth, y: rand() * innerHeight, r: layer > 0.97 ? 1.5 : layer > 0.8 ? 1 : 0.55, a: 0.25 + rand() * 0.7, tw: rand() * 6.28, sp: 0.4 + rand() * 1.2, warm: rand() > 0.93 });
      }
    };
    var draw = function (time) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = reduce || s.r < 1 ? 1 : 0.65 + 0.35 * Math.sin(s.tw + time / 1000 * s.sp);
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = s.warm ? '#ffe2b0' : '#e2faf2';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fill();
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    build();
    requestAnimationFrame(draw);
    addEventListener('resize', function () {
      build();
      if (reduce) draw(0);
    });
  }
})();
