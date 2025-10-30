export default class UIManager {
    constructor(scene){
        this.scene = scene;
        this.isUIVisible = false;
    }

    showGameOverScreen() {
        this.pauseAll();

        const { width, height } = this.scene.sys.game.canvas;
        this.scene.add.text(width / 2, height / 2, 'GAME OVER', {
            fontSize: '10px',
            color: '#fff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

        this.scene.time.delayedCall(3000, () => {
            this.scene.scene.restart();
        });
    }

    pauseAll(){
        const { player, enemies, fireballs, physics } = this.scene;

        player?.sprite?.anims?.pause();

        enemies?.getChildren().forEach(enemySprite => {
            const e = enemySprite.enemyRef;
            if (e) {
                e.sprite?.anims?.pause();
                e.alive = false;
            }
        });

        fireballs?.getChildren().forEach(fbSprite => {
            fbSprite.fireballRef?.sprite?.anims?.pause();
        });

        this.scene.blocks?.forEach( block => {
            block.sprite?.anims?.pause();
            block.isAnimating = false;
        });

        physics?.world?.pause();
    }
}