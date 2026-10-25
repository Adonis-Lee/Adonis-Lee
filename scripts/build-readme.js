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
const pin = (repo) => linked(`https://github.com/${U}/${repo}`, pic((c) => `${STATS}/pin/?username=${U}&repo=${repo}&show_owner=false&description_lines_count=2&${card(c)}`, repo, 'width="48%"'));

const typing = (c) => "https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=20&duration=3500&pause=1200&center=true&vCenter=true&width=640&height=40&color=" + c.title + "&lines=" + [
  "Turning ideas into interactive experiences",
  "Learning Blender → anime-style 3D animation",
  "Unity · Unreal Engine · Real-time systems",
  "EEE & CENG student",
].map(encodeURIComponent).join(";");

const contact = [
  linked("https://www.linkedin.com/in/mehmetanilulku/", pic((c) => `https://img.shields.io/badge/LinkedIn-${c.badge}?style=for-the-badge&logo=linkedin&logoColor=${c.logo}`, "LinkedIn")),
  linked("mailto:mehmetulku2003@gmail.com", pic((c) => `https://img.shields.io/badge/Email-${c.badge}?style=for-the-badge&logo=gmail&logoColor=${c.logo}`, "Email")),
  linked(`https://github.com/${U}`, pic((c) => `https://img.shields.io/badge/GitHub-${c.badge}?style=for-the-badge&logo=github&logoColor=${c.logo}`, "GitHub")),
  pic((c) => `https://komarev.com/ghpvc/?username=${U}&label=views&color=${c.title}&style=for-the-badge`, "Profile views"),
].join("\n  ");

const md = `<p align="center">
  ${pic((c, k) => `assets/banner-${k}.svg`, "Mehmet Anıl ÜLKÜ — Game Developer · 3D & Animation · Real-Time Systems", 'width="100%"')}
</p>

<p align="center">
  ${pic(typing, "Turning ideas into interactive experiences")}
</p>

<p align="center">
  ${contact}
</p>

${divider}

## ⚡ About

- 🎮 Game developer — gameplay systems, graphics and real-time simulation in **Unity** & **Unreal Engine**.
- 🌀 On a **3D & anime-style animation** journey in **Blender**: modeling, shading, lighting, rendering.
- 🔌 **EEE & CENG** background, so I care about performance and how things work under the hood.
- 🧭 Next up: **Unreal** cinematics, then **Houdini** FX.

## 🧪 Featured Projects

<p align="center">
  ${pin("NexusFlow")}
  ${pin("mac-wifi-sensing")}
  ${pin("Echo___Game")}
  ${pin("Machine_Learning_Project")}
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
  ${pic((c, k) => `https://raw.githubusercontent.com/${U}/${U}/output/github-contribution-grid-snake${k === "dark" ? "-dark" : ""}.svg`, "Contribution snake", 'width="100%"')}
</p>

${divider}
`;
fs.writeFileSync(process.argv[2], md);
