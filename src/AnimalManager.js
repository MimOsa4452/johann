import { DEPTH } from './constants.js';

const ANIMAL_TYPES = {
  // Correct targets — positive score
  springbok: { color: 0xd4a060, width: 50, height: 35, speed: [180, 300], points: 100, correct: true },
  impala:    { color: 0xc48840, width: 55, height: 40, speed: [150, 260], points: 80,  correct: true },
  kudu:      { color: 0x8b6e4e, width: 60, height: 50, speed: [120, 220], points: 120, correct: true },
  // Wrong targets — penalty
  elephant:  { color: 0x888888, width: 90, height: 70, speed: [60, 100],  points: -200, correct: false },
  giraffe:   { color: 0xe0c060, width: 40, height: 80, speed: [80, 130],  points: -150, correct: false },
  bird:      { color: 0x333333, width: 20, height: 15, speed: [250, 400], points: -100, correct: false },
  warthog:   { color: 0x6b5040, width: 45, height: 30, speed: [100, 180], points: -120, correct: false },
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
      delay: 1200,
      callback: this.spawnAnimal,
      callbackScope: this,
      loop: true,
    });
    // Spawn a few immediately
    this.spawnAnimal();
    this.scene.time.delayedCall(400, () => this.spawnAnimal());
  }

  stop() {
    this.active = false;
    if (this.spawnTimer) { this.spawnTimer.remove(); this.spawnTimer = null; }
    this.animals.forEach(a => { if (a.sprite) a.sprite.destroy(); });
    this.animals = [];
  }

  spawnAnimal() {
    if (!this.active) return;

    // 70% chance correct target, 30% wrong
    const isCorrect = Math.random() < 0.7;
    const pool = isCorrect ? CORRECT_TYPES : WRONG_TYPES;
    const typeName = pool[Math.floor(Math.random() * pool.length)];
    const type = ANIMAL_TYPES[typeName];

    const { width: sw, height: sh } = this.scene.scale;

    // Spawn from left or right edge
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -type.width : sw + type.width;
    const endX = fromLeft ? sw + type.width : -type.width;

    // Random Y in the ground/midground area
    const minY = sh * 0.45;
    const maxY = sh * 0.75;
    const y = minY + Math.random() * (maxY - minY);

    const sprite = this.scene.add.rectangle(startX, y, type.width, type.height, type.color)
      .setDepth(DEPTH.ANIMALS);

    // Add a label so player can tell what it is
    const label = this.scene.add.text(startX, y - type.height / 2 - 10, typeName, {
      fontSize: '12px',
      color: type.correct ? '#ffffff' : '#ff4444',
    }).setOrigin(0.5, 1).setDepth(DEPTH.ANIMALS);

    // Ignore by uiCamera
    if (this.scene.uiCamera) {
      this.scene.uiCamera.ignore([sprite, label]);
    }

    const speed = type.speed[0] + Math.random() * (type.speed[1] - type.speed[0]);
    const distance = Math.abs(endX - startX);
    const duration = (distance / speed) * 1000;

    const animal = {
      sprite,
      label,
      typeName,
      type,
      alive: true,
    };

    this.animals.push(animal);

    this.scene.tweens.add({
      targets: [sprite, label],
      x: endX,
      duration,
      ease: 'Linear',
      onUpdate: () => {
        if (label.active) label.y = sprite.y - type.height / 2 - 10;
      },
      onComplete: () => {
        this.removeAnimal(animal);
      },
    });
  }

  removeAnimal(animal) {
    animal.alive = false;
    if (animal.sprite && animal.sprite.active) animal.sprite.destroy();
    if (animal.label && animal.label.active) animal.label.destroy();
    this.animals = this.animals.filter(a => a !== animal);
  }

  checkHit(worldX, worldY) {
    // Check from front to back (last spawned first)
    for (let i = this.animals.length - 1; i >= 0; i--) {
      const animal = this.animals[i];
      if (!animal.alive || !animal.sprite.active) continue;

      const s = animal.sprite;
      const hw = animal.type.width / 2;
      const hh = animal.type.height / 2;

      if (worldX >= s.x - hw && worldX <= s.x + hw &&
          worldY >= s.y - hh && worldY <= s.y + hh) {
        const result = {
          hit: true,
          correct: animal.type.correct,
          points: animal.type.points,
          typeName: animal.typeName,
          x: s.x,
          y: s.y,
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
