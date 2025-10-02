import Phaser from "phaser";
import Player from "./Player";

export default class Enemy {
    constructor(scene, x, y, spriteKey = 'goomba'){
        this.scene = scene;

        this.sprite = scene.physics.add.sprite(x, y, spriteKey);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(1, 0);
        this.sprite.setVelocityX(-50);
        this.sprite.enemyRef = this;
        this.alive = true;
    }

    update(){
        if(!this.alive) return;
        if(this.sprite.body.left) this.sprite.setVelocityX(50)
        if(this.sprite.body.right) this.sprite.setVelocityX(-50)
    }

    // custom methods
    stomped(){
        if(!this.alive) return;
        this.alive = false;

        //animación de aplastamiento
        this.sprite.setVelocity(0, 0);
        this.sprite.disableBody(true, false);
        this.scene.time.delayedCall(500, () => this.sprite.destroy());
    }

    hitPlayer(){
        if(!this.alive) return;
        
        //daño al jugador
        if(this.scene.player.size === 'big' || this.scene.player.size === 'fire'){
            this.scene.player.shrink();
            } else {
                // Lógica de game over temporal
            console.log('game over');
            
            // Pausar la física (enemigos, jugador, etc.)
            this.scene.physics.pause();
            
            // Mostrar texto en el centro
            const { width, height } = this.scene.sys.game.canvas;
            this.scene.add.text(width / 2, height / 2, 'GAME OVER', {
                fontSize: '32px',
                color: '#ff0000',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        
            // (Opcional) reiniciar después de 2 segundos
            this.scene.time.delayedCall(2000, () => {
                this.scene.scene.start('GameScene');
            });
        }
    }

}