import Phaser from "phaser";
import Player from "../entities/Player";
import Block from "../entities/Block";

class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene')
    }

    create(){
        this.createBackground();
        this.createMap();
        this.createAnimations();
        this.createBlocks();
        this.createPlayer();
        this.setupCamera();   
    }

    update(){
        this.player.update();
    }

    /* --- Custom functions --- */

    createBackground(){
        const sky = this.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(0).setDepth(-1); //cielo de fondo
    };

    createMap(){
        const map = this.make.tilemap({ key: 'level1' });
        const tileset = map.addTilesetImage('world-tileset', 'world-tileset');

        this.map = map;
        this.tileset = tileset;

        this.groundLayer = map.createLayer('ground', tileset); //suelo y superficies
        this.groundLayer.setCollisionByProperty({ collides: true });

        this.decorLayer = map.createLayer('decoration', tileset);
    };

    createAnimations(){
        this.anims.create({
          key: 'block-question-idle',
          frames: this.anims.generateFrameNumbers('block-question', { start: 0, end: 2 }),
          frameRate: 4,
          repeat: -1
        });
    };

    createBlocks(){
        //const blockTilesLayer = map.createLayer('blockTiles', tileset); //bloques interactivos desde tiled (solo ref.)
        const blockObjects = this.map.getObjectLayer('blocks').objects;
        this.blocks = [];

        blockObjects.forEach(obj => {
            const props = Object.fromEntries(obj.properties.map(p => [p.name,p.value]));
            const type = props.type || obj.type || 'question';
            const content = props.content || null;

            const block = new Block(this, obj.x, obj.y - obj.height, type, content);
            this.blocks.push(block);
        })
    };

    createPlayer(){
        this.player = new Player(this, 48, 200);
        this.physics.add.collider(this.player, this.groundLayer);
        this.blocks.forEach( block => {
            this.physics.add.collider(this.player.sprite, block.sprite);
        })
    };

    setupCamera(){
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setFollowOffset(0, 80);
    };

}
export default GameScene