import Phaser from "phaser";
import Player from "./Player";

export default class Enemy {
    constructor(scene, x, y, spriteKey = 'goomba', props = {}){
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

    update(){
        if(!this.alive) return;
        this.sprite.setVelocityX(this.sprite.body.velocity.x > 0 ? this.speed : -this.speed);

        // Si choca con un muro..
        if(this.sprite.body.blocked.left){
            this.sprite.setVelocityX(this.speed);
            this.sprite.flipX = true;
        } else if(this.sprite.body.blocked.right){
            this.sprite.setVelocityX(-this.speed)
            this.sprite.flipX = false;
        }
    }

    // custom methods
    stomped(){
        if(!this.alive) return;
        this.alive = false;

        //animación de aplastamiento
        this.sprite.setVelocity(0, 0);
        this.sprite.anims.stop();
        this.sprite.setFrame(2);
        this.sprite.disableBody(true, false);
        //sound
        this.scene.audio.playStomp();

        this.sprite.body.setSize(this.sprite.body.width, this.sprite.body.height / 2);
        this.sprite.body.position.y += this.sprite.body.height / 2;
        
        this.scene.time.delayedCall(500, () => this.sprite.destroy());
    }

    hitByShell(shellEnemy) {
        if (!this.alive) return;
        this.alive = false;
        
        // Detener movimiento horizontal
        this.sprite.setVelocityX(0);
        
        // Empujar al enemigo hacia arriba y lateralmente según dirección del shell
        const direction = shellEnemy.sprite.x < this.sprite.x ? 1 : -1;
        this.sprite.setVelocity(200 * direction, -200); // lateral + vertical
        this.sprite.body.allowGravity = true;
        
        // Desactivar colisión con otros enemigos y Mario
        this.sprite.body.checkCollision.none = true;
        
        // Rotación mientras cae
        this.scene.tweens.add({
            targets: this.sprite,
            angle: 360 * 2, // 2 giros completos
            duration: 1000,
            ease: 'Linear'
        });
    
        // Sonido de aplastamiento
        this.scene.audio.playStomp();
    
        // Destruir después de 1 segundo
        this.scene.time.delayedCall(1000, () => {
            this.sprite.destroy();
        });
    }

    hitPlayer(player) {
    if (!this.alive) return;
    if (player.invulnerable) return;

    if (player.size === 'big' || player.size === 'fire') {
        player.invulnerable = true;
        player.ignoreEnemySide = true; // Activar inmediatamente

        // Pausar brevemente para la animación de encogimiento
        this.scene.physics.world.pause();
        player.sprite.setVelocity(0, 0);
        this.sprite.setVelocity(0, 0);
        //sound
        this.scene.audio.playPowerDown();

        player.shrink();

        this.scene.time.delayedCall(800, () => {
            this.scene.physics.world.resume();

            // Efecto de parpadeo
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
                    player.ignoreEnemySide = false; // Reactivar colisiones laterales
                    player.invulnerable = false;
                }
            });
        });
    } else {
        //this.scene.gameOver();
        this.scene.gameOver({withAnimation: true}); //Activar cuando esté hecha la animación de Game Over para Mario...
    }
}

}