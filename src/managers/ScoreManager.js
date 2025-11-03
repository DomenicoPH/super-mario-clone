export default class ScoreManager {
    constructor(scene){
        this.scene = scene;

        this.score = 0;
        this.coins = 0;
        this.lives = 3;

        this.coinCheckpoint = 100;
    }

    // Coins & Score
    addScore(points){
        this.score += points;
        this.scene.events.emit('updateScore', this.score);
    }

    getScore(){
        return this.score;
    }

    addCoin(){
        this.coins++;
        this.addScore(100);
        this.scene.events.emit('updateCoins', this.coins);

        if(this.coins >= this.coinCheckpoint){
            this.addLife();
            this.coinCheckpoint += 100;
        }
    }

    getCoins(){
        return this.coins;
    }

    // Vidas
    addLife(){
        this.lives++;
        this.scene.events.emit('updateLives', this.lives);
        console.log(`Vida extra. Tienes ${this.lives} vidas.`);
    }

    loseLife(){
        this.lives--;
        this.scene.events.emit('updateLives', this.lives);

        if(this.lives <= 0){
            return false;
        }
        return true;
    }

    getLives(){
        return this.lives;
    }

    // Eventos
    enemyDefeated(type = 'stomp'){
        const points = {
            'stomp': 100,
            'shell': 200,
            'fireball': 200
        };
        this.addScore(points[type] || 100);
    }

    blockBroken(){
        this.addScore(50);
    }

    reset(){
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.coinCheckpoint = 100;

        this.scene.events.emit('updateScore', this.score);
        this.scene.events.emit('updateCoins', this.coins);
        this.scene.events.emit('updateLives', this.lives);
    }
}