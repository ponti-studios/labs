import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { projects } from "~/data/projects";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public/og/projects");
const BASE = join(ROOT, "public/og.png");

const ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";
const HELVETICA = "/System/Library/Fonts/Helvetica.ttc";
const MONO = "/System/Library/Fonts/SFNSMono.ttf";

const H = 630;
const LEFT = 70;
const URL_Y = 548;

function magick(args: string[]) {
  execFileSync("magick", args, { stdio: "pipe" });
}

function measureHeight(file: string): number {
  const out = execFileSync("magick", ["identify", "-format", "%h", file], {
    encoding: "utf8",
  });
  return Number.parseInt(out.trim(), 10);
}

function renderCaption(file: string, text: string, font: string, pointsize: number, width: number, fill: string) {
  magick([
    "-background",
    "none",
    "-fill",
    fill,
    "-font",
    font,
    "-pointsize",
    String(pointsize),
    "-size",
    `${width}x`,
    `caption:${text}`,
    file,
  ]);
}

function roundedLogo(src: string, dest: string, size: number) {
  magick([
    src,
    "-resize",
    `${size}x${size}^`,
    "-gravity",
    "center",
    "-extent",
    `${size}x${size}`,
    "(",
    "-size",
    `${size}x${size}`,
    "xc:none",
    "-draw",
    `roundrectangle 0,0 ${size - 1},${size - 1} 48,48`,
    ")",
    "-compose",
    "CopyOpacity",
    "-composite",
    dest,
  ]);
}

for (const project of projects) {
  const publicLogo = project.logo ? join(ROOT, "public", project.logo) : null;
  const hasLogo = Boolean(publicLogo && existsSync(publicLogo));
  // One text column for every card so copy never collides with the dot field.
  const textWidth = 620;
  const tmp = `/tmp/og-${project.slug}`;

  // Cover the base card's headline + footer URL so the project copy owns the left column.
  const base = `${tmp}-base.png`;
  magick([
    BASE,
    "-fill",
    "black",
    "-draw",
    `rectangle 0,150 705,${H}`,
    base,
  ]);

  // Project name, shrinking until it fits two lines.
  let nameSize = 92;
  const nameFile = `${tmp}-name.png`;
  for (;;) {
    renderCaption(nameFile, project.name, ARIAL_BOLD, nameSize, textWidth, "white");
    const lines = Math.round(measureHeight(nameFile) / (nameSize * 1.15));
    if (lines <= 2 || nameSize <= 64) break;
    nameSize -= 8;
  }
  const nameH = measureHeight(nameFile);

  // Description, shrinking until name + description fit above the footer URL.
  const nameY = 168;
  let descSize = 32;
  const descFile = `${tmp}-desc.png`;
  let descY = 0;
  for (;;) {
    renderCaption(descFile, project.shortDescription, HELVETICA, descSize, textWidth, "#A3A3A3");
    descY = nameY + nameH + 22;
    if (descY + measureHeight(descFile) <= URL_Y - 14 || descSize <= 24) break;
    descSize -= 2;
  }

  // Footer URL in mono.
  const urlFile = `${tmp}-url.png`;
  magick([
    "-background",
    "none",
    "-fill",
    "#737373",
    "-font",
    MONO,
    "-pointsize",
    "30",
    `label:ponti.io/projects/${project.slug}`,
    urlFile,
  ]);

  const args = [
    base,
    nameFile,
    "-geometry",
    `+${LEFT}+${nameY}`,
    "-composite",
    descFile,
    "-geometry",
    `+${LEFT}+${descY}`,
    "-composite",
    urlFile,
    "-geometry",
    `+${LEFT}+${URL_Y}`,
    "-composite",
  ];

  if (hasLogo && publicLogo) {
    const logoFile = `${tmp}-logo.png`;
    roundedLogo(publicLogo, logoFile, 220);
    args.push(logoFile, "-geometry", "+890+205", "-composite");
  }

  args.push(join(OUT_DIR, `${project.slug}.png`));
  mkdirSync(OUT_DIR, { recursive: true });
  magick(args);
  console.log(`ok ${project.slug} (name ${nameSize}pt, desc ${descSize}pt, logo ${hasLogo})`);
}

console.log(`Wrote ${projects.length} cards to public/og/projects/`);
