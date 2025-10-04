// src/entities/Fireball.js
import Phaser from "phaser";

export default class Fireball {
  constructor(scene, x, y, dir = 1) {
    this.scene = scene;
    this.dir = dir;
    this.speed = 220;
    this.sprite = scene.physics.add.sprite(x, y, 'fireball');
    this.sprite.setOrigin(0.5);
    this.sprite.setBounce(1, 0.5);
    this.sprite.setFriction(0);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.fireballRef = this;

    // Física
    this.sprite.body.allowGravity = true;
    this.sprite.body.setGravityY(400);
    this.sprite.setVelocityX(this.speed * dir);

    // Animación (si existe)
    if (scene.anims.exists('fireball-spin')) {
      this.sprite.play('fireball-spin');
    }

    // límites del mundo (para detección manual)
    this.camera = scene.cameras.main;
  }

  update() {
    if (!this.sprite || !this.sprite.body) return;

    // 1. Rebota en el suelo, pero no destruyas al tocar abajo
    if (this.sprite.body.blocked.down) {
      this.sprite.setVelocityY(-160); // pequeño rebote vertical
    }

    // 2. Si choca con pared lateral, destruye
    if (this.sprite.body.blocked.left || this.sprite.body.blocked.right) {
      this.destroy();
      return;
    }

    // 3. Mantener velocidad horizontal constante
    const minSpeed = 150;
    const desiredSpeed = this.speed * this.dir;
    if (Math.abs(this.sprite.body.velocity.x) < minSpeed){
        this.sprite.setVelocityX(desiredSpeed);
    }

    // 4. Si sale de cámara, destruye
    const cam = this.camera;
    const leftLimit = cam.worldView.x - 16;
    const rightLimit = cam.worldView.x + cam.worldView.width + 16;

    if (this.sprite.x < leftLimit || this.sprite.x > rightLimit) {
      this.destroy();
    }
  }

  destroy(withExplosion = true) {
    if(!this.sprite || !this.sprite.scene) return;

    const { x, y } = this.sprite;

    if (withExplosion && this.scene.anims.exists('fireball-explode')) {
        const explosion = this.scene.add.sprite(x, y, 'fireball-explode');
        explosion.setDepth(15);
        explosion.play('fireball-explode');

        explosion.on('animationcomplete', () => explosion.destroy());
    }
    this.sprite.destroy();
  }
}
