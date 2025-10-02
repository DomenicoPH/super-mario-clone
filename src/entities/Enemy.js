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
        if(player.size === 'big' || player.size === 'fire'){
            player.shrink();
        } else {
            console.log('game over');
        }
    }

}