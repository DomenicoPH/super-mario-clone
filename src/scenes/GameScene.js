import Phaser from "phaser";

class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene')
    }

    create(){
        this.add.image(this.scale.width/2 , this.scale.height/2, 'stage1')
            .setOrigin(0.5, 0.5)
            .setScale(2)
    }
}
export default GameScene