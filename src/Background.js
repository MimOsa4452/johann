import { DEPTH } from './constants.js';

// Creates a layered African savanna background that looks natural
export function createBackground(scene) {
  const { width, height } = scene.scale;
  const objects = [];

  // ── Sky gradient ──────────────────────────────────────────────────────
  const sky = scene.add.graphics().setDepth(DEPTH.SKY);
  // Multi-band gradient sky
  const skyColors = [
    { y: 0, h: height * 0.08, color: 0x4a90c8 },     // deep blue top
    { y: height * 0.08, h: height * 0.08, color: 0x6aaad8 },
    { y: height * 0.16, h: height * 0.08, color: 0x88c0e8 },
    { y: height * 0.24, h: height * 0.08, color: 0xa8d4f0 },
    { y: height * 0.32, h: height * 0.06, color: 0xc8e4f4 },
    { y: height * 0.38, h: height * 0.04, color: 0xe8f0f0 },  // hazy horizon
  ];
  skyColors.forEach(({ y, h, color }) => {
    sky.fillStyle(color); sky.fillRect(0, y, width, h + 1);
  });
  objects.push(sky);

  // ── Distant hazy mountains ────────────────────────────────────────────
  const mountains = scene.add.graphics().setDepth(DEPTH.SKY + 1);
  mountains.fillStyle(0x8899aa, 0.4);
  drawMountainRange(mountains, width, height * 0.36, height * 0.06, 8);
  mountains.fillStyle(0x7a8a7a, 0.5);
  drawMountainRange(mountains, width, height * 0.38, height * 0.05, 6);
  objects.push(mountains);

  // ── Far hills (blue-green haze) ───────────────────────────────────────
  const farHills = scene.add.graphics().setDepth(DEPTH.HILLS);
  farHills.fillStyle(0x6b8a5e, 0.7);
  drawHillRange(farHills, width, height * 0.40, height * 0.08, 5);
  farHills.fillStyle(0x5a7a4e, 0.8);
  drawHillRange(farHills, width, height * 0.42, height * 0.07, 4);
  objects.push(farHills);

  // ── Mid-ground savanna ────────────────────────────────────────────────
  const midground = scene.add.graphics().setDepth(DEPTH.MIDGROUND);
  // Grass/savanna base
  midground.fillStyle(0x8aaa50);
  midground.fillRect(0, height * 0.44, width, height * 0.16);
  midground.fillStyle(0x9aba58);
  midground.fillRect(0, height * 0.50, width, height * 0.12);
  // Transition to dry ground
  midground.fillStyle(0xb8a868);
  midground.fillRect(0, height * 0.58, width, height * 0.10);
  midground.fillStyle(0xc8b070);
  midground.fillRect(0, height * 0.64, width, height * 0.10);
  midground.fillStyle(0xd0b878);
  midground.fillRect(0, height * 0.70, width, height * 0.12);
  midground.fillStyle(0xc4a868);
  midground.fillRect(0, height * 0.80, width, height * 0.20);
  objects.push(midground);

  // ── Acacia trees (scattered) ──────────────────────────────────────────
  const treePositions = [
    { x: width * 0.12, y: height * 0.46, s: 0.5 },
    { x: width * 0.35, y: height * 0.44, s: 0.45 },
    { x: width * 0.72, y: height * 0.47, s: 0.55 },
    { x: width * 0.88, y: height * 0.45, s: 0.48 },
    { x: width * 0.55, y: height * 0.52, s: 0.7 },
    { x: width * 0.20, y: height * 0.56, s: 0.75 },
    { x: width * 0.80, y: height * 0.58, s: 0.8 },
  ];
  treePositions.forEach(({ x, y, s }) => {
    const tree = scene.add.graphics().setDepth(DEPTH.MIDGROUND + 1);
    drawAcaciaTree(tree, x, y, s);
    objects.push(tree);
  });

  // ── Grass tufts (foreground) ──────────────────────────────────────────
  for (let i = 0; i < 40; i++) {
    const gx = Math.random() * width;
    const gy = height * 0.55 + Math.random() * height * 0.35;
    const gs = 0.5 + Math.random() * 1.0;
    const grass = scene.add.graphics().setDepth(DEPTH.FOREGROUND);
    drawGrassTuft(grass, gx, gy, gs);
    objects.push(grass);
  }

  // ── Small rocks ───────────────────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const rx = Math.random() * width;
    const ry = height * 0.65 + Math.random() * height * 0.25;
    const rock = scene.add.graphics().setDepth(DEPTH.MIDGROUND + 2);
    const rw = 6 + Math.random() * 12;
    const rh = 4 + Math.random() * 6;
    rock.fillStyle(0x888070); rock.fillEllipse(rx, ry, rw, rh);
    rock.fillStyle(0x999888, 0.5); rock.fillEllipse(rx - 1, ry - 1, rw * 0.7, rh * 0.6);
    objects.push(rock);
  }

  // ── Dust haze near ground ─────────────────────────────────────────────
  const haze = scene.add.graphics().setDepth(DEPTH.FOREGROUND + 1);
  haze.fillStyle(0xddccaa, 0.15);
  haze.fillRect(0, height * 0.82, width, height * 0.18);
  haze.fillStyle(0xeeddbb, 0.08);
  haze.fillRect(0, height * 0.75, width, height * 0.10);
  objects.push(haze);

  return objects;
}

function drawMountainRange(g, width, baseY, maxHeight, peaks) {
  g.beginPath();
  g.moveTo(0, baseY + maxHeight);
  for (let i = 0; i <= peaks; i++) {
    const x = (i / peaks) * width;
    const peakH = maxHeight * (0.4 + Math.random() * 0.6);
    const midX = x + (width / peaks) * 0.5;
    g.lineTo(midX, baseY - peakH);
    g.lineTo(x + width / peaks, baseY + Math.random() * maxHeight * 0.3);
  }
  g.lineTo(width, baseY + maxHeight);
  g.closePath();
  g.fillPath();
}

function drawHillRange(g, width, baseY, maxHeight, hills) {
  g.beginPath();
  g.moveTo(0, baseY + maxHeight);
  const step = width / 50;
  for (let x = 0; x <= width; x += step) {
    const noise = Math.sin(x * 0.008) * maxHeight * 0.6
                + Math.sin(x * 0.015 + 1) * maxHeight * 0.3
                + Math.sin(x * 0.03 + 2) * maxHeight * 0.1;
    g.lineTo(x, baseY - noise);
  }
  g.lineTo(width, baseY + maxHeight);
  g.closePath();
  g.fillPath();
}

function drawAcaciaTree(g, x, y, scale) {
  const s = scale;
  // Trunk
  g.fillStyle(0x5a4030);
  g.fillRect(x - 3 * s, y, 6 * s, 50 * s);
  // Trunk gets slightly wider at base
  g.fillTriangle(x - 5 * s, y + 50 * s, x + 5 * s, y + 50 * s, x, y + 35 * s);

  // Canopy — flat umbrella shape (characteristic acacia)
  g.fillStyle(0x3a6828, 0.9);
  g.fillEllipse(x, y - 5 * s, 60 * s, 18 * s);
  // Canopy texture — darker patches
  g.fillStyle(0x2d5420, 0.6);
  g.fillEllipse(x - 8 * s, y - 7 * s, 25 * s, 10 * s);
  g.fillEllipse(x + 10 * s, y - 4 * s, 20 * s, 8 * s);
  // Light dapples
  g.fillStyle(0x4a7a35, 0.4);
  g.fillEllipse(x + 5 * s, y - 8 * s, 15 * s, 6 * s);
  g.fillEllipse(x - 15 * s, y - 3 * s, 12 * s, 5 * s);
}

function drawGrassTuft(g, x, y, scale) {
  const s = scale;
  const blades = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < blades; i++) {
    const green = [0x6a9a30, 0x7aaa40, 0x5a8a28, 0x8aba48, 0x9aba3a][Math.floor(Math.random() * 5)];
    g.lineStyle(1.5 * s, green, 0.8);
    const angle = -0.4 + Math.random() * 0.8;
    const bh = (12 + Math.random() * 16) * s;
    g.lineBetween(x + i * 2 * s, y, x + i * 2 * s + Math.sin(angle) * bh, y - bh);
  }
  // Base cluster
  g.fillStyle(0x6a8a30, 0.5);
  g.fillEllipse(x + blades * s, y, blades * 3 * s, 4 * s);
}
