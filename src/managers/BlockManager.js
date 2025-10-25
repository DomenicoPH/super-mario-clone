import Phaser from "phaser";
import Block from "../entities/Block";


export default class BlockManager {
    constructor(scene, mapManager){
        this.scene = scene;
        this.mapManager = mapManager;
        this.blocks = [];
        this.blocksGroup = this.scene.physics.add.staticGroup();
    }

    createBlocks(){
        //const blockTilesLayer = map.createLayer('blockTiles', tileset); //bloques interactivos desde tiled (solo ref.)
        const blockObjects = this.mapManager.map.getObjectLayer('blocks').objects;

        blockObjects.forEach(obj => {
            const props = Object.fromEntries(obj.properties.map(p => [p.name, p.value]));
            const type = props.type || obj.type || 'question';
            const content = props.content || null;

            const block = new Block(this.scene, obj.x, obj.y, type, content);
            this.blocks.push(block);
        })
    };
}