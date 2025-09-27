export default class Block {
    constructor(scene, x, y, type = 'question', content = null){
        this.scene = scene;
        this.type = type;
        this.content = content;
        this.originalY = y;
        this.isAnimating = false;

        this.sprite = scene.physics.add.staticSprite(x, y, `block-${type}`);
        this.sprite.setOrigin(0);
        this.sprite.setSize(16, 16);
        this.sprite.body.setOffset(8, 8);

        if (type === 'question') {
          this.sprite.play('block-question-idle');
        }

    }

    bump(){
        if(this.isAnimating) return;
        
        this.isAnimating = true;

        this.scene.tweens.add({
            targets: this.sprite,
            y: this.originalY - 8,
            duration: 100,
            yoyo: true,
            ease: 'Power1',
            onComplete: () => {
                this.sprite.y = this.originalY;
                this.isAnimating = false;
            }
        })
        
    }

    handleCollision(player, blockSprite) {
      if (player.body.touching.up && blockSprite.body.touching.down) {
        this.bump();

        // - generar un power-up
        // - cambiar el sprite del bloque a "vacío"
      }
    }

}