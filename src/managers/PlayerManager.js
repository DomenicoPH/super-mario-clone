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

    handleGameOver(withAnimation) {
        const player = this.player;
        if (!player) return;
        
        player.sprite.play('small-die');
        player.sprite.setDepth(1000);
        
        if (withAnimation) {
            player.sprite.body.stop();
            player.sprite.setVelocity(0, 0);
            player.sprite.body.allowGravity = false;
            player.sprite.body.checkCollision.none = true;
        
            this.scene.time.delayedCall(200, () => {
                player.sprite.body.allowGravity = true;
                player.sprite.setVelocityY(-400);
                this.scene.audio.playDie();
            
                this.scene.time.delayedCall(1000, () => {
                    this.scene.uiManager.showGameOverScreen();
                });
            });
        } else {
            this.scene.audio.playDie();
            this.scene.uiManager.showGameOverScreen();
        }
    }

}