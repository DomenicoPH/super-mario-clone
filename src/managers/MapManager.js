import Phaser from "phaser";

export default class MapManager {
    constructor(scene){
        this.scene = scene;
    }

    createMap(){
        const map = this.scene.make.tilemap({ key: 'level1' });
        const tileset = map.addTilesetImage('world-tileset', 'world-tileset');

        this.map = map;
        this.tileset = tileset;

        this.groundLayer = map.createLayer('ground', tileset); //suelo y superficies
        this.groundLayer.setCollisionByProperty({ collides: true });

        this.decorLayer = map.createLayer('decoration', tileset);
    };

    createBackground(){
        const sky = this.scene.add
            .image(0, 0, 'sky')
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(-1); //cielo de fondo
    };
}