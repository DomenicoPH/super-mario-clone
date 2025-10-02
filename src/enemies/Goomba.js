import Enemy from "../entities/Enemy";

export default class Goomba extends Enemy {
    constructor(scene, x, y){
        super(scene, x, y, 'goomba');

        // animación Goomba walk
        this.scene.anims.create({
            key: 'goomba-walk',
            frames: this.scene.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });

        this.sprite.play('goomba-walk');
    }
}