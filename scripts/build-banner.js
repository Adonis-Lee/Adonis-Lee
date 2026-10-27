// Usage: node scripts/build-banner.js assets
// Cursed-energy banner (JJK style): the name sits inside a wavy energy mass with tapered tongues rising off it
// (their tips pinch off into rising fragments), drawn with a translucent cyan body, a bright inner rim and a black
// brush-ink outline. Scrolling noise keeps the body edge alive. Set FRAME_T=<seconds> to render a frozen frame.
// SVG filters + CSS only, so it renders inside <img> on github.com.
const fs = require("fs");
const W = 1200, H = 300;
// The header panel is stacked from slices (banner, typing line, link buttons) that share one gradient
const TYPE_H = 60, BTN_H = 82, PANEL_H = H + TYPE_H + BTN_H;
const panelBg = (c, top) => `<linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="${-top}" x2="0" y2="${PANEL_H - top}"><stop offset="0" stop-color="${c.bg0}"/><stop offset="1" stop-color="${c.bg1}"/></linearGradient>`;
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

// Fire motion: a wave travels up each tongue (hot air rising), the tongue stretches, and at its tallest
// the tip pinches off into a small fragment that keeps rising, shrinks and disappears.
const FRAME = process.env.FRAME_T === undefined ? null : +process.env.FRAME_T; // freeze time (s) for previews
const KEYS = 12;

// Tongue outline at a given wave phase; thickness tapers to a sharp point at the tip
function tongue([x, base, h, w, bend, curl], phase) {
  const n = 32, L = [], R = [], hh = 0.88 * h * (1 + 0.1 * Math.sin(phase)), ww = w * (1 - 0.05 * Math.sin(phase));
  let tip;
  for (let i = 0; i <= n; i++) {
    const t = i / n, y = base - hh * t;
    const cx = x + bend * (0.3 + 1.3 * t) * Math.sin(Math.PI * 1.5 * t - phase) + curl * t * t;
    const half = (ww / 2) * Math.pow(1 - Math.pow(t, 1.7), 0.85) * (1 - 0.3 * t);
    L.push([cx - half, y]); R.push([cx + half, y]);
    if (i === n) tip = [cx, y];
  }
  const pts = L.concat(R.reverse()).map(([p, q]) => p.toFixed(1) + " " + q.toFixed(1));
  return { d: "M" + pts.join(" L") + "Z", tip };
}
// Pinched-off fragment: a small curved flame shard, pointed at both ends, widest low down
function drop(cx, cy, fh, fw, lean) {
  const n = 16, L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, y = cy + fh * 0.4 - fh * t, x = cx + lean * t * t;
    const half = (fw / 2) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.6)), 1.1);
    L.push([x - half, y]); R.push([x + half, y]);
  }
  return "M" + L.concat(R.reverse()).map(([p, q]) => p.toFixed(1) + " " + q.toFixed(1)).join(" L") + "Z";
}
const TONGUES = [
  // x, base, height, width, bend, curl, seconds per cycle — uneven on purpose, one hero tongue
  [262, 204, 100, 70, 10, 18, 3.4], [372, 190, 148, 96, -16, 34, 4.3], [492, 184, 130, 80, 14, -26, 3.7],
  [606, 188, 166, 112, -18, 38, 4.9], [724, 188, 136, 88, 15, -30, 3.9], [836, 190, 152, 94, -15, 32, 4.5],
  [940, 204, 100, 70, 10, -18, 3.5],
];
const RELEASE = 0.22; // fraction of the cycle (just before the tallest point) when the tip pinches off

function banner(k) {
  const c = T[k];
  const offs = (i, d) => (i * 0.9) % d;
  const phaseAt = (i, d) => FRAME === null ? 0 : 2 * Math.PI * (((FRAME + offs(i, d)) / d) % 1);
  const tongues = TONGUES.map((sp, i) => {
    const d = sp[6];
    if (FRAME !== null) return `<path d="${tongue(sp, phaseAt(i, d)).d}" fill="#fff"/>`;
    const frames = Array.from({ length: KEYS + 1 }, (_, j) => tongue(sp, (2 * Math.PI * j) / KEYS).d);
    return `<path d="${frames[0]}" fill="#fff"><animate attributeName="d" dur="${d}s" begin="-${offs(i, d).toFixed(2)}s" repeatCount="indefinite" values="${frames.join(";")}"/></path>`;
  }).join("\n      ");
  const frags = TONGUES.map((sp, i) => {
    const d = sp[6], tip = tongue(sp, 2 * Math.PI * RELEASE).tip, fh = 26 + sp[3] * 0.14, fw = 11 + sp[3] * 0.06;
    const dx = (sp[5] > 0 ? 1 : -1) * (6 + (i % 3) * 5);
    const path = drop(tip[0], tip[1] - fh * 0.25, fh, fw, dx * 0.6);
    if (FRAME !== null) {
      const u = ((FRAME + offs(i, d)) / d) % 1, p = (u - RELEASE) / 0.5;
      if (p < 0 || p > 1) return "";
      const sc = p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88;
      return `<path d="${path}" class="fr" style="transform-origin:${tip[0].toFixed(1)}px ${tip[1].toFixed(1)}px;transform:translate(${(dx * p).toFixed(1)}px,${(-42 * p).toFixed(1)}px) scale(${sc.toFixed(2)})"/>`;
    }
    return `<path d="${path}" class="fr frA" style="transform-origin:${tip[0].toFixed(1)}px ${tip[1].toFixed(1)}px;--dx:${dx}px;animation-duration:${d}s;animation-delay:-${offs(i, d).toFixed(2)}s"/>`;
  }).join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>Mehmet Anıl ÜLKÜ</title>
  <defs>
    ${panelBg(c, 0)}
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
      <feMorphology in="SourceAlpha" operator="dilate" radius="28" result="d"/>
      <feGaussianBlur in="d" stdDeviation="14"/>
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
      <feDisplacementMap in="SourceGraphic" in2="w" scale="8" xChannelSelector="R" yChannelSelector="G" result="s"/>
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
      <feMorphology in="A" operator="dilate" radius="6.5" result="Ad"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="31" result="tn"/>
      <feDisplacementMap in="Ad" in2="tn" scale="16" xChannelSelector="B" yChannelSelector="R" result="Adt"/>
      <feComposite in="Adt" in2="A" operator="arithmetic" k2="1" k3="1" result="Adu"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="1" seed="21" result="fn"/>
      <feDisplacementMap in="Adu" in2="fn" scale="5" xChannelSelector="R" yChannelSelector="G" result="Adr0"/>
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
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/><feComponentTransfer><feFuncA type="linear" slope="1.5"/></feComponentTransfer></filter>
    <filter id="tglow" x="-5%" y="-50%" width="110%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <clipPath id="clip"><path d="M0 18Q0 0 18 0H${W - 18}Q${W} 0 ${W} 18V${H}H0Z"/></clipPath>
  </defs>
  <style>
    .up{animation:up 18s linear infinite}
    .fr{fill:#fff}
    .frA{transform:scale(0);animation:pinch linear infinite}
    @keyframes pinch{0%,${RELEASE * 100}%{transform:translate(0,0) scale(0)}${RELEASE * 100 + 6}%{transform:translate(calc(var(--dx) * .12),-7px) scale(1)}${RELEASE * 100 + 50}%{transform:translate(var(--dx),-42px) scale(0)}100%{transform:translate(var(--dx),-42px) scale(0)}}
    @keyframes up{from{transform:translateY(0)}to{transform:translateY(-${H}px)}}
    @media (prefers-reduced-motion:reduce){.up,.frA{animation:none}}
  </style>
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#ink)">
      ${name('fill="#fff" filter="url(#core)"')}
      ${name('fill="#fff" filter="url(#env)" opacity=".5"')}
      <g filter="url(#soft)">
      ${tongues}
      ${frags}
      </g>
      <g mask="url(#near)" opacity=".55"><rect class="up" width="${W}" height="${H * 2}" fill="url(#n1-p)"/></g>
    </g>
    ${name(`fill="${c.rim}" filter="url(#tglow)" opacity=".35"`)}
    ${name(`fill="${c.text}"`)}
  </g>
</svg>
`;
}
// Typing line slice: each line types in, holds, erases; one line at a time, 4.5s per line
const LINES = ["Turning ideas into interactive experiences", "Unity · Unreal Engine · Real-time systems", "EEE & CENG student"];
const TYPE = { dark: { ink: "#6FF5F7" }, light: { ink: "#0B6E82" } };
function typing(k) {
  const c = { ...T[k], ...TYPE[k] }, cw = 15.6, slot = 1 / LINES.length, period = LINES.length * 4.5, pct = (v) => (v * 100).toFixed(3) + "%";
  let css = "", body = "";
  LINES.forEach((line, i) => {
    const n = [...line].length, L = n * cw, x0 = (W - L) / 2, s0 = i * slot, s1 = s0 + 0.4 * slot, s2 = s0 + 0.76 * slot, s3 = s0 + 0.9 * slot;
    css += `@keyframes tw${i}{0%,${pct(s0)}{transform:scaleX(0);animation-timing-function:steps(${n},end)}${pct(s1)},${pct(s2)}{transform:scaleX(1);animation-timing-function:steps(${n},end)}${pct(s3)},100%{transform:scaleX(0)}}
`;
    css += `@keyframes cu${i}{0%,${pct(Math.max(0, s0 - 0.0001))}{opacity:0;transform:translateX(0)}${pct(s0)}{opacity:1;transform:translateX(0);animation-timing-function:steps(${n},end)}${pct(s1)},${pct(s2)}{opacity:1;transform:translateX(${L}px);animation-timing-function:steps(${n},end)}${pct(s3)}{opacity:1;transform:translateX(0)}${pct(s3 + 0.0001)},100%{opacity:0}}
`;
    css += `.r${i}{transform-origin:${x0}px 0;transform:scaleX(0);animation:tw${i} ${period}s linear infinite}.k${i}{opacity:0;animation:cu${i} ${period}s linear infinite}
`;
    body += `<clipPath id="t${i}"><rect class="r${i}" x="${x0}" y="0" width="${L}" height="${TYPE_H}"/></clipPath>
    <text clip-path="url(#t${i})" x="${x0}" y="38" textLength="${L}" lengthAdjust="spacingAndGlyphs" font-family="Consolas,'Fira Code',Menlo,monospace" font-size="26" fill="${c.ink}">${line.replace("&", "&amp;")}</text>
    <rect class="k${i}" x="${x0 + 1}" y="16" width="3" height="28" fill="${c.ink}"/>
    `;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${TYPE_H}" width="${W}" height="${TYPE_H}">
  <title>${LINES[0]}</title>
  <defs>${panelBg(c, H)}</defs>
  <style>${css}@media (prefers-reduced-motion:reduce){[class^=r],[class^=k]{animation:none}.r0{transform:none}}</style>
  <rect width="${W}" height="${TYPE_H}" fill="url(#bg)"/>
    ${body}
</svg>
`;
}

// Link button slices: each button is its own image so it can be its own link; fillers close the panel
const BTN = {
  dark: { pill: "#0B2129", edge: "#6FF5F7", label: "#CFF7FA", icon: "#6FF5F7" },
  light: { pill: "#FFFFFF", edge: "#0B6E82", label: "#0B4F5E", icon: "#0B6E82" },
};
const ICONS = {
  linkedin: (col) => `<rect x="0" y="0" width="22" height="22" rx="4" fill="${col}"/><text x="11" y="17" text-anchor="middle" font-family="'Segoe UI',Arial,sans-serif" font-weight="800" font-size="15" fill="#0B2129">in</text>`,
  email: (col) => `<rect x="1" y="4" width="20" height="14" rx="2.5" fill="none" stroke="${col}" stroke-width="2"/><path d="M2 6l9 6.5L20 6" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>`,
  github: (col) => `<g transform="scale(.9167)"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="${col}"/></g>`,
};
const BUTTONS = [
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/mehmetanilulku/" },
  { id: "email", label: "Email", href: "mailto:mehmetulku2003@gmail.com" },
  { id: "github", label: "GitHub", href: "https://github.com/Adonis-Lee" },
];
const PILL_H = 44, PAD = 18, GAP_ICON = 10, CH = 10.2, MARGIN = 8;
const pillW = (b) => Math.round(PAD * 2 + 22 + GAP_ICON + b.label.length * CH);
function button(k, b) {
  const c = { ...T[k], ...BTN[k] }, pw = pillW(b), w = pw + MARGIN * 2, y = 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${BTN_H}" width="${w}" height="${BTN_H}">
  <title>${b.label}</title>
  <defs>${panelBg(c, H + TYPE_H)}</defs>
  <rect width="${w}" height="${BTN_H}" fill="url(#bg)"/>
  <rect x="${MARGIN + 0.75}" y="${y + 0.75}" width="${pw - 1.5}" height="${PILL_H - 1.5}" rx="9" fill="${c.pill}" stroke="${c.edge}" stroke-opacity=".45" stroke-width="1.5"/>
  <g transform="translate(${MARGIN + PAD} ${y + 11})">${ICONS[b.id](c.icon)}</g>
  <text x="${MARGIN + PAD + 22 + GAP_ICON}" y="${y + 28.5}" textLength="${(b.label.length * CH).toFixed(1)}" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif" font-weight="600" font-size="17" letter-spacing=".5" fill="${c.label}">${b.label}</text>
</svg>
`;
}
function filler(k, side, w) {
  const c = T[k], r = 18;
  const d = side === "left" ? `M0 0H${w}V${BTN_H}H${r}Q0 ${BTN_H} 0 ${BTN_H - r}Z` : `M0 0H${w}V${BTN_H - r}Q${w} ${BTN_H} ${w - r} ${BTN_H}H0Z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${BTN_H}" width="${w}" height="${BTN_H}">
  <defs>${panelBg(c, H + TYPE_H)}</defs>
  <path d="${d}" fill="url(#bg)"/>
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
  fs.writeFileSync(`${out}/typing-${k}.svg`, typing(k));
  for (const b of BUTTONS) fs.writeFileSync(`${out}/btn-${b.id}-${k}.svg`, button(k, b));
}
// Layout for build-readme.js: slice widths in banner units (W = 100%)
const inner = BUTTONS.reduce((a, b) => a + pillW(b) + MARGIN * 2, 0), side = (W - inner) / 2;
for (const k of ["dark", "light"]) { fs.writeFileSync(`${out}/btn-left-${k}.svg`, filler(k, "left", side)); fs.writeFileSync(`${out}/btn-right-${k}.svg`, filler(k, "right", side)); }
fs.writeFileSync(`${out}/header.json`, JSON.stringify({ W, slices: [
  { file: "btn-left", w: side }, ...BUTTONS.map((b) => ({ file: `btn-${b.id}`, w: pillW(b) + MARGIN * 2, href: b.href, alt: b.label })), { file: "btn-right", w: side },
] }, null, 2) + "\n");
