// pixel-descent/scene.js — Static scene and entrance overlay drawing

import { W, H } from "./palettes.js";

// ---- Globe lamp (shared by static scene and entrance overlay) ----

export function drawGlobeLamp(g, x, y, cx) {
  g.stroke(60, 52, 38);
  g.strokeWeight(3);
  g.line(x, y + 30, x, y);
  g.line(x, y, x + (x < cx ? 12 : -12), y - 16);
  g.noStroke();
  g.fill(220, 200, 140, 200);
  g.ellipse(x + (x < cx ? 12 : -12), y - 20, 14, 14);
  g.fill(255, 240, 180, 120);
  g.ellipse(x + (x < cx ? 12 : -12), y - 20, 10, 10);
}

// ---- Off-screen background (station platform, kiosk, entrance) ----

export function drawStaticScene(g, params) {
  g.background(38, 32, 24);

  g.noStroke();
  g.fill(52, 46, 36);
  g.rect(0, 0, W, H);

  // Pixel grid
  const ps = params.pixelScale;
  g.stroke(45, 40, 30);
  g.strokeWeight(0.5);
  for (let x = 0; x < W; x += ps * 6) {
    g.line(x, 0, x, H);
  }
  for (let y = 0; y < H; y += ps * 6) {
    g.line(0, y, W, y);
  }

  // Station platform
  const cx = W / 2;
  const ey = H * 0.72;
  g.noStroke();
  g.fill(65, 58, 46);
  g.rect(cx - 160, ey - 20, 320, 80);

  g.stroke(55, 48, 36);
  g.strokeWeight(1);
  for (let x = cx - 160; x < cx + 160; x += 40) {
    g.line(x, ey - 20, x, ey + 60);
  }
  g.line(cx - 160, ey + 20, cx + 160, ey + 20);

  // Station kiosk
  g.noStroke();
  g.fill(42, 38, 28);
  g.rect(cx - 70, ey - 60, 140, 50);
  g.stroke(60, 55, 42);
  g.strokeWeight(1.5);
  for (let x = cx - 70; x <= cx + 70; x += 14) {
    g.line(x, ey - 60, x, ey - 10);
  }
  for (let y = ey - 60; y <= ey - 10; y += 10) {
    g.line(cx - 70, y, cx + 70, y);
  }

  // Entrance
  g.noStroke();
  g.fill(12, 10, 7);
  g.rect(cx - 58, ey - 8, 116, 60);

  // Entrance signage bands
  g.fill(90, 82, 65);
  g.rect(cx - 68, ey - 14, 136, 12);
  g.fill(82, 74, 58);
  g.rect(cx - 72, ey - 4, 144, 10);
  g.fill(75, 68, 52);
  g.rect(cx - 78, ey + 4, 156, 10);

  // Entrance vertical pillars
  g.stroke(45, 40, 30);
  g.strokeWeight(3);
  g.line(cx - 68, ey - 14, cx - 68, ey + 14);
  g.line(cx + 68, ey - 14, cx + 68, ey + 14);

  // Entrance bars
  for (let rx = cx - 68; rx <= cx + 68; rx += 14) {
    g.stroke(55, 50, 38);
    g.strokeWeight(2);
    g.line(rx, ey - 14, rx, ey - 2);
  }

  drawGlobeLamp(g, cx - 85, ey - 20, cx);
  drawGlobeLamp(g, cx + 85, ey - 20, cx);

  g.noFill();
  g.stroke(30, 26, 18);
  g.strokeWeight(1);
}

// ---- Foreground entrance overlay (redrawn each frame) ----

export function drawEntranceOverlay(sk) {
  const cx = W / 2;
  const ey = H * 0.72;
  sk.noStroke();
  sk.fill(12, 10, 7);
  sk.rect(cx - 58, ey - 8, 116, 48);
  sk.fill(90, 82, 65);
  sk.rect(cx - 68, ey - 14, 136, 8);
  sk.stroke(45, 40, 30);
  sk.strokeWeight(4);
  sk.line(cx - 68, ey - 14, cx - 68, ey + 14);
  sk.line(cx + 68, ey - 14, cx + 68, ey + 14);
  for (let rx = cx - 68; rx <= cx + 68; rx += 14) {
    sk.stroke(55, 50, 38);
    sk.strokeWeight(2);
    sk.line(rx, ey - 14, rx, ey - 2);
  }
  drawGlobeLamp(sk, W / 2 - 85, H * 0.72 - 20, W / 2);
  drawGlobeLamp(sk, W / 2 + 85, H * 0.72 - 20, W / 2);
}
