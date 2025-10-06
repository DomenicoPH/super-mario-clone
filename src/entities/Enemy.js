import Phaser from "phaser";
import Player from "./Player";

export default class Enemy {
    constructor(scene, x, y, spriteKey = 'goomba'){
        this.scene = scene;

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
        this.sprite.setFrame(2);
        this.sprite.disableBody(true, false);

        this.sprite.body.setSize(this.sprite.body.width, this.sprite.body.height / 2);
        this.sprite.body.position.y += this.sprite.body.height / 2;
        
        this.scene.time.delayedCall(500, () => this.sprite.destroy());
    }

    hitPlayer(){
        if(!this.alive) return;

        const player = this.scene.player;
        
        if(player.size === 'big' || player.size === 'fire'){
            player.shrink();
        } else {
            this.scene.gameOver();
        }
    }

}