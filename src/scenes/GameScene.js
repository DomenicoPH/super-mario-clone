import Phaser from "phaser";

const speed = 160;
const jumpForce = -400;


class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene')
    }

    create(){
        const map = this.make.tilemap({ key: 'level1' });
        const tileset = map.addTilesetImage('world-tileset', 'world-tileset');
        const groundLayer = map.createLayer('ground', tileset);
        this.cursors = this.input.keyboard.createCursorKeys();

        groundLayer.setCollisionByProperty({ collides: true });

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'mario-small', frame: 0 }],
            frameRate: 1
        });
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('mario-small', { start: 1, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: [{ key: 'mario-small', frame: 5 }],
            frameRate: 1
        });

        this.player = this.physics.add.sprite(100, 100, 'mario-small');
        this.player.play('idle');

        this.physics.add.collider(this.player, groundLayer);

    }

    update(){
        const player = this.player;
        const {up, down, left, right, space} = this.cursors;

        if(left.isDown){
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
        } else if(right.isDown){
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        if(space.isDown && player.body.onFloor()){
            player.setVelocityY(jumpForce);
        }

        //Anims
        if(!player.body.onFloor()){
            player.play('jump', true);
        } else if (player.body.velocity.x !== 0){
            player.play('walk', true);
        } else {
            this.player.play('idle', true);
        }
    }
}
export default GameScene