import AnimationHelper from "../helpers/AnimationHelper";

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
        this.sprite.setDepth(10);

        if (type === 'question') {
          this.sprite.play('block-question-idle');
        }
    };

    bump(){
        if(this.isAnimating || this.used) return;
        this.isAnimating = true;

        AnimationHelper.bump(this.scene, this.sprite, {
          offsetY: 8,
          duration: 100,
          onStart: () => {
            this.bumpObjectsAbove({ force: -300, tolerance: 3, ignorePlayer: true });
          },
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
        });
    };

    bumpObjectsAbove({ force = -200, tolerance = 3, ignorePlayer = true } = {}){
      // Bounds del bloque (usa getBounds para ser robusto con cualquier origin)
      const blockBounds = this.sprite.getBounds();
      const blockTop = blockBounds.top;
      const blockLeft = blockBounds.left;
      const blockRight = blockBounds.right;

      // Recorremos cuerpos del mundo
      this.scene.bumpables.getChildren().forEach(obj => {
        if (!obj.body || !obj.getBounds) return;
        if (ignorePlayer && this.scene.player && obj === this.scene.player.sprite) return;
            
        const objBounds = obj.getBounds();
        if (objBounds.right <= blockLeft || objBounds.left >= blockRight) return;
            
        const objBaseY = objBounds.bottom;
        if (Math.abs(objBaseY - blockTop) <= tolerance) {
          if (obj.body.allowGravity && !obj.body.immovable) {
            obj.body.setVelocityY(force);
          }
        }
      });

    }

    releaseContent(){
      if(!this.content) return;
      switch(this.content){
        case 'coin':
          this.spawnCoin();
          break;
        case 'mushroom':
          if(this.scene.player.size === 'big'){
            this.spawnFlower();
          } else {
            this.spawnMushroom();
          }
          break;
        case 'flower':
          this.spawnFlower();
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

      AnimationHelper.coinPop(this.scene, coin);

      /* update del score, pendiente...
      this.scene.registry.values.score += 100;
      this.scene.events.emit('updateScore');
      */
    };

    spawnMushroom(){
      const spawnX = this.sprite.x + this.sprite.width / 2;
      const spawnY = this.sprite.y;

      const mushroom = this.scene.physics.add.sprite(spawnX, spawnY, 'mushroom');
      this.scene.bumpables.add(mushroom);

      mushroom.setOrigin(0.5, 0);
      mushroom.setCollideWorldBounds(true);
      mushroom.setImmovable(true);
      mushroom.body.allowGravity = false;

      AnimationHelper.mushroomRise(this.scene, mushroom, {
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
        this.scene.player.grow();
      })
    };

    spawnFlower() {
      const spawnX = this.sprite.x + this.sprite.width / 2;
      const spawnY = this.sprite.y;

      const flower = this.scene.physics.add.staticSprite(spawnX, spawnY, 'flower');
      flower.setOrigin(0.5, 0);

      const riseDistance = flower.height;

      AnimationHelper.mushroomRise(this.scene, flower, {
        distance: riseDistance,
        onComplete: () => {
          // La flor queda en su sitio, no se mueve ni tiene gravedad
        }
      });
    
      // Mario obtiene la flor al tocarla
      this.scene.physics.add.overlap(this.scene.player.sprite, flower, () => {
        flower.destroy();
        console.log('power-up: flower');
        this.scene.player.getFlower?.(); // más adelante implementar esto
      });
    }

    handleCollision(player, blockSprite) {
      if (player.body.touching.up && blockSprite.body.touching.down) {
        this.bump();

        // - generar un power-up
        // - cambiar el sprite del bloque a "vacío"
      }
    };

}