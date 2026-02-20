import { DEPTH } from './constants.js';

// ── Animal definitions ──────────────────────────────────────────────────
// Correct targets: wild African antelope
// Wrong targets: domestic animals (cows, pigs, chickens, goats)
const ANIMAL_TYPES = {
  // Correct — wild antelope
  springbok: {
    basePoints: 100, correct: true,
    speed: [160, 280],
    draw: (g, w, h) => {
      // Body
      g.fillStyle(0xd4a060); g.fillEllipse(0, 0, w, h * 0.55);
      // White belly
      g.fillStyle(0xf0e8d0); g.fillEllipse(0, h * 0.1, w * 0.85, h * 0.3);
      // Head
      g.fillStyle(0xc89850); g.fillEllipse(w * 0.42, -h * 0.22, w * 0.22, h * 0.28);
      // Horns (lyre-shaped)
      g.lineStyle(2, 0x333333);
      g.beginPath(); g.moveTo(w*0.44, -h*0.35); g.lineTo(w*0.48, -h*0.58); g.lineTo(w*0.42, -h*0.62); g.strokePath();
      g.beginPath(); g.moveTo(w*0.40, -h*0.35); g.lineTo(w*0.36, -h*0.56); g.lineTo(w*0.30, -h*0.58); g.strokePath();
      // Eye
      g.fillStyle(0x000000); g.fillCircle(w * 0.46, -h * 0.24, 2);
      // Legs
      g.lineStyle(3, 0xb08040);
      g.lineBetween(-w*0.2, h*0.2, -w*0.22, h*0.48);
      g.lineBetween(-w*0.05, h*0.2, -w*0.03, h*0.48);
      g.lineBetween(w*0.15, h*0.2, w*0.17, h*0.48);
      g.lineBetween(w*0.28, h*0.2, w*0.30, h*0.48);
      // Hooves
      g.fillStyle(0x222222);
      [[-w*0.22, h*0.48], [-w*0.03, h*0.48], [w*0.17, h*0.48], [w*0.30, h*0.48]].forEach(([x,y]) => g.fillCircle(x, y, 2));
      // Dark dorsal stripe
      g.lineStyle(2, 0x8b6e3e); g.lineBetween(-w*0.3, -h*0.05, w*0.35, -h*0.12);
      // Tail
      g.lineStyle(2, 0xc89850); g.lineBetween(-w*0.45, -h*0.05, -w*0.52, -h*0.15);
    },
    w: 70, h: 55,
  },
  impala: {
    basePoints: 80, correct: true,
    speed: [140, 240],
    draw: (g, w, h) => {
      // Body
      g.fillStyle(0xc48840); g.fillEllipse(0, 0, w, h * 0.5);
      // Lighter underside
      g.fillStyle(0xe8d4b0); g.fillEllipse(0, h * 0.08, w * 0.8, h * 0.25);
      // Head
      g.fillStyle(0xb07830); g.fillEllipse(w * 0.42, -h * 0.2, w * 0.2, h * 0.25);
      // Horns (S-curved)
      g.lineStyle(2, 0x444444);
      g.beginPath(); g.moveTo(w*0.44, -h*0.32); g.lineTo(w*0.50, -h*0.52); g.lineTo(w*0.44, -h*0.65); g.strokePath();
      g.beginPath(); g.moveTo(w*0.40, -h*0.32); g.lineTo(w*0.34, -h*0.50); g.lineTo(w*0.28, -h*0.62); g.strokePath();
      // Eye
      g.fillStyle(0x000000); g.fillCircle(w * 0.46, -h * 0.22, 2);
      // Legs
      g.lineStyle(3, 0xa07028);
      g.lineBetween(-w*0.18, h*0.18, -w*0.20, h*0.48);
      g.lineBetween(-w*0.02, h*0.18, 0, h*0.48);
      g.lineBetween(w*0.14, h*0.18, w*0.16, h*0.48);
      g.lineBetween(w*0.26, h*0.18, w*0.28, h*0.48);
      g.fillStyle(0x222222);
      [[-w*0.20, h*0.48], [0, h*0.48], [w*0.16, h*0.48], [w*0.28, h*0.48]].forEach(([x,y]) => g.fillCircle(x, y, 2));
      // Tail
      g.lineStyle(2, 0xc48840); g.lineBetween(-w*0.44, -h*0.02, -w*0.50, h*0.05);
    },
    w: 68, h: 52,
  },
  kudu: {
    basePoints: 140, correct: true,
    speed: [100, 190],
    draw: (g, w, h) => {
      // Body — larger, more majestic
      g.fillStyle(0x7a6450); g.fillEllipse(0, 0, w, h * 0.5);
      // White vertical stripes
      g.lineStyle(1.5, 0xccbbaa, 0.5);
      for (let i = -2; i <= 2; i++) {
        g.lineBetween(w * i * 0.08, -h * 0.18, w * i * 0.08, h * 0.18);
      }
      // Lighter belly
      g.fillStyle(0xc4b098); g.fillEllipse(0, h * 0.1, w * 0.75, h * 0.22);
      // Head
      g.fillStyle(0x6b5a48); g.fillEllipse(w * 0.42, -h * 0.22, w * 0.2, h * 0.26);
      // Magnificent spiral horns
      g.lineStyle(2.5, 0x555555);
      g.beginPath(); g.moveTo(w*0.44, -h*0.34); g.lineTo(w*0.52, -h*0.50); g.lineTo(w*0.46, -h*0.62); g.lineTo(w*0.52, -h*0.72); g.strokePath();
      g.beginPath(); g.moveTo(w*0.40, -h*0.34); g.lineTo(w*0.32, -h*0.48); g.lineTo(w*0.38, -h*0.60); g.lineTo(w*0.32, -h*0.70); g.strokePath();
      // Eye
      g.fillStyle(0x000000); g.fillCircle(w * 0.46, -h * 0.22, 2.5);
      // Beard tuft
      g.lineStyle(2, 0x5a4a38); g.lineBetween(w*0.48, -h*0.14, w*0.52, -h*0.08);
      // Legs — sturdier
      g.lineStyle(4, 0x6b5a48);
      g.lineBetween(-w*0.18, h*0.2, -w*0.20, h*0.48);
      g.lineBetween(-w*0.02, h*0.2, 0, h*0.48);
      g.lineBetween(w*0.14, h*0.2, w*0.16, h*0.48);
      g.lineBetween(w*0.26, h*0.2, w*0.28, h*0.48);
      g.fillStyle(0x222222);
      [[-w*0.20, h*0.48], [0, h*0.48], [w*0.16, h*0.48], [w*0.28, h*0.48]].forEach(([x,y]) => g.fillCircle(x, y, 3));
      // Tail
      g.lineStyle(3, 0x7a6450); g.lineBetween(-w*0.44, -h*0.02, -w*0.52, h*0.08);
    },
    w: 85, h: 68,
  },

  // Wrong targets — domestic animals
  cow: {
    basePoints: -250, correct: false,
    speed: [50, 90],
    draw: (g, w, h) => {
      // Body — big and boxy
      g.fillStyle(0xeeeeee); g.fillEllipse(0, 0, w, h * 0.55);
      // Black patches
      g.fillStyle(0x222222);
      g.fillEllipse(-w*0.15, -h*0.08, w*0.25, h*0.22);
      g.fillEllipse(w*0.1, h*0.02, w*0.2, h*0.18);
      // Head
      g.fillStyle(0xeeeeee); g.fillEllipse(w * 0.42, -h * 0.15, w * 0.22, h * 0.3);
      // Snout
      g.fillStyle(0xffccaa); g.fillEllipse(w * 0.50, -h * 0.08, w * 0.12, h * 0.14);
      // Eyes
      g.fillStyle(0x000000); g.fillCircle(w * 0.44, -h * 0.18, 2.5);
      // Horns — small stubs
      g.lineStyle(2, 0x888888);
      g.lineBetween(w*0.40, -h*0.28, w*0.36, -h*0.36);
      g.lineBetween(w*0.44, -h*0.28, w*0.48, -h*0.36);
      // Udder
      g.fillStyle(0xffbbcc); g.fillEllipse(w*0.05, h*0.22, w*0.15, h*0.12);
      // Legs
      g.lineStyle(4, 0xdddddd);
      g.lineBetween(-w*0.2, h*0.22, -w*0.22, h*0.48);
      g.lineBetween(-w*0.02, h*0.22, 0, h*0.48);
      g.lineBetween(w*0.16, h*0.22, w*0.18, h*0.48);
      g.lineBetween(w*0.28, h*0.22, w*0.30, h*0.48);
      g.fillStyle(0x222222);
      [[-w*0.22, h*0.48], [0, h*0.48], [w*0.18, h*0.48], [w*0.30, h*0.48]].forEach(([x,y]) => g.fillCircle(x, y, 3));
      // Tail
      g.lineStyle(2, 0xcccccc); g.lineBetween(-w*0.46, -h*0.02, -w*0.54, h*0.10);
      g.fillStyle(0x222222); g.fillCircle(-w*0.54, h*0.10, 4); // tail tuft
    },
    w: 95, h: 72,
  },
  pig: {
    basePoints: -200, correct: false,
    speed: [60, 110],
    draw: (g, w, h) => {
      // Body — round and pink
      g.fillStyle(0xf0a0a0); g.fillEllipse(0, 0, w, h * 0.6);
      // Head
      g.fillStyle(0xf0a0a0); g.fillEllipse(w * 0.38, -h * 0.1, w * 0.25, h * 0.35);
      // Snout
      g.fillStyle(0xe88888); g.fillEllipse(w * 0.48, -h * 0.06, w * 0.1, h * 0.14);
      g.fillStyle(0xcc6666); g.fillCircle(w*0.47, -h*0.08, 2); g.fillCircle(w*0.49, -h*0.08, 2); // nostrils
      // Ears
      g.fillStyle(0xe89090);
      g.fillTriangle(w*0.32, -h*0.24, w*0.26, -h*0.38, w*0.36, -h*0.34);
      g.fillTriangle(w*0.40, -h*0.24, w*0.44, -h*0.38, w*0.38, -h*0.34);
      // Eye
      g.fillStyle(0x000000); g.fillCircle(w * 0.40, -h * 0.16, 2);
      // Legs — short and stubby
      g.lineStyle(5, 0xe89898);
      g.lineBetween(-w*0.16, h*0.22, -w*0.16, h*0.42);
      g.lineBetween(w*0.0, h*0.22, w*0.0, h*0.42);
      g.lineBetween(w*0.16, h*0.22, w*0.16, h*0.42);
      g.lineBetween(w*0.28, h*0.22, w*0.28, h*0.42);
      g.fillStyle(0xcc7777);
      [[-w*0.16, h*0.42], [0, h*0.42], [w*0.16, h*0.42], [w*0.28, h*0.42]].forEach(([x,y]) => g.fillCircle(x, y, 3));
      // Curly tail
      g.lineStyle(2, 0xe89898);
      g.beginPath(); g.arc(-w*0.44, -h*0.02, 8, 0, Math.PI * 1.5, false); g.strokePath();
    },
    w: 70, h: 55,
  },
  chicken: {
    basePoints: -150, correct: false,
    speed: [70, 140],
    draw: (g, w, h) => {
      // Body
      g.fillStyle(0xdd8833); g.fillEllipse(0, 0, w, h * 0.55);
      // Wing
      g.fillStyle(0xcc7722); g.fillEllipse(-w*0.05, -h*0.02, w*0.4, h*0.3);
      // Head
      g.fillStyle(0xdd8833); g.fillCircle(w * 0.38, -h * 0.25, w * 0.12);
      // Comb
      g.fillStyle(0xff2222);
      g.fillTriangle(w*0.36, -h*0.36, w*0.32, -h*0.46, w*0.40, -h*0.42);
      g.fillTriangle(w*0.40, -h*0.38, w*0.38, -h*0.48, w*0.44, -h*0.44);
      // Beak
      g.fillStyle(0xffaa00);
      g.fillTriangle(w*0.44, -h*0.26, w*0.54, -h*0.24, w*0.46, -h*0.20);
      // Wattle
      g.fillStyle(0xff3333); g.fillCircle(w*0.42, -h*0.18, 3);
      // Eye
      g.fillStyle(0x000000); g.fillCircle(w * 0.40, -h * 0.27, 1.5);
      // Legs
      g.lineStyle(2, 0xddaa00);
      g.lineBetween(w*0.0, h*0.22, w*0.0, h*0.44);
      g.lineBetween(w*0.12, h*0.22, w*0.12, h*0.44);
      // Feet
      g.lineBetween(w*0.0, h*0.44, -w*0.06, h*0.48);
      g.lineBetween(w*0.0, h*0.44, w*0.06, h*0.48);
      g.lineBetween(w*0.12, h*0.44, w*0.06, h*0.48);
      g.lineBetween(w*0.12, h*0.44, w*0.18, h*0.48);
      // Tail feathers
      g.lineStyle(2, 0xaa6622);
      g.lineBetween(-w*0.38, h*0.0, -w*0.50, -h*0.15);
      g.lineBetween(-w*0.38, h*0.02, -w*0.52, -h*0.08);
      g.lineBetween(-w*0.38, h*0.04, -w*0.50, h*0.0);
    },
    w: 45, h: 40,
  },
  goat: {
    basePoints: -180, correct: false,
    speed: [70, 130],
    draw: (g, w, h) => {
      // Body
      g.fillStyle(0xccbbaa); g.fillEllipse(0, 0, w, h * 0.5);
      // Head
      g.fillStyle(0xbbaa99); g.fillEllipse(w * 0.40, -h * 0.18, w * 0.2, h * 0.28);
      // Beard
      g.fillStyle(0x998877);
      g.fillTriangle(w*0.44, -h*0.06, w*0.40, h*0.06, w*0.48, h*0.06);
      // Horns — curved back
      g.lineStyle(2, 0x666666);
      g.beginPath(); g.moveTo(w*0.38, -h*0.30); g.lineTo(w*0.30, -h*0.44); g.lineTo(w*0.26, -h*0.42); g.strokePath();
      g.beginPath(); g.moveTo(w*0.42, -h*0.30); g.lineTo(w*0.46, -h*0.44); g.lineTo(w*0.50, -h*0.42); g.strokePath();
      // Eye
      g.fillStyle(0x000000); g.fillCircle(w * 0.44, -h * 0.20, 2);
      // Rectangular pupil hint
      g.fillStyle(0x444400); g.fillRect(w*0.43, -h*0.21, 3, 1.5);
      // Legs
      g.lineStyle(3, 0xbbaa99);
      g.lineBetween(-w*0.18, h*0.2, -w*0.20, h*0.46);
      g.lineBetween(-w*0.02, h*0.2, 0, h*0.46);
      g.lineBetween(w*0.14, h*0.2, w*0.16, h*0.46);
      g.lineBetween(w*0.26, h*0.2, w*0.28, h*0.46);
      g.fillStyle(0x222222);
      [[-w*0.20, h*0.46], [0, h*0.46], [w*0.16, h*0.46], [w*0.28, h*0.46]].forEach(([x,y]) => g.fillCircle(x, y, 2));
      // Tail — short upward
      g.lineStyle(2, 0xbbaa99); g.lineBetween(-w*0.44, -h*0.04, -w*0.48, -h*0.14);
    },
    w: 65, h: 55,
  },
};

const CORRECT_TYPES = Object.keys(ANIMAL_TYPES).filter(k => ANIMAL_TYPES[k].correct);
const WRONG_TYPES   = Object.keys(ANIMAL_TYPES).filter(k => !ANIMAL_TYPES[k].correct);

export class AnimalManager {
  constructor(scene) {
    this.scene = scene;
    this.animals = [];
    this.spawnTimer = null;
    this.active = false;
  }

  start() {
    this.active = true;
    this.spawnTimer = this.scene.time.addEvent({
      delay: 1400,
      callback: this.spawnAnimal,
      callbackScope: this,
      loop: true,
    });
    this.spawnAnimal();
    this.scene.time.delayedCall(500, () => this.spawnAnimal());
  }

  stop() {
    this.active = false;
    if (this.spawnTimer) { this.spawnTimer.remove(); this.spawnTimer = null; }
    this.animals.forEach(a => {
      if (a.container && a.container.active) a.container.destroy();
    });
    this.animals = [];
  }

  spawnAnimal() {
    if (!this.active) return;

    const isCorrect = Math.random() < 0.65;
    const pool = isCorrect ? CORRECT_TYPES : WRONG_TYPES;
    const typeName = pool[Math.floor(Math.random() * pool.length)];
    const type = ANIMAL_TYPES[typeName];

    const { width: sw, height: sh } = this.scene.scale;

    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -type.w : sw + type.w;
    const endX = fromLeft ? sw + type.w : -type.w;

    // Spawn Y — further back (higher) = smaller and more points
    const minY = sh * 0.42;
    const maxY = sh * 0.78;
    const y = minY + Math.random() * (maxY - minY);

    // Distance factor: animals near top are "far away" — scale down, worth more
    const distanceNorm = 1 - ((y - minY) / (maxY - minY)); // 0=close, 1=far
    const scaleFactor = 0.6 + (1 - distanceNorm) * 0.5; // far=0.6, close=1.1

    // Draw the animal using graphics
    const g = this.scene.add.graphics();
    type.draw(g, type.w, type.h);

    // Create a container to hold the graphics
    const container = this.scene.add.container(startX, y, [g])
      .setDepth(DEPTH.ANIMALS + Math.floor((1 - distanceNorm) * 9)) // closer = higher depth
      .setScale(scaleFactor * (fromLeft ? 1 : -1), scaleFactor); // flip if going right-to-left

    if (this.scene.uiCamera) {
      this.scene.uiCamera.ignore(container);
    }

    // Speed with slight distance adjustment (far = slightly slower visually)
    const baseSpeed = type.speed[0] + Math.random() * (type.speed[1] - type.speed[0]);
    const speed = baseSpeed * (0.7 + (1 - distanceNorm) * 0.3);
    const distance = Math.abs(endX - startX);
    const duration = (distance / speed) * 1000;

    // Walking bob animation
    const bobTween = this.scene.tweens.add({
      targets: container,
      y: y - 3 * scaleFactor,
      duration: 280 + Math.random() * 120,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Leg animation — subtle rotation
    const legTween = this.scene.tweens.add({
      targets: g,
      angle: { from: -1.5, to: 1.5 },
      duration: 200 + Math.random() * 80,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const animal = {
      container,
      graphics: g,
      typeName,
      type,
      alive: true,
      distanceNorm,
      speed: baseSpeed,
      scaleFactor,
      bobTween,
      legTween,
    };

    this.animals.push(animal);

    this.scene.tweens.add({
      targets: container,
      x: endX,
      duration,
      ease: 'Linear',
      onComplete: () => {
        this.removeAnimal(animal);
      },
    });
  }

  removeAnimal(animal) {
    animal.alive = false;
    if (animal.bobTween) animal.bobTween.stop();
    if (animal.legTween) animal.legTween.stop();
    if (animal.container && animal.container.active) animal.container.destroy();
    this.animals = this.animals.filter(a => a !== animal);
  }

  checkHit(worldX, worldY) {
    for (let i = this.animals.length - 1; i >= 0; i--) {
      const animal = this.animals[i];
      if (!animal.alive || !animal.container.active) continue;

      const c = animal.container;
      const hw = (animal.type.w / 2) * animal.scaleFactor;
      const hh = (animal.type.h / 2) * animal.scaleFactor;

      if (worldX >= c.x - hw && worldX <= c.x + hw &&
          worldY >= c.y - hh && worldY <= c.y + hh) {

        // Score multipliers for correct targets
        let points = animal.type.basePoints;
        if (animal.type.correct) {
          // Distance bonus: far shots worth more (1x–2.5x)
          const distMultiplier = 1 + animal.distanceNorm * 1.5;
          // Speed bonus: slow targets worth more (they're harder to find, rarer)
          // Invert: lower speed = higher multiplier
          const speedRange = animal.type.speed[1] - animal.type.speed[0];
          const speedNorm = (animal.speed - animal.type.speed[0]) / speedRange; // 0=slow, 1=fast
          const speedMultiplier = 1 + (1 - speedNorm) * 0.8; // slow=1.8x, fast=1x

          points = Math.round(points * distMultiplier * speedMultiplier);
        }

        const result = {
          hit: true,
          correct: animal.type.correct,
          points,
          typeName: animal.typeName,
          x: c.x,
          y: c.y,
          distanceNorm: animal.distanceNorm,
        };
        this.removeAnimal(animal);
        return result;
      }
    }
    return { hit: false };
  }

  destroy() {
    this.stop();
  }
}
