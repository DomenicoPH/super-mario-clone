import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
    constructor(){
        super('PreloadScene')
    }

    preload(){
        this.load.image('sky', '/assets/tilemaps/sky.png');
        this.load.image('world-tileset', '/assets/tilemaps/world-tileset.png');
        this.load.tilemapTiledJSON('level1', '/assets/tilemaps/level1.json');

        this.load.spritesheet('mario-small', '/assets/sprites/mario-small.png', { frameWidth: 16, frameHeight: 16 });
    }

    create(){
        this.scene.start('GameScene');
    }
}
export default PreloadScene;