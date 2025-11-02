import Phaser from "phaser";
import Player from "./Player";

export default class Enemy {
    constructor(scene, x, y, spriteKey = 'goomba', props = {}) {
        this.scene = scene;

        this.type = props.type || spriteKey || 'enemy';
        this.isGoomba = this.type === 'goomba';
        this.isKoopa = this.type === 'koopa';

        this.sprite = scene.physics.add.sprite(x, y, spriteKey);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        this.sprite.setVelocityX(-50);
        this.sprite.enemyRef = this;
        this.alive = true;
        this.speed = 50;
    }

    update() {
        if (!this.alive) return;
        this.sprite.setVelocityX(this.sprite.body.velocity.x > 0 ? this.speed : -this.speed);

        if (this.sprite.body.blocked.left) {
            this.sprite.setVelocityX(this.speed);
            this.sprite.flipX = true;
        } else if (this.sprite.body.blocked.right) {
            this.sprite.setVelocityX(-this.speed);
            this.sprite.flipX = false;
        }
    }

    stomped() {
        if (!this.alive) return;
        this.alive = false;

        this.sprite.setVelocity(0, 0);
        this.sprite.anims.stop();
        this.sprite.setFrame(2);
        this.sprite.disableBody(true, false);
        this.scene.audio.playStomp();

        this.scene.scoreManager.enemyDefeated('stomp');

        this.sprite.body.setSize(this.sprite.body.width, this.sprite.body.height / 2);
        this.sprite.body.position.y += this.sprite.body.height / 2;

        this.scene.time.delayedCall(500, () => this.sprite.destroy());
    }

    // Muerte por shell
    dieByShell(direction = 1) {
        if (!this.alive) return;
        this.alive = false;
    
        // Aplicar impulso inmediatamente
        this.sprite.setFlipY(true);
        this.sprite.setVelocity(60 * direction, -200);
        this.sprite.body.allowGravity = true;
        this.scene.audio.playKick();

        this.scene.scoreManager.enemyDefeated('shell');
    
        // Desactivar colisiones después de un breve delay para atravesar el suelo
        this.scene.time.delayedCall(100, () => {
            if (this.sprite && this.sprite.body) {
                this.sprite.body.checkCollision.none = true;
                this.sprite.setCollideWorldBounds(false);
            }
        });
    
        this.scene.time.delayedCall(1000, () => {
            if (this.sprite && this.sprite.destroy) this.sprite.destroy();
        });
    }
    
    // Muerte por fireball
    dieByFireball(direction = 1) {
        if (!this.alive) return;
        this.alive = false;
    
        // Quitar colisiones de inmediato
        if (this.sprite && this.sprite.body) {
            this.sprite.body.checkCollision.none = true;
            this.sprite.setCollideWorldBounds(false);
        }
    
        this.sprite.setFlipY(true);
        this.sprite.setVelocity(60 * direction, -200);
        this.sprite.body.allowGravity = true;
        this.scene.audio.playKick();

        this.scene.scoreManager.enemyDefeated('fireaball');
    
        this.scene.time.delayedCall(1000, () => {
            if (this.sprite && this.sprite.destroy) this.sprite.destroy();
        });
    }
    
    dieByBlockBump(direction = 1) {
        if (!this.alive) return;
        this.alive = false;
        
        // Quitar colisiones de inmediato
        if (this.sprite && this.sprite.body) {
            this.sprite.body.checkCollision.none = true;
            this.sprite.setCollideWorldBounds(false);
        }
    
        this.sprite.setFlipY(true);
        this.sprite.setVelocity(60 * direction, -300); // Más fuerza vertical que otros métodos
        this.sprite.body.allowGravity = true;
        this.scene.audio.playStomp(); // Usar el mismo sonido que stomp
    
        this.scene.time.delayedCall(1000, () => {
            if (this.sprite && this.sprite.destroy) this.sprite.destroy();
        });
    }

    hitByShell(shellEnemy) {
        if (!this.alive) return;
        const direction = shellEnemy.sprite.x < this.sprite.x ? 1 : -1;
        this.dieByShell(direction);
    }

    hitByFireball(fireball) {
        if (!this.alive) return;
        const direction = fireball.sprite.x < this.sprite.x ? 1 : -1;

        if (this.isKoopa && typeof this.onFireballHit === 'function') {
            this.onFireballHit();
        }

        this.onFireballHit?.();
        this.dieByFireball(direction);
        fireball.explodeAndDestroy();
    }

    hitPlayer(player) {
        if (!this.alive) return;
        if (player.invulnerable) return;

        if (player.size === 'big' || player.size === 'fire') {
            player.invulnerable = true;
            player.ignoreEnemySide = true;

            this.scene.physics.world.pause();
            player.sprite.setVelocity(0, 0);
            this.sprite.setVelocity(0, 0);
            this.scene.audio.playPowerDown();

            player.shrink();

            this.scene.time.delayedCall(800, () => {
                this.scene.physics.world.resume();

                player.sprite.setAlpha(0.5);
                this.scene.tweens.add({
                    targets: player.sprite,
                    alpha: 0.2,
                    ease: 'Linear',
                    duration: 200,
                    repeat: 5,
                    yoyo: true,
                    onComplete: () => {
                        player.sprite.setAlpha(1);
                        player.ignoreEnemySide = false;
                        player.invulnerable = false;
                    }
                });
            });
        } else {
            this.scene.gameOver({ withAnimation: true });
        }
    }
}