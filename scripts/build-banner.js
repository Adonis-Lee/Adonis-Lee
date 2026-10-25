// Usage: node scripts/build-banner.js assets
// Cursed-energy banner v2: seamless noise tiles scroll upward through a glyph-shaped aura mask,
// then get mapped to a heat ramp (deep teal -> cyan -> white). SVG filters + CSS only.
const fs = require("fs");
const W = 1200, H = 300;
const T = {
  dark: {
    bg0: "#010409", bg1: "#03101A", text: "#F2FEFF", textGlow: "#7FF0FF",
    // heat ramp per channel, indexed by flame intensity
    r: "0 0.01 0.02 0.08 0.45 0.95", g: "0 0.16 0.33 0.62 0.9 1", b: "0 0.24 0.48 0.8 0.98 1", a: "0 0 0.12 0.6 0.95 1",
    smoke: "#0B4E62", ember: "#BDF8FF", smokeOp: 0.45, glowOp: 0.6,
  },
  light: {
    bg0: "#F5FBFD", bg1: "#DDEFF5", text: "#03222B", textGlow: "#1592AE",
    r: "0.7 0.5 0.25 0.12 0.05 0.04", g: "0.9 0.84 0.72 0.6 0.5 0.45", b: "0.94 0.9 0.82 0.74 0.62 0.56", a: "0 0 0.1 0.5 0.8 0.9",
    smoke: "#8ACCDB", ember: "#0B7A93", smokeOp: 0.45, glowOp: 0.35,
  },
};
const font = `font-family="'Segoe UI Black','Arial Black','Helvetica Neue',Arial,sans-serif" font-weight="900"`;
const name = (attrs) => `<text x="600" y="212" text-anchor="middle" ${font} font-size="78" letter-spacing="5" ${attrs}>MEHMET ANIL ÜLKÜ</text>`;

// A seamless noise tile (stitchTiles) exposed as white with alpha = noise
const noise = (id, freq, oct, seed) => `
    <filter id="${id}" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.35"/>
    </filter>
    <pattern id="${id}-p" width="${W}" height="${H}" patternUnits="userSpaceOnUse"><rect width="${W}" height="${H}" filter="url(#${id})"/></pattern>`;

function banner(k) {
  const c = T[k];
  const embers = Array.from({ length: 16 }, (_, i) => {
    const x = 190 + ((i * 197) % 820), d = 3 + (i % 5) * 0.9, r = 1.2 + (i % 3) * 0.7;
    return `<circle class="em" cx="${x}" cy="190" r="${r}" style="animation-duration:${d}s;animation-delay:-${(i * 0.73) % d}s;--dx:${(i % 2 ? 1 : -1) * (8 + (i % 4) * 6)}px"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>Mehmet Anıl ÜLKÜ</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.bg0}"/><stop offset="1" stop-color="${c.bg1}"/></linearGradient>
    ${noise("n1", "0.022 0.009", 4, 4)}
    ${noise("n2", "0.05 0.02", 3, 9)}
    <!-- aura envelope: glyphs swollen and smeared upward, brightest at the letters -->
    <filter id="env" x="-10%" y="-200%" width="120%" height="320%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d"/>
      <feGaussianBlur in="d" stdDeviation="10 14" result="b0"/>
      <feGaussianBlur in="d" stdDeviation="10 40" result="b1"/>
      <feOffset in="b1" dy="-50" result="b1u"/>
      <feGaussianBlur in="d" stdDeviation="14 60" result="b2"/>
      <feOffset in="b2" dy="-95" result="b2u"/>
      <feMerge result="m"><feMergeNode in="b2u"/><feMergeNode in="b1u"/><feMergeNode in="b0"/></feMerge>
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.003" numOctaves="2" seed="13" result="cols"/>
      <feComponentTransfer in="cols" result="colsK"><feFuncA type="linear" slope="2.6" intercept="-0.7"/></feComponentTransfer>
      <feComposite in="m" in2="colsK" operator="arithmetic" k1="1.6" k2="0.45" result="mc"/>
      <feColorMatrix in="mc" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 0"/>
    </filter>
    <mask id="aura" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">${name('fill="#fff" filter="url(#env)"')}</mask>
    <!-- intensity -> heat ramp; slight wobble so tongues lick sideways -->
    <filter id="heat" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="2" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="22" xChannelSelector="R" yChannelSelector="G" result="s"/>
      <feColorMatrix in="s" values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 0" result="i"/>
      <feComponentTransfer in="i" result="col">
        <feFuncR type="table" tableValues="${c.r}"/><feFuncG type="table" tableValues="${c.g}"/>
        <feFuncB type="table" tableValues="${c.b}"/><feFuncA type="table" tableValues="${c.a}"/>
      </feComponentTransfer>
      <feGaussianBlur in="col" stdDeviation="8" result="glow"/>
      <feMerge><feMergeNode in="glow"/><feMergeNode in="col"/></feMerge>
    </filter>
    <filter id="smoke" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feComponentTransfer><feFuncA type="table" tableValues="0 0 0.2 0.6 1"/></feComponentTransfer>
      <feColorMatrix values="0 0 0 0 ${parseInt(c.smoke.slice(1, 3), 16) / 255}  0 0 0 0 ${parseInt(c.smoke.slice(3, 5), 16) / 255}  0 0 0 0 ${parseInt(c.smoke.slice(5, 7), 16) / 255}  0 0 0 1 0"/>
    </filter>
    <linearGradient id="lowG" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <mask id="low"><rect width="${W}" height="${H}" fill="url(#lowG)"/></mask>
    <filter id="eglow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="1.6" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="tglow" x="-5%" y="-50%" width="110%" height="200%"><feGaussianBlur stdDeviation="5 7"/></filter>
    <clipPath id="clip"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  </defs>
  <style>
    .up1{animation:up 5.5s linear infinite}
    .up2{animation:up 2.6s linear infinite}
    .up3{animation:up 16s linear infinite}
    @keyframes up{from{transform:translateY(0)}to{transform:translateY(-${H}px)}}
    .em{fill:${c.ember};filter:url(#eglow);animation:rise linear infinite;opacity:0}
    @keyframes rise{0%{transform:translate(0,0);opacity:0}15%{opacity:1}100%{transform:translate(var(--dx),-170px);opacity:0}}
    @media (prefers-reduced-motion:reduce){.up1,.up2,.up3,.em{animation:none}}
  </style>
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g mask="url(#low)" opacity="${c.smokeOp}"><g filter="url(#smoke)"><rect class="up3" width="${W}" height="${H * 2}" fill="url(#n1-p)"/></g></g>
    <g filter="url(#heat)">
      <g mask="url(#aura)">
        <rect class="up1" width="${W}" height="${H * 2}" fill="url(#n1-p)"/>
        <rect class="up2" width="${W}" height="${H * 2}" fill="url(#n2-p)" opacity=".7"/>
      </g>
    </g>
    ${embers}
    ${name(`fill="${c.textGlow}" filter="url(#tglow)" opacity="${c.glowOp}"`)}
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
