import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
    constructor(){
        super('PreloadScene')
    }

    preload(){
        this.load.image('stage1', '/assets/tilemaps/rough/stage_1-1.png');
        this.load.tilemapTiledJSON('level1', '/assets/tilemaps/level1.json');
    }

    create(){
        this.scene.start('GameScene');
    }
}
export default PreloadScene;