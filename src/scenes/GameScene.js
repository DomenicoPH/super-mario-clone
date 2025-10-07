import Phaser from "phaser";
import Player from "../entities/Player";
import Block from "../entities/Block";
import Goomba from "../enemies/Goomba";
import { createAnimations } from "../utils/createAnimations";
import { createGridOverlay } from "../debug/gridOverlay";

class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene')
    }

    create(){
        this.isGameOver = false;
        createAnimations(this);
        this.createBackground();
        this.createMap();
        this.createBlocks();
        this.createPlayer();
        this.createFireballs();
        this.createEnemies();
        
        this.setupWorldBounds();
        this.setupCamera();   
        
        this.bumpables = this.physics.add.group();
        
        //debug..
        //createGridOverlay(this, this.map);
    }

    update(){
        if(this.isGameOver) return;
        
        this.player.update();
        this.enemies.getChildren().forEach(e => e.enemyRef.update());
        this.fireballs?.getChildren().forEach( f => f.fireballRef?.update());
        this.handleEnemySpawning();
    }

    /* --- Custom functions --- */

    createBackground(){
        const sky = this.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(0).setDepth(-1); //cielo de fondo
    };

    createMap(){
        const map = this.make.tilemap({ key: 'level1' });
        const tileset = map.addTilesetImage('world-tileset', 'world-tileset');

        this.map = map;
        this.tileset = tileset;

        this.groundLayer = map.createLayer('ground', tileset); //suelo y superficies
        this.groundLayer.setCollisionByProperty({ collides: true });

        this.decorLayer = map.createLayer('decoration', tileset);
    };

    createBlocks(){
        //const blockTilesLayer = map.createLayer('blockTiles', tileset); //bloques interactivos desde tiled (solo ref.)
        const blockObjects = this.map.getObjectLayer('blocks').objects;
        this.blocks = [];

        blockObjects.forEach(obj => {
            const props = Object.fromEntries(obj.properties.map(p => [p.name,p.value]));
            const type = props.type || obj.type || 'question';
            const content = props.content || null;

            const block = new Block(this, obj.x, obj.y, type, content);
            this.blocks.push(block);
        })
    };

    createPlayer(){
        this.player = new Player(this, 48, 200);
        this.physics.add.collider(this.player.sprite, this.groundLayer);

        this.blocksGroup = this.physics.add.staticGroup();
        this.blocks.forEach(block => {
            block.sprite.blockRef = block;
            this.blocksGroup.add(block.sprite);
        });
        this.physics.add.collider(this.player.sprite, this.blocksGroup, (player, blockSprite) => {
            blockSprite.blockRef.handleCollision(player, blockSprite);
    }   );
    };

    createEnemies() {
        this.enemies = this.physics.add.group();
        this.enemySpawnData = [];

        // Leer todos los objetos desde la capa "enemies"
        const enemyObjects = this.map.getObjectLayer('enemies')?.objects || [];

        enemyObjects.forEach(obj => {
            const type = obj.type || (obj.properties?.find(p => p.name === 'type')?.value);
            this.enemySpawnData.push({
                type,
                x: obj.x,
                y: obj.y,
                spawned: false
            });
        });

        // Colisiones con entorno
        this.physics.add.collider(this.enemies, this.groundLayer);
        this.physics.add.collider(this.enemies, this.blocksGroup);

        // Colisión con otros enemigos
        this.physics.add.collider(this.enemies, this.enemies, (enemyA, enemyB) => {
            const eA = enemyA.enemyRef;
            const eB = enemyB.enemyRef;
                
            if (!eA?.alive || !eB?.alive) return;
                
            // Determinar quién está a la izquierda
            if (enemyA.x < enemyB.x) {
                // A viene de la izquierda, rebota hacia la izquierda
                eA.sprite.setVelocityX(-Math.abs(eA.speed));
                eA.sprite.flipX = false;
            
                // B viene de la derecha, rebota hacia la derecha
                eB.sprite.setVelocityX(Math.abs(eB.speed));
                eB.sprite.flipX = true;
            
                // Separar ligeramente
                enemyA.x -= 2;
                enemyB.x += 2;
            } else {
                // A viene de la derecha
                eA.sprite.setVelocityX(Math.abs(eA.speed));
                eA.sprite.flipX = true;
            
                // B viene de la izquierda
                eB.sprite.setVelocityX(-Math.abs(eB.speed));
                eB.sprite.flipX = false;
            
                // Separar ligeramente
                enemyA.x += 2;
                enemyB.x -= 2;
            }
        });

        // Colisión jugador / enemigos
        this.physics.add.collider(
            this.player.sprite, 
            this.enemies, 
            (playerSprite, enemySprite) => {
            const enemy = enemySprite.enemyRef;
            const playerBody = playerSprite.body;

            if (playerBody.touching.down && enemySprite.body.touching.up) {
                enemy.stomped();
                playerSprite.setVelocityY(-200);
            } else if(!this.player.ignoreEnemySide){
                enemy.hitPlayer(this.player);
            }
        });

        // Fireballs / enemigos * REVISAR
        this.physics.add.overlap(this.fireballs, this.enemies, (fbSprite, enemySprite) => {
            const fb = fbSprite.fireballRef;
            const enemy = enemySprite.enemyRef;

            enemy?.stomped?.();
            fb?.explodeAndDestroy?.();
        });
    }

    handleEnemySpawning(){
        const playerX = this.player.sprite.x;
        const activationDistance = 200;

        this.enemySpawnData.forEach(data => {
            if(!data.spawned && data.x - playerX < activationDistance){
                data.spawned = true;

                let enemy;
                if(data.type === 'goomba'){
                    enemy = new Goomba(this, data.x, data.y);
                }

                if(enemy){
                    this.enemies.add(enemy.sprite);
                }
            }
        })
    }

    createFireballs() {
      this.fireballs = this.physics.add.group();

      // 1. Collider con el suelo
      this.physics.add.collider(this.fireballs, this.groundLayer);

      // 2. Collider con los bloques
      this.physics.add.collider(this.fireballs, this.blocksGroup);
    }

    gameOver(){
        if(this.isGameOver) return;
        this.isGameOver = true;

        this.pauseAll();

        const { width, height } = this.sys.game.canvas;
        this.add.text(width / 2, height / 2, 'GAME OVER', {
            fontSize: '10px',
            color: '#a71414ff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

        this.time.delayedCall(2000, () => {
            this.scene.restart();
        });
    }

    pauseAll(){
        this.player.sprite.anims.pause();

        this.enemies.getChildren().forEach(enemySprite => {
            enemySprite.enemyRef?.sprite?.anims.pause();
            enemySprite.enemyRef.alive = false;
        });

        this.fireballs?.getChildren().forEach(fbSprite => {
            fbSprite.fireballRef?.sprite?.anims.pause();
        });

        this.blocks?.forEach( block => {
            block.sprite.anims?.pause();
            block.isAnimating = false;
        });

        this.physics.world.pause();
    }

    setupWorldBounds(){
        const worldBounds = [true, true, false, true]
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, ...worldBounds);
    }

    setupCamera(){
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setFollowOffset(0, 80);
    };

}
export default GameScene