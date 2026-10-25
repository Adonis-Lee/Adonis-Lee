// Usage: node scripts/build-banner.js assets
// Cursed-energy banner (JJK style): the name sits inside a wavy energy mass with tapered tongues rising off it,
// drawn with a translucent cyan body, a bright inner rim and a black brush-ink outline. Scrolling noise keeps the edge alive.
// SVG filters + CSS only, so it renders inside <img> on github.com.
const fs = require("fs");
const W = 1200, H = 300;
const T = {
  dark: {
    bg0: "#03080C", bg1: "#071820", text: "#F2FEFF", ink: "#010406",
    body: "#1FC4D6", bodyOp: 0.18, rim: "#6FF5F7", glow: "#2CC9E0", glowOp: 0.75,
  },
  light: {
    bg0: "#F3F9FB", bg1: "#E0EEF2", text: "#03222B", ink: "#06141A",
    body: "#1FC4D6", bodyOp: 0.2, rim: "#2BD9E6", glow: "#1FB6D5", glowOp: 0.3,
  },
};
const font = `font-family="'Segoe UI Black','Arial Black','Helvetica Neue',Arial,sans-serif" font-weight="900"`;
const name = (attrs) => `<text x="600" y="238" text-anchor="middle" ${font} font-size="70" letter-spacing="6" ${attrs}>MEHMET ANIL ÜLKÜ</text>`;

// A seamless noise tile (stitchTiles) exposed as white with alpha = noise
const noise = (id, freq, oct, seed) => `
    <filter id="${id}" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.8 0 0 0 -0.4"/>
    </filter>
    <pattern id="${id}-p" width="${W}" height="${H}" patternUnits="userSpaceOnUse"><rect width="${W}" height="${H}" filter="url(#${id})"/></pattern>`;

// Tongue: a centreline S-curve from the base up to the tip, thickness tapering to zero
function tongue(x, base, h, w, bend, curl) {
  const n = 28, L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, y = base - h * t;
    const cx = x + bend * Math.sin(t * Math.PI * 0.9) + curl * t * t * t;
    const half = (w / 2) * Math.pow(1 - t, 1.6) + (i === n ? 0 : 0.6);
    L.push([cx - half, y]); R.push([cx + half, y]);
  }
  const pts = L.concat(R.reverse()).map(([a, b]) => a.toFixed(1) + " " + b.toFixed(1));
  return "M" + pts.join(" L") + "Z";
}
const TONGUES = [
  // x, base, height, width, bend, curl, sway seconds — uneven on purpose, with one hero tongue and two thin wisps
  [250, 200, 70, 60, 10, 18, 3.3], [345, 182, 150, 84, -26, 40, 4.2], [470, 180, 95, 64, 22, -30, 3.6],
  [522, 172, 122, 30, 18, -22, 3.1], [592, 178, 160, 100, -30, 46, 4.8], [705, 180, 118, 74, 26, -38, 3.9],
  [808, 182, 150, 90, -24, 42, 4.4], [862, 176, 108, 28, -16, 24, 3.0], [928, 195, 82, 62, 16, -26, 3.5],
];

function banner(k) {
  const c = T[k];
  const tongues = TONGUES.map(([x, b, h, w, bend, curl, d], i) =>
    `<g class="tg" style="transform-origin:${x}px ${b}px;animation-duration:${d}s;animation-delay:-${(i * 0.9) % d}s"><path d="${tongue(x, b, h, w, bend, curl)}" fill="#fff"/></g>`).join("\n      ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>Mehmet Anıl ÜLKÜ</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.bg0}"/><stop offset="1" stop-color="${c.bg1}"/></linearGradient>
    ${noise("n1", "0.006 0.009", 3, 4)}
    <!-- soft blob around the name, a little taller on top so lobes rise -->
    <filter id="env" x="-25%" y="-300%" width="150%" height="700%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="30" result="d"/>
      <feGaussianBlur in="d" stdDeviation="30 26" result="b0"/>
      <feGaussianBlur in="d" stdDeviation="34 34" result="b1"/>
      <feOffset in="b1" dy="-18" result="b1u"/>
      <feMerge><feMergeNode in="b1u"/><feMergeNode in="b0"/></feMerge>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.3 0"/>
    </filter>
    <filter id="core" x="-10%" y="-100%" width="120%" height="300%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="26" result="d"/>
      <feGaussianBlur in="d" stdDeviation="8"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 3 0"/>
    </filter>
    <filter id="wide" x="-30%" y="-400%" width="160%" height="900%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="40" result="d"/>
      <feGaussianBlur in="d" stdDeviation="50 70"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2 0"/>
    </filter>
    <mask id="near" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${name('fill="#fff" filter="url(#wide)"')}</mask>
    <!-- intensity -> hard shape -> translucent body, glowing inner rim, brush-ink outline -->
    <filter id="ink" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed="8" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="22" xChannelSelector="R" yChannelSelector="G" result="s"/>
      <feGaussianBlur in="s" stdDeviation="1.5" result="sb"/>
      <feComponentTransfer in="sb" result="A"><feFuncA type="linear" slope="16" intercept="-8.6"/></feComponentTransfer>
      <feMorphology in="A" operator="erode" radius="9" result="Ae"/>
      <feGaussianBlur in="Ae" stdDeviation="16" result="Aeb"/>
      <feComposite in="A" in2="Aeb" operator="out" result="rimA"/>
      <feFlood flood-color="${c.body}" flood-opacity="${c.bodyOp}"/>
      <feComposite in2="A" operator="in" result="fill"/>
      <feFlood flood-color="${c.rim}" flood-opacity=".85"/>
      <feComposite in2="rimA" operator="in" result="rim"/>
      <!-- brush outline: dilated shape roughened by fine noise, minus the body -->
      <feMorphology in="A" operator="dilate" radius="9" result="Ad"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="31" result="tn"/>
      <feDisplacementMap in="Ad" in2="tn" scale="16" xChannelSelector="B" yChannelSelector="R" result="Adt"/>
      <feComposite in="Adt" in2="A" operator="arithmetic" k2="1" k3="1" result="Adu"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="2" seed="21" result="fn"/>
      <feDisplacementMap in="Adu" in2="fn" scale="12" xChannelSelector="R" yChannelSelector="G" result="Adr0"/>
      <feGaussianBlur in="Adr0" stdDeviation="1"/>
      <feComponentTransfer result="Adr"><feFuncA type="linear" slope="6" intercept="-2.5"/></feComponentTransfer>
      <feComposite in="Adr" in2="A" operator="out" result="ringA"/>
      <feFlood flood-color="${c.ink}"/>
      <feComposite in2="ringA" operator="in" result="ring"/>
      <feGaussianBlur in="Adr" stdDeviation="10" result="og"/>
      <feFlood flood-color="${c.glow}" flood-opacity="${c.glowOp}"/>
      <feComposite in2="og" operator="in" result="og2"/>
      <feComposite in="og2" in2="Adr" operator="out" result="outer"/>
      <feMerge><feMergeNode in="outer"/><feMergeNode in="fill"/><feMergeNode in="rim"/><feMergeNode in="ring"/></feMerge>
    </filter>
    <filter id="tglow" x="-5%" y="-50%" width="110%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <clipPath id="clip"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  </defs>
  <style>
    .up{animation:up 9s linear infinite}
    .tg{animation:sway ease-in-out infinite alternate}
    @keyframes sway{from{transform:rotate(-4deg) scaleY(.9)}to{transform:rotate(4deg) scaleY(1.06)}}
    @keyframes up{from{transform:translateY(0)}to{transform:translateY(-${H}px)}}
    @media (prefers-reduced-motion:reduce){.up,.tg{animation:none}}
  </style>
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#ink)">
      ${name('fill="#fff" filter="url(#core)"')}
      ${name('fill="#fff" filter="url(#env)" opacity=".5"')}
      ${tongues}
      <g mask="url(#near)" opacity=".55"><rect class="up" width="${W}" height="${H * 2}" fill="url(#n1-p)"/></g>
    </g>
    ${name(`fill="${c.rim}" filter="url(#tglow)" opacity=".35"`)}
    ${name(`fill="${c.text}"`)}
  </g>
</svg>
`;
}
// Section divider: a thin pulsing energy line
const DIV = {
  dark: { glow: "#1FA9C9", core: "#7FEBF7" },
  light: { glow: "#1592AE", core: "#0B7A93" },
};
function divider(k) {
  const c = DIV[k];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 24" width="1200" height="24" role="img" aria-label="divider">
  <defs>
    <linearGradient id="d" x1="0" x2="1"><stop offset="0" stop-color="${c.glow}" stop-opacity="0"/><stop offset=".5" stop-color="${c.core}"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></linearGradient>
    <filter id="b"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <style>.p{animation:p 4s ease-in-out infinite}@keyframes p{0%,100%{opacity:.45}50%{opacity:1}}@media (prefers-reduced-motion:reduce){.p{animation:none}}</style>
  <path d="M0 12 C 300 4, 450 20, 600 12 S 900 4, 1200 12" stroke="url(#d)" stroke-width="5" fill="none" filter="url(#b)" class="p"/>
  <path d="M0 12 C 300 4, 450 20, 600 12 S 900 4, 1200 12" stroke="url(#d)" stroke-width="1.5" fill="none"/>
</svg>
`;
}

const out = process.argv[2];
for (const k of ["dark", "light"]) {
  fs.writeFileSync(`${out}/banner-${k}.svg`, banner(k));
  fs.writeFileSync(`${out}/divider-${k}.svg`, divider(k));
}
