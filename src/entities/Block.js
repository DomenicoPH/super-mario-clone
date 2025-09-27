export default class Block {
    constructor(scene, x, y, type = 'question', content = null){
        this.scene = scene;
        this.type = type;
        this.content = content;
        this.originalY = y;
        this.isAnimating = false;
        this.used = false;

        this.sprite = scene.physics.add.staticSprite(x, y, `block-${type}`);
        this.sprite.setOrigin(0);
        this.sprite.refreshBody();

        if (type === 'question') {
          this.sprite.play('block-question-idle');
        }

    }

    bump(){
        if(this.isAnimating || this.used) return;
        
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

                if(this.type === 'question'){
                    this.sprite.setTexture('block-question-empty');
                    this.sprite.anims.stop();
                    this.used = true;
                    this.releaseContent();
                }
            }
        })
        
    }

    releaseContent(){
      if(!this.content) return;
      switch(this.content){
        case 'coin':
          this.spawnCoin();
          break;
        case 'mushroom':
          this.spawnMushroom();
          break;
        default:
          console.log(`contenido desconocido: ${this.content}`)
      }
    };

    spawnCoin(){
      const spawnX = this.sprite.x + this.sprite.width / 2;
      const spawnY = this.sprite.y;

      const coin = this.scene.add.sprite(spawnX, spawnY, 'coin-spin');
      coin.play('coin-spin');

      this.scene.tweens.add({
        targets: coin,
        y: coin.y - 32,
        duration: 300,
        onComplete: () => coin.destroy()
      });

      /* update del score, pendiente...
      this.scene.registry.values.score += 100;
      this.scene.events.emit('updateScore');
      */
    };

    spawnMushroom(){
      const spawnX = this.sprite.x + this.sprite.width / 2;
      const spawnY = this.sprite.y;

      const mushroom = this.scene.physics.add.sprite(spawnX, spawnY, 'mushroom');
      mushroom.setCollideWorldBounds(true);
      mushroom.setImmovable(true);
      mushroom.body.allowGravity = false;

      this.scene.tweens.add({
        targets: mushroom,
        y: spawnY - mushroom.height,
        duration: 400,
        ease: 'Power1',
        onComplete: () => {
          mushroom.body.allowGravity = true;
          mushroom.setImmovable(false);
          mushroom.setBounce(1, 0);
          mushroom.setVelocityX(50);
        }
      });

      //colisiones
      this.scene.physics.add.collider(mushroom, this.scene.groundLayer);
      this.scene.blocks.forEach( block => {
        this.scene.physics.add.collider(mushroom, block.sprite);
      })

      this.scene.physics.add.overlap(this.scene.player.sprite, mushroom, () => {
        mushroom.destroy();
        console.log('power-up')
        // Logica para hacer crecer a Mario
      })
    };

    handleCollision(player, blockSprite) {
      if (player.body.touching.up && blockSprite.body.touching.down) {
        this.bump();

        // - generar un power-up
        // - cambiar el sprite del bloque a "vacío"
      }
    }

}