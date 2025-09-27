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

        this.load.image('block-brick', '/assets/sprites/brick-block-sprite.png');
        this.load.spritesheet('block-question', '/assets/sprites/question-block-spritesheet.png', { frameWidth:16, frameHeight:16 });
        this.load.image('block-question-empty', '/assets/sprites/question-block-empty.png');

        this.load.spritesheet('coin', '/assets/sprites/coin-spin.png', {frameWidth: 8, frameHeight: 16});
        this.load.image('mushroom', '/assets/sprites/mushroom-grow.png');
    }

    create(){
        this.scene.start('GameScene');
    }
}
export default PreloadScene;