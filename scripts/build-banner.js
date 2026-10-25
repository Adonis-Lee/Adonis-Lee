// Usage: node scripts/build-banner.js assets
// Generates assets/banner-{dark,light}.svg and assets/divider-{dark,light}.svg
const fs = require("fs");
const out = process.argv[2];
const T = {
  dark:  { bg0: "#03060A", bg1: "#071824", glow: "#1FA9C9", core: "#7FEBF7", hot: "#E6FDFF", deep: "#0E4A5E", text: "#E6FDFF", sub: "#7FC9D8", op: 1 },
  light: { bg0: "#F4FAFC", bg1: "#DCEFF4", glow: "#1592AE", core: "#0B7A93", hot: "#05495A", deep: "#9FD3E0", text: "#06303B", sub: "#2C6E7E", op: 0.85 },
};
// Energy wisps: each flows left->right across the banner with a slow dash drift
const wisps = [
  ["M-40 230 C 160 120, 300 300, 470 190 S 760 60, 920 160 S 1140 250, 1260 120", 3.2, 9],
  ["M-40 80 C 140 170, 330 20, 520 110 S 820 250, 1000 140 S 1180 40, 1260 90", 2.4, 12],
  ["M-40 160 C 120 60, 260 220, 420 140 S 700 20, 860 120 S 1100 230, 1260 180", 1.6, 7],
  ["M80 300 C 160 220, 120 140, 230 90 S 330 0, 300 -20", 2.0, 6],
  ["M1120 -20 C 1040 60, 1110 140, 1010 200 S 930 290, 960 320", 2.0, 8],
  ["M-40 270 C 220 250, 380 290, 600 260 S 980 230, 1260 270", 1.2, 14],
];
function banner(k) {
  const c = T[k];
  const paths = wisps.map(([d, w, s], i) => `
    <path d="${d}" stroke="url(#e)" stroke-width="${w * 4}" opacity=".35" filter="url(#blur)" class="f" style="animation-duration:${s}s"/>
    <path d="${d}" stroke="url(#e)" stroke-width="${w}" class="f" style="animation-duration:${s}s;animation-delay:-${i}s"/>`).join("");
  const sparks = Array.from({ length: 22 }, (_, i) => {
    const x = (i * 157 + 61) % 1200, y = (i * 89 + 37) % 300, r = 1 + (i % 3) * 0.8;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.core}" style="animation-duration:${3 + (i % 5)}s;animation-delay:-${i % 7}s" class="s"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" width="1200" height="300" role="img" aria-label="Mehmet Anıl ÜLKÜ — Game Developer · 3D · Real-Time">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.bg0}"/><stop offset="1" stop-color="${c.bg1}"/></linearGradient>
    <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${c.glow}" stop-opacity=".35"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></radialGradient>
    <linearGradient id="e" x1="0" x2="1"><stop offset="0" stop-color="${c.deep}"/><stop offset=".45" stop-color="${c.glow}"/><stop offset=".6" stop-color="${c.core}"/><stop offset="1" stop-color="${c.deep}"/></linearGradient>
    <filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="tg" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <clipPath id="clip"><rect width="1200" height="300" rx="18"/></clipPath>
  </defs>
  <style>
    .f{fill:none;stroke-linecap:round;stroke-dasharray:240 60 40 60;animation:flow linear infinite}
    .s{animation:twinkle ease-in-out infinite}
    @keyframes flow{to{stroke-dashoffset:-800}}
    @keyframes twinkle{0%,100%{opacity:.1}50%{opacity:${c.op}}}
    @media (prefers-reduced-motion:reduce){.f,.s{animation:none}}
  </style>
  <g clip-path="url(#clip)">
    <rect width="1200" height="300" fill="url(#bg)"/>
    <ellipse cx="600" cy="150" rx="460" ry="150" fill="url(#halo)"/>
    <g opacity="${c.op}">${paths}</g>
    ${sparks}
    <text x="600" y="150" text-anchor="middle" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif" font-size="58" font-weight="700" letter-spacing="10" fill="${c.text}"${k === "dark" ? ' filter="url(#tg)"' : ""}>MEHMET ANIL ÜLKÜ</text>
    <text x="600" y="200" text-anchor="middle" font-family="Consolas,'Fira Code',Menlo,monospace" font-size="20" letter-spacing="5" fill="${c.sub}">GAME DEV · 3D &amp; ANIMATION · REAL-TIME SYSTEMS</text>
  </g>
</svg>
`;
}
function divider(k) {
  const c = T[k];
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
for (const k of ["dark", "light"]) {
  fs.writeFileSync(`${out}/banner-${k}.svg`, banner(k));
  fs.writeFileSync(`${out}/divider-${k}.svg`, divider(k));
}
