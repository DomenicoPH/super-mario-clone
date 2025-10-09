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

        if(this.type === 'brick'){
          //sound:
            this.scene.audio.playBump();
        }

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
          if(this.scene.player.size === 'big' || this.scene.player.size === 'fire'){
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
      //sound:
      this.scene.audio.playCoin();

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

      //sound:
      this.scene.audio.playPowerUpAppears();

      //colisiones
      this.scene.physics.add.collider(mushroom, this.scene.groundLayer);
      this.scene.blocks.forEach( block => {
        this.scene.physics.add.collider(mushroom, block.sprite);
      })

      this.scene.physics.add.overlap(this.scene.player.sprite, mushroom, () => {
        //sound:
        this.scene.audio.playPowerUp();
        mushroom.destroy();
        this.scene.player.grow();
          console.log('power-up: mushroom')
      })
    };

    spawnFlower() {
      const spawnX = this.sprite.x + this.sprite.width / 2;
      const spawnY = this.sprite.y;

      const flower = this.scene.physics.add.staticSprite(spawnX, spawnY, 'flower');
      flower.setOrigin(0.5, 0);
      flower.play('flower-idle');

      const riseDistance = flower.height;

      AnimationHelper.mushroomRise(this.scene, flower, {
        distance: riseDistance,
        onComplete: () => {}
      });

      //sound:
      this.scene.audio.playPowerUpAppears();
    
      this.scene.physics.add.overlap(this.scene.player.sprite, flower, () => {
        //sound:
        this.scene.audio.playPowerUp();
        flower.destroy();
        if(this.scene.player.size === 'small'){
          this.scene.player.grow();
        } else {
          this.scene.player.powerUpFire();
        }
        this.scene.player.getFlower?.();
          console.log('power-up: flower');
      });
    }

    breakBlock() {
        if (this.isAnimating || this.used) return;
        this.isAnimating = true;

        const pieces = [];
        const blockX = this.sprite.x + this.sprite.width / 2;
        const blockY = this.sprite.y + this.sprite.height / 2;

        // Crear 4 pedazos usando frames 0,1,2,3 del spritesheet broken-block
        for (let i = 0; i < 4; i++) {
            const piece = this.scene.physics.add.sprite(blockX, blockY, 'broken-block', i);
            piece.setOrigin(0.5);
            piece.setDepth(10);
            piece.body.allowGravity = true;
            piece.setBounce(0.3);
        
            pieces.push(piece);
        }
      
        // Animación en arco
        pieces[0].setVelocity(-100, -200); // arriba-izquierda
        pieces[1].setVelocity(100, -200);  // arriba-derecha
        pieces[2].setVelocity(-50, -150);  // abajo-izquierda
        pieces[3].setVelocity(50, -150);   // abajo-derecha

        //sound:
        this.scene.audio.playBreak();
      
        // Destruir pedazos después de 1.5 segundos
        this.scene.time.delayedCall(1500, () => {
            pieces.forEach(p => p.destroy());
        });
      
        // Destruir el bloque original
        this.sprite.destroy();
        this.isAnimating = false;
        this.used = true;
    }

    handleCollision(player, blockSprite) {
      if (!player?.body || !blockSprite?.body) return;

      if (player.body.touching.up && blockSprite.body.touching.down) {
        const playerSize = this.scene.player?.size;
        if (this.type === 'brick' && (playerSize === 'big' || playerSize === 'fire')) {
          this.breakBlock();
        } else {
          this.bump();
        }
      }
    }

}