import Phaser from "phaser";
import Player from "../entities/Player";

class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene')
    }

    create(){
        const map = this.make.tilemap({ key: 'level1' });
        const tileset = map.addTilesetImage('world-tileset', 'world-tileset');
        const groundLayer = map.createLayer('ground', tileset);
        groundLayer.setCollisionByProperty({ collides: true });

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.player = new Player(this, 100, 100);
        this.physics.add.collider(this.player, groundLayer);
        this.cameras.main.startFollow(this.player.sprite);
    }

    update(){
        this.player.update();
    }
}
export default GameScene