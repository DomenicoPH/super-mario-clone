import Phaser from "phaser";

export default class Fireball {
  constructor(scene, x, y, dir = 1) {
    this.scene = scene;
    this.dir = dir;
    this.speed = 220;
    this._isExploding = false;

    // crear sprite físico
    this.sprite = scene.physics.add.sprite(x, y, 'fireball');
    this.sprite.setOrigin(0.5);
    this.sprite.setBounce(1, 0.6);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.fireballRef = this;

    // física
    this.sprite.body.allowGravity = true;
    this.sprite.body.setGravityY(400);
    this.sprite.setVelocityX(this.speed * dir);

    // animación rotación
    if (scene.anims.exists('fireball-spin')) {
      this.sprite.play('fireball-spin');
    }

    // cámara para límites
    this.camera = scene.cameras.main;
  }

  update() {
    if (!this.sprite || !this.sprite.body || this._isExploding) return;

    // Rebote en el suelo (si cae sobre algo)
    if (this.sprite.body.blocked.down) {
      this.sprite.setVelocityY(-200);
    }

    // Si choca por arriba o por los lados -> explotar
    if (this.sprite.body.blocked.up || this.sprite.body.blocked.left || this.sprite.body.blocked.right) {
      this.explodeAndDestroy();
      return;
    }

    // Mantener velocidad horizontal
    const minSpeed = 150;
    const desiredSpeed = this.speed * this.dir;
    if (Math.abs(this.sprite.body.velocity.x) < minSpeed) {
      this.sprite.setVelocityX(desiredSpeed);
    }

    // Si sale de la vista de la cámara, destruir sin explosión
    const cam = this.camera;
    const leftLimit = cam.worldView.x - 16;
    const rightLimit = cam.worldView.x + cam.worldView.width + 16;
    if (this.sprite.x < leftLimit || this.sprite.x > rightLimit) {
      this.destroy(false);
    }
  }

  // Explota (animación) y destruye. Desactiva cuerpo para evitar colisiones extra.
  explodeAndDestroy() {
    if (!this.sprite || !this.sprite.scene || this._isExploding) return;
    this._isExploding = true;

    // Detener la bola y desactivar su cuerpo para que no siga colisionando
    if (this.sprite.body) {
      this.sprite.body.setVelocity(0, 0);
      this.sprite.body.enable = false;
    }
    this.sprite.setVisible(false);

    // Crear y reproducir la animación de explosión en la misma posición
    const { x, y } = this.sprite;
    if (this.scene.anims.exists('fireball-explode')) {
      const explosion = this.scene.add.sprite(x, y, 'fireball-explode').setOrigin(0.5);
      explosion.setDepth(15);
      explosion.play('fireball-explode');

      // destruir la explosion al completar
      explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => explosion.destroy());
    }

    // finalmente destruir el sprite de la bola
    // lo hacemos en el siguiente tick para evitar races en algunos builds
    this.scene.time.delayedCall(0, () => {
      if (this.sprite && this.sprite.destroy) this.sprite.destroy();
    });
  }

  // Destrucción inmediata (opcionalmente sin animación)
  destroy(withExplosion = true) {
    if (withExplosion) {
      this.explodeAndDestroy();
    } else {
      if (this.sprite && this.sprite.scene) {
        this.sprite.destroy();
      }
    }
  }
}
