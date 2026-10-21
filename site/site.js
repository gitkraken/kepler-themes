// Paints the page from the data block the build writes: each family's Kepler window, planet
// orb and spectrum, the catalog's search and filter, the hero's solar system, the star field and Kep.
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

  function clearPlanet(el) {
    ['--p-hi', '--p-mid', '--p-lo', '--p-glow'].forEach(function (name) { el.style.removeProperty(name); });
  }

  var WINDOW_VARS = {
    canvas: 'canvas', sunken: 'sunken', raised: 'raised', ink: 'ink', text: 'text', muted: 'muted', edge: 'edge',
    selected: 'selected', selectedInk: 'selected-ink', fill: 'fill', onFill: 'on-fill',
  };

  function code(s) {
    var k = function (c, t) { return '<span style="color:' + s[c] + '">' + t + '</span>'; };
    return [
      k('control', 'import') + ' { ' + k('variable', 'watch') + ' } ' + k('control', 'from') + ' ' + k('string', "'./themes'") + ';',
      k('comment', '// repaint when the file changes'),
      k('keyword', 'export function') + ' ' + k('function', 'apply') + '(' + k('variable', 'id') + ': ' + k('type', 'ThemeId') + ') {',
      '  ' + k('keyword', 'const') + ' ' + k('variable', 't') + ' = ' + k('function', 'resolve') + '(' + k('variable', 'id') + ', ' + k('number', '1') + ');',
      '  ' + k('control', 'return') + ' ' + k('function', 'watch') + '(' + k('variable', 't') + ', ' + k('function', 'paint') + ');',
      '}',
    ].map(function (l, i) { return '<span class="ln">' + (i + 1) + '</span>' + l; }).join('\n');
  }

  function paintWindow(win, preview) {
    var c = preview.colors;
    var a = preview.terminal.ansi;
    Object.keys(WINDOW_VARS).forEach(function (key) { win.style.setProperty('--t-' + WINDOW_VARS[key], c[key]); });
    win.style.setProperty('--t-term-bg', preview.terminal.background);
    win.style.setProperty('--t-term-fg', preview.terminal.foreground);
    var pill = function (color, text) { return '<span class="pill" style="color:' + color + '">' + text + '</span>'; };
    var run = c.selectedInk;
    var need = a[3];
    var done = c.muted;
    win.innerHTML = '<div class="ui">' +
      '<div class="bar"><i></i><i></i><i></i><span>Kepler</span></div>' +
      '<div class="nav"><div class="on">Dashboard</div><div>Tasks</div><div>Agents</div><div>Pull requests</div><div>Settings</div></div>' +
      '<div class="main">' +
        '<h4>Tasks in progress<span>New task</span></h4>' +
        '<div class="rows">' +
          '<div class="row"><b>Theme gallery landing page</b>' + pill(run, 'Running') + '</div>' +
          '<div class="row"><b>Refresh OAuth tokens</b>' + pill(need, 'Needs you') + '</div>' +
          '<div class="row"><b>Terminal ANSI colors</b>' + pill(run, 'Running') + '</div>' +
          '<div class="row"><b>Show the search icon</b>' + pill(done, 'PR ready') + '</div>' +
          '<div class="row"><b>Jira Server provider</b>' + pill(run, 'Running') + '</div>' +
          '<div class="row"><b>Release installers</b>' + pill(done, 'Merged') + '</div>' +
        '</div>' +
        '<div class="pane"><div class="code">' + code(preview.syntax) + '</div>' +
          '<div class="term"><span style="color:' + a[2] + '">~/kepler</span> <span style="color:' + a[5] + '">main</span> $ pnpm check<br><span style="color:' + a[2] + '">✓</span> All checks passed</div></div>' +
      '</div></div>';
  }

  function spectrum(preview) {
    var c = preview.colors;
    var a = preview.terminal.ansi;
    var s = preview.syntax;
    return [c.canvas, c.selected, c.fill].concat(a.slice(1, 7), a.slice(9, 15), [s.keyword, s.function, s.string, s.type]);
  }

  // Each card's variant picker, by family slug, so the Dark and Light filter can flip a card to a matching theme.
  var pickers = {};

  document.querySelectorAll('.entry[data-family]').forEach(function (entry) {
    var family = families[entry.dataset.family];
    if (!family) return;
    var view = entry.querySelector('.view');
    var win = entry.querySelector('.win');
    var orb = entry.querySelector('.orb');
    var bar = entry.querySelector('.spectrum .bar');
    var name = entry.querySelector('.spec-name');
    var switcher = entry.querySelector('.seg');

    function show(index) {
      var theme = family.themes[index];
      if (!theme) return;
      name.textContent = theme.name;
      if (!theme.preview) {
        // Nothing to paint: a neutral orb and no window or spectrum for this theme.
        clearPlanet(orb);
        bar.innerHTML = '';
        if (win) {
          win.innerHTML = '';
          win.hidden = true;
        }
        if (view) view.hidden = true;
        return;
      }
      if (win) {
        win.hidden = false;
        if (view) view.hidden = false;
        paintWindow(win, theme.preview);
        win.setAttribute('aria-label', theme.name + ' preview');
      }
      setPlanet(orb, theme.preview);
      var colors = spectrum(theme.preview);
      bar.style.setProperty('--n', colors.length);
      bar.innerHTML = colors.map(function (color) { return '<i style="background:' + color + '"></i>'; }).join('');
    }

    var current = 0;
    function pick(index) {
      current = index;
      if (switcher) switcher.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.index) === index)); });
      show(index);
    }
    pickers[family.slug] = { pick: pick, current: function () { return current; } };

    show(0);
    if (!switcher) return;
    switcher.addEventListener('click', function (e) {
      var button = e.target.closest('button');
      if (button) pick(Number(button.dataset.index));
    });
  });

  // Search by family name, theme name or tag, and show only families with a dark or a light theme.
  var filters = document.querySelector('.filters');
  if (filters) {
    var find = document.getElementById('find');
    var none = document.querySelector('.none');
    var count = filters.querySelector('.count');
    var polaritySeg = filters.querySelector('.seg');
    var entries = Array.prototype.slice.call(document.querySelectorAll('.entry[data-family]'));
    var polarity = '';

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
        var match = terms.every(function (term) { return text.indexOf(term) !== -1; });
        var first = polarity ? family.themes.map(function (t) { return t.polarity; }).indexOf(polarity) : 0;
        entry.hidden = !match || first === -1;
        if (entry.hidden) return;
        shown++;
        // Under Dark or Light, a card showing the other kind switches to its first matching theme.
        var picker = pickers[family.slug];
        if (polarity && picker && family.themes[picker.current()].polarity !== polarity) picker.pick(first);
      });
      var filtering = terms.length > 0 || polarity !== '';
      count.textContent = filtering ? 'Showing ' + shown + ' of ' + entries.length + (entries.length === 1 ? ' family' : ' families') : '';
      none.hidden = !filtering || shown > 0;
    };

    find.addEventListener('input', apply);
    polaritySeg.addEventListener('click', function (e) {
      var button = e.target.closest('button');
      if (!button) return;
      polarity = button.dataset.polarity;
      polaritySeg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      apply();
    });
    none.querySelector('button').addEventListener('click', function () {
      find.value = '';
      polaritySeg.querySelector('button').click();
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
