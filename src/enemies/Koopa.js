import StatefulEnemy from "../entities/StatefulEnemy";

export const STATE = {
  WALK: 'WALK',
  SHELL_STATIONARY: 'SHELL_STATIONARY',
  SHELL_MOVING: 'SHELL_MOVING',
  REVIVE_WARNING: 'REVIVE_WARNING'
};

export default class Koopa extends StatefulEnemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, 'koopa');

    this.shellSpeed = 300

    // === Animaciones ===
    if (!scene.anims.exists('koopa-walk')) {
      scene.anims.create({
        key: 'koopa-walk',
        frames: scene.anims.generateFrameNumbers('koopa', { start: 0, end: 1 }),
        frameRate: 6,
        repeat: -1
      });
    }

    if (!scene.anims.exists('koopa-shell')) {
      scene.anims.create({
        key: 'koopa-shell',
        frames: [{ key: 'koopa', frame: 2 }],
        frameRate: 1
      });
    }

    if (!scene.anims.exists('koopa-revive')) {
      scene.anims.create({
        key: 'koopa-revive',
        frames: scene.anims.generateFrameNumbers('koopa', { start: 3, end: 4 }),
        frameRate: 4,
        repeat: -1
      });
    }

    // === Configuración ===
    this.startDirection = props.direction || 'left';
    this.speed = props.speed ?? 40;

    this.directionFactor = this.startDirection === 'left' ? -1 : 1;
    
    this.sprite.play('koopa-walk');
    this.sprite.setBounce(0);
    this.sprite.setCollideWorldBounds(true);

    // Movimiento inicial
    this.sprite.setVelocityX(this.speed * this.directionFactor);
    this.sprite.flipX = this.directionFactor > 0; // true si va a la derecha

    this.setState(STATE.WALK);
  }

  update() {
    if (!this.alive) return;

    switch (this.state) {
      case STATE.WALK:
        super.update();
        if (!this.sprite.anims.isPlaying) this.sprite.play('koopa-walk', true);
        break;

      case STATE.SHELL_STATIONARY:
        this.sprite.setVelocityX(0);
        break;

      case STATE.SHELL_MOVING:
        this.sprite.setVelocityX(this.shellSpeed * (this.directionFactor || Math.sign(this.sprite.body.velocity.x) || 1));
        break;

      case STATE.REVIVE_WARNING:
        if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== 'koopa-revive') {
          this.sprite.play('koopa-revive', true);
        }
        this.sprite.setVelocityX(0);
        break;
    }
  }

  stomped() {
    if (this.state === STATE.WALK) {
      this.enterShell();
    } else if ([STATE.SHELL_STATIONARY, STATE.REVIVE_WARNING].includes(this.state)) {
      const playerX = this.scene.player.sprite.x;
      const dir = playerX < this.sprite.x ? 1 : -1;
      this.kick(dir);
    } else if (this.state === STATE.SHELL_MOVING) {
      this.stopShell();
    }
  }

  adjustBodySize(state = this.state){
    const body = this.sprite.body;
    if(!body) return;

    const normalHeight = 24;
    const shellHeight = 14;
    const width = 16;

    switch (state) {
      case STATE.WALK:
        body.setSize(width, normalHeight);
        body.setOffset(0, this.sprite.height - normalHeight); // ajusta según tu sprite (puedes calibrarlo)
        break;

      case STATE.SHELL_STATIONARY:
      case STATE.SHELL_MOVING:
      case STATE.REVIVE_WARNING:
        body.setSize(width, shellHeight);
        body.setOffset(0, this.sprite.height - shellHeight); // lo bajamos un poco para coincidir con el caparazón
        break;
    }
  }

  enterShell() {
    this.clearTimers();
    this.setState(STATE.SHELL_STATIONARY, () => {
      this.sprite.setVelocity(0, 0);
      this.sprite.play('koopa-shell');
      this.adjustBodySize(STATE.SHELL_STATIONARY);
      this.sprite.y += 1;

      const body = this.sprite.body;
        if (body) {
          body.setOffset(body.offset.x, body.offset.y - 2);
        }

      this.setTimer(5000, () => {
        if (this.state === STATE.SHELL_STATIONARY) this.enterReviveWarning();
      });

    });
  }

  enterReviveWarning() {
    this.setState(STATE.REVIVE_WARNING, () => {
      this.sprite.play('koopa-revive');
      this.adjustBodySize(STATE.REVIVE_WARNING);

      this.setTimer(2000, () => {
        if (this.state === STATE.REVIVE_WARNING) this.revive();
      });

    });
  }

  kick(direction) {
    this.clearTimers();
    this.setState(STATE.SHELL_MOVING, () => {
      this.directionFactor = direction;
      this.sprite.setVelocityX(this.shellSpeed * direction);
      this.sprite.play('koopa-shell');
      this.sprite.flipX = direction > 0;
    });
  }

  stopShell() {
    this.enterShell();
  }

  revive() {
    this.clearTimers();
    this.setState(STATE.WALK, () => {
        this.sprite.play('koopa-walk');
        this.sprite.setVelocityX(this.speed * this.directionFactor);
        this.sprite.flipX = this.directionFactor > 0;
        this.adjustBodySize(STATE.WALK);
    });
  }
}