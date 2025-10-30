import Player from "../entities/Player";

export default class PlayerManager {
    constructor(scene, mapManager, blockManager){
        this.scene = scene;
        this.mapManager = mapManager;
        this.blockManager = blockManager;
        this.player = null;
    }

    createPlayer(){
        this.player = new Player(this.scene, 48, 200);
        this.scene.physics.add.collider(this.player.sprite, this.mapManager.groundLayer);

        this.blocksGroup = this.blockManager.blocksGroup;
        this.blockManager.blocks.forEach(block => {
            block.sprite.blockRef = block;
            this.blocksGroup.add(block.sprite);
        });
        this.scene.physics.add.collider(this.player.sprite, this.blocksGroup, (player, blockSprite) => {
            blockSprite.blockRef.handleCollision(player, blockSprite);
        });
    };

    getPlayer() {
      return this.player;
    };

    update(){
        if(!this.player || this.scene.isGameOver) return;
        this.player.update();
        this.checkPlayerFell();
    }

    checkPlayerFell(){
        if(this.scene.isGameOver) return;
        
        // Usar un valor fijo más alto para testing
        const deathThreshold = 300; // distancia debajo del borde inferior de la camara
        
        if(this.player.sprite.y > deathThreshold){
            console.log('Muerte por caída detectada');
            this.scene.gameOver();
        }
    };
}