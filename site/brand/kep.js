/* Kep and the Kepler logo are GitKraken trademarks and are not covered by this repository's MIT license. See TRADEMARKS.md. */
// Kep, refined. Same anatomy as the study (planet, star eye, ring, moon), drawn as a lit body.
var K2 = (function () {
  var uid = 0;
  var RX = 42, RY = 11.5, R = 24;
  var STAR4 = 'M0 -10 C1.2 -3.2 3.2 -1.2 10 0 C3.2 1.2 1.2 3.2 0 10 C-1.2 3.2 -3.2 1.2 -10 0 C-3.2 -1.2 -1.2 -3.2 0 -10Z';
  var SPARK = 'M0 -4 C.5 -1.3 1.3 -.5 4 0 C1.3 .5 .5 1.3 0 4 C-.5 1.3 -1.3 .5 -4 0 C-1.3 -.5 -.5 -1.3 0 -4Z';

  function moon(cls) {
    return '<g class="' + cls + '"><g class="k2-mx"><g class="k2-my"><g class="k2-ms">' +
      '<circle class="k2-mc" r="3.4"/>' +
      '</g></g></g></g>';
  }
  function band(id, half) {
    var clip = 'url(#' + id + (half === 'back' ? 'b' : 'n') + ')';
    var mask = half === 'front' ? ' mask="url(#' + id + 'm)"' : '';
    return '<g' + mask + '><g clip-path="' + clip + '">' +
      '<ellipse class="k2-band" rx="' + RX + '" ry="' + RY + '" stroke="url(#' + id + 'r)"/>' +
      '<ellipse class="k2-band-hi" rx="' + (RX + 1.75) + '" ry="' + (RY + 1.75) + '"/>' +
      '<ellipse class="k2-band-lo" rx="' + (RX - 1.85) + '" ry="' + (RY - 1.85) + '"/>' +
      '</g></g>';
  }
  function svg() {
    var id = 'q' + (++uid);
    var sparks = '';
    [[38, 0], [19, 33], [-19, 33], [-38, 0], [-19, -33], [19, -33]].forEach(function (d) {
      sparks += '<g transform="translate(50 50)"><path class="k2-spark" style="--dx:' + d[0] + 'px;--dy:' + d[1] + 'px" d="' + SPARK + '"/></g>';
    });
    var stop = function (o, c, op) { return '<stop offset="' + o + '" style="stop-color:' + c + (op != null ? ';stop-opacity:' + op : '') + '"/>'; };
    return '<svg class="k2" viewBox="0 0 100 100" aria-hidden="true"><defs>' +
      '<linearGradient id="' + id + 'r" gradientUnits="userSpaceOnUse" x1="-42" y1="-12" x2="42" y2="12">' + stop(0, 'var(--ring-hi)') + stop(0.3, 'var(--brand)') + stop(1, 'var(--brand-deep)') + '</linearGradient>' +
      '<linearGradient id="' + id + 'p" gradientUnits="userSpaceOnUse" x1="30" y1="26" x2="70" y2="76">' + stop(0, 'var(--ring-hi)') + stop(0.34, 'var(--brand)') + stop(1, 'var(--brand-deep)') + '</linearGradient>' +
      '<radialGradient id="' + id + 'f" cx=".36" cy=".3" r=".9">' + stop(0, 'var(--face-glow)') + stop(1, 'var(--face)') + '</radialGradient>' +
      '<radialGradient id="' + id + 'd" cx=".3" cy=".26" r=".98">' + stop(0, '#000', 0) + stop(0.56, '#000', 0) + stop(1, '#000', 'var(--shade, .55)') + '</radialGradient>' +
      '<radialGradient id="' + id + 'h">' + stop(0, '#fff', 0.34) + stop(1, '#fff', 0) + '</radialGradient>' +
      '<radialGradient id="' + id + 'g">' + stop(0, 'var(--brand-text)', 0.5) + stop(1, 'var(--brand-text)', 0) + '</radialGradient>' +
      '<linearGradient id="' + id + 's" gradientUnits="userSpaceOnUse" x1="0" y1="-10" x2="0" y2="10">' + stop(0, 'var(--ring-hi)') + stop(1, 'var(--brand)') + '</linearGradient>' +
      '<mask id="' + id + 'm" maskUnits="userSpaceOnUse" x="-70" y="-70" width="140" height="140"><rect x="-70" y="-70" width="140" height="140" fill="#fff"/><circle r="' + (R + 3.6) + '" fill="#000"/></mask>' +
      '<clipPath id="' + id + 'b"><rect x="-70" y="-70" width="140" height="70"/></clipPath>' +
      '<clipPath id="' + id + 'n"><rect x="-70" y="0" width="140" height="70"/></clipPath>' +
      '<clipPath id="' + id + 'c"><circle cx="50" cy="50" r="' + R + '"/></clipPath>' +
      '</defs>' +
      '<g class="k2-float"><g class="k2-lean"><g class="k2-tilt">' +
      '<circle class="k2-rip r1" cx="50" cy="50" r="30"/><circle class="k2-rip r2" cx="50" cy="50" r="30"/>' +
      '<g class="k2-ot"><g class="k2-wob">' + band(id, 'back') + moon('k2-moon-b') + '</g></g>' +
      '<g class="k2-body">' +
        '<circle cx="50" cy="50" r="' + R + '" fill="url(#' + id + 'f)"/>' +
        '<g clip-path="url(#' + id + 'c)">' +
          '<g class="k2-ot"><g class="k2-wob">' +
            '<ellipse class="k2-cloud" cy="8" rx="30" ry="4.4"/><ellipse class="k2-cloud c2" cy="-8" rx="30" ry="3"/>' +
            '<path class="k2-ringshadow" d="M -' + RX + ' 3.2 A ' + RX + ' ' + RY + ' 0 0 0 ' + RX + ' 3.2"/>' +
          '</g></g>' +
          '<circle cx="50" cy="50" r="' + R + '" fill="url(#' + id + 'd)"/>' +
          '<ellipse cx="41" cy="38.5" rx="9" ry="5.2" fill="url(#' + id + 'h)" transform="rotate(-35 41 38.5)"/>' +
        '</g>' +
        '<circle class="k2-rim" cx="50" cy="50" r="' + R + '" stroke="url(#' + id + 'p)"/>' +
        '<g transform="translate(50 49.5)"><g class="k2-eye-track"><g class="k2-eye-size">' +
          '<circle class="k2-iris" r="13" fill="url(#' + id + 'g)"/>' +
          '<g class="k2-eye"><path d="' + STAR4 + '" fill="url(#' + id + 's)" stroke="var(--brand-deep)" stroke-width="1.1" stroke-linejoin="round"/><circle cx="-2.6" cy="-2.8" r="1.2" fill="#fff" opacity=".9"/></g>' +
        '</g></g></g>' +
      '</g>' +
      '<g class="k2-ot"><g class="k2-wob">' + band(id, 'front') + moon('k2-moon-f') + '</g></g>' +
      sparks +
      '<circle class="k2-dot d1" cx="40" cy="12" r="2.2"/><circle class="k2-dot d2" cx="50" cy="10" r="2.2"/><circle class="k2-dot d3" cx="60" cy="12" r="2.2"/>' +
      '<text class="k2-zz z1" x="22" y="26" font-size="9">z</text><text class="k2-zz z2" x="15" y="17" font-size="7.5">z</text><text class="k2-zz z3" x="9" y="9" font-size="6">z</text>' +
      '</g></g></g></svg>';
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Now and then Kep glances somewhere, unless a pointer is steering its eye.
  function glance(el) {
    if (reduce) return;
    var wait = 2400 + Math.random() * 3200;
    setTimeout(function () {
      var s = el.dataset.state, track = el.querySelector('.k2-eye-track');
      if (track && !el.dataset.steered && (s === 'idle' || s === 'listening')) {
        var x = (Math.random() * 2 - 1) * 3.2, y = (Math.random() * 2 - 1) * 2.2;
        track.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
        setTimeout(function () { if (!el.dataset.steered) track.style.transform = ''; }, 700 + Math.random() * 700);
      }
      glance(el);
    }, wait);
  }
  function mount(el) {
    el.classList.add('k2-wrap');
    if (!el.dataset.state) el.dataset.state = 'idle';
    var size = +el.dataset.size;
    if (size) { el.style.width = size + 'px'; el.style.height = size + 'px'; }
    if ((size && size <= 32) || el.dataset.mini) el.classList.add('mini');
    el.innerHTML = svg();
    if (!el.classList.contains('mini')) glance(el);
  }
  // Steers the eye toward the pointer for one Kep; it stops glancing while steered.
  function follow(el) {
    var track = el.querySelector('.k2-eye-track'), tilt = el.querySelector('.k2-tilt');
    el.dataset.steered = '1';
    window.addEventListener('pointermove', function (e) {
      if (el.dataset.state === 'asleep') return;
      var r = el.getBoundingClientRect();
      var dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / Math.max(innerWidth / 2, 1)));
      var dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / Math.max(innerHeight / 2, 1)));
      track.style.transform = 'translate(' + (dx * 4.5).toFixed(2) + 'px,' + (dy * 3.5).toFixed(2) + 'px)';
      tilt.style.transform = 'rotate(' + (dx * 3).toFixed(2) + 'deg)';
      tilt.style.transformOrigin = '50px 50px';
    });
  }
  return { mount: mount, follow: follow };
})();
