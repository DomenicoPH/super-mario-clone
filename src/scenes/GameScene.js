import Phaser from "phaser";

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
            key: 'walk',
            frames: this.anims.generateFrameNumbers('mario-small', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        })
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'mario-small', frame: 0 }],
            frameRate: 1
        });

        this.player = this.physics.add.sprite(100, 100, 'mario-small');
        this.player.setScale(2);
        this.player.play('idle');

        this.physics.add.collider(this.player, groundLayer);

    }

    update(){
        const speed = 160;

        if(this.cursors.left.isDown){
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            this.player.play('walk', true);
        } else if(this.cursors.right.isDown){
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            this.player.play('walk', true);
        } else {
            this.player.setVelocityX(0);
            this.player.play('idle', true);
        }
    }
}
export default GameScene