// Usage: node scripts/build-readme.js README.md  (overwrites README.md — edit this file, not the README)
// Builds README.md for the "dark energy" palette (colors sampled from the avatar's cyan aura)
const fs = require("fs");
const U = "Adonis-Lee";
const C = {
  dark:  { bg: "070D13", border: "12303D", title: "5CE1F0", text: "CFE7EE", icon: "2BB3CC", badge: "0A1A22", logo: "5CE1F0" },
  light: { bg: "F2F8FA", border: "CFE3EA", title: "0B6E82", text: "10252E", icon: "0E7C93", badge: "E3F2F6", logo: "0B6E82" },
};
const STATS = "https://github-readme-stats-eight-beige.vercel.app/api";
const card = (c) => `bg_color=${c.bg}&title_color=${c.title}&text_color=${c.text}&icon_color=${c.icon}&border_color=${c.border}&border_radius=10`;

// <picture> with a dark and a light source; img falls back to light
function pic(fn, alt, attrs = "") {
  return `<picture><source media="(prefers-color-scheme: dark)" srcset="${fn(C.dark, "dark")}" /><source media="(prefers-color-scheme: light)" srcset="${fn(C.light, "light")}" /><img ${attrs ? attrs + " " : ""}src="${fn(C.light, "light")}" alt="${alt}" /></picture>`;
}
const linked = (href, inner) => `<a href="${href}">${inner}</a>`;
const divider = `<p align="center">${pic((c, k) => `assets/divider-${k}.svg`, "", 'width="100%"')}</p>`;

const badge = (label, logo) => pic((c) => `https://img.shields.io/badge/${label}-${c.badge}?style=for-the-badge&logo=${logo}&logoColor=${c.logo}`, decodeURIComponent(label));
const pin = (repo) => linked(`https://github.com/${U}/${repo}`, pic((c) => `${STATS}/pin/?username=${U}&repo=${repo}&show_owner=false&description_lines_count=2&cache_seconds=21600&${card(c)}`, repo, 'width="48%"'));

// Header panel: banner, typing line and link buttons are stacked slices (from build-banner.js) that read as
// one panel. They sit in a single paragraph with no whitespace between them and align="top", so no gaps appear.
const layout = JSON.parse(fs.readFileSync(`${__dirname}/../assets/header.json`, "utf8"));
const pct = (w) => Math.floor((w / layout.W) * 1e4) / 100;
const slice = (s, i) => {
  const w = i === layout.slices.length - 1 ? (100 - layout.slices.slice(0, -1).reduce((a, x) => a + pct(x.w), 0) - 0.01).toFixed(2) : pct(s.w);
  const img = pic((c, k) => `assets/${s.file}-${k}.svg`, s.alt || "", `width="${w}%" align="top"`);
  return s.href ? linked(s.href, img) : img;
};
const header = [
  pic((c, k) => `assets/banner-${k}.svg`, "Mehmet Anıl ÜLKÜ", 'width="100%" align="top"'),
  pic((c, k) => `assets/typing-${k}.svg`, "Turning ideas into interactive experiences", 'width="100%" align="top"'),
  layout.slices.map(slice).join(""),
].join("<br>");
const views = pic((c) => `https://komarev.com/ghpvc/?username=${U}&label=profile%20views&color=${c.title}&style=flat-square`, "Profile views");

const md = `<p align="center">${header}</p>

${divider}

## ⚡ About

- 🎮 Game developer — gameplay systems, graphics and real-time simulation in **Unity** & **Unreal Engine**.
- 🌀 On a **3D & anime-style animation** journey in **Blender**: modeling, shading, lighting, rendering.
- 🔌 **EEE & CENG** background, so I care about performance and how things work under the hood.
- 🧭 Next up: **Unreal** cinematics, then **Houdini** FX.

## 🧪 Featured Projects

<p align="center">
  ${pin("Machine_Learning_Project")}
  ${pin("mac-wifi-sensing")}
  ${pin("blender-isometric-room")}
  ${pin("blender-volleyball-ball")}
</p>

## 🛠️ Tech Stack

<p align="center">
  ${badge("Unity", "unity")}
  ${badge("Unreal%20Engine", "unrealengine")}
  ${badge("Blender", "blender")}
  <br />
  ${badge("C%23", "csharp")}
  ${badge("C%2B%2B", "cplusplus")}
  ${badge("C", "c")}
  ${badge("Python", "python")}
  <br />
  ${badge("MATLAB", "mathworks")}
  ${badge("SolidWorks", "dassaultsystemes")}
</p>

## 📊 Stats

<p align="center">
  ${pic((c) => `${STATS}?username=${U}&show_icons=true&rank_icon=github&${card(c)}`, "GitHub stats", 'height="165"')}
  ${pic((c) => `${STATS}/top-langs/?username=${U}&layout=compact&langs_count=6&card_width=320&${card(c)}`, "Most used languages", 'height="165"')}
</p>

<p align="center">
  ${pic((c) => `https://streak-stats.demolab.com/?user=${U}&background=${c.bg}&border=${c.border}&stroke=${c.border}&ring=${c.title}&fire=${c.title}&currStreakLabel=${c.title}&currStreakNum=${c.text}&sideNums=${c.text}&sideLabels=${c.text}&dates=${c.icon}&border_radius=10`, "GitHub streak", 'height="165"')}
</p>

<p align="center">
  ${pic((c, k) => `https://raw.githubusercontent.com/${U}/${U}/output/github-contribution-grid-snake${k === "dark" ? "-dark" : ""}.svg?v=violet`, "Contribution snake", 'width="100%"')}
</p>

${divider}

<p align="center">${views}</p>
`;
fs.writeFileSync(process.argv[2], md);
