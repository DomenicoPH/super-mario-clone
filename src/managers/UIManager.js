export default class UIManager {
    constructor(scene){
        this.scene = scene;
        this.isUIVisible = false;
        this.createHUD();
    }

    // HUD
    createHUD(){
        this.scoreText = this.scene.add.text(16, 8, 'SCORE\n000000', {
            fontSize: '8px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(1000);

        this.coinsText = this.scene.add.text(80, 8, 'COINS\n x00', {
            fontSize: '8px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(1000);

        this.livesText = this.scene.add.text(140, 8, 'LIVES\n x03', {
            fontSize: '8px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(1000);

        this.worldText = this.scene.add.text(200, 8, 'WORLD\n 1-1', {
            fontSize: '8px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(1000);

        this.scene.events.on('updateScore', this.updateScore, this);
        this.scene.events.on('updateCoins', this.updateCoins, this);
        this.scene.events.on('updateLives', this.updateLives, this);
    }

    updateScore(score){
        this.scoreText.setText('SCORE\n' + score.toString().padStart(6, '0'));
    }

    updateCoins(coins){
        this.coinsText.setText('COINS\n x' + coins.toString().padStart(2, '0'))
    }

    updateLives(lives){
        this.livesText.setText('LIVES\n x' + lives.toString().padStart(2, '0'))
    }

    // Game Over
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

    handleGameOver(withAnimation) {
        if (!withAnimation){
            this.pauseAll();
            this.showGameOverScreen();
        }
    }

}