import Phaser from "phaser";
import Player from "../entities/Player";

class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene')
    }

    create(){
        const sky = this.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(0).setDepth(-1);
        const map = this.make.tilemap({ key: 'level1' });
        const tileset = map.addTilesetImage('world-tileset', 'world-tileset');
        const groundLayer = map.createLayer('ground', tileset);
        groundLayer.setCollisionByProperty({ collides: true });
        const decorLayer = map.createLayer('decoration', tileset);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.player = new Player(this, 48, 200);
        this.physics.add.collider(this.player, groundLayer);

        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setFollowOffset(0, 80);
    }

    update(){
        this.player.update();
    }
}
export default GameScene