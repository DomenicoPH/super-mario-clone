import Phaser from "phaser";
import Player from "../entities/Player";
import Block from "../entities/Block";
import Goomba from "../enemies/Goomba";
import Koopa, {STATE as KOOPA_STATE} from "../enemies/Koopa";
import { createAnimations } from "../utils/createAnimations";
import AudioManager from "../utils/AudioManager";
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

        this.audio = new AudioManager(this);
        
        //debug..
        //createGridOverlay(this, this.map);
    }

    update(){
        if(this.isGameOver) return;
        
        this.player.update();
        this.enemies.getChildren().forEach(e => e.enemyRef.update());
        this.fireballs?.getChildren().forEach( f => f.fireballRef?.update());
        this.handleEnemySpawning();
        this.cameras.main.scrollY = 0; //fija la camara en Y
        this.checkPlayerFell();
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
        const handleShellBounce = (enemySprite) => {
          const e = enemySprite.enemyRef;
          if (!e || e.type !== 'koopa' || e.state !== KOOPA_STATE.SHELL_MOVING) return;

          const { body } = e.sprite;
          if ((e.directionFactor > 0 && body.blocked.right) || (e.directionFactor < 0 && body.blocked.left)) {
            e.directionFactor *= -1;
            e.sprite.setVelocityX(e.shellSpeed * e.directionFactor);
            e.sprite.x += e.directionFactor * 4; // pequeño empujón para evitar rebote infinito
          }
        };

        this.enemyGroundCollider = this.physics.add.collider(this.enemies, this.groundLayer, handleShellBounce);
        this.enemyBlockCollider = this.physics.add.collider(this.enemies, this.blocksGroup, handleShellBounce);

        // Colisión con otros enemigos
        this.physics.add.collider(this.enemies, this.enemies, (enemyA, enemyB) => {
            const eA = enemyA.enemyRef;
            const eB = enemyB.enemyRef;
                
            if (!eA?.alive || !eB?.alive) return;

            if(eA.state === KOOPA_STATE.SHELL_MOVING && eB.alive){
                eB.hitByShell(eA);
                enemyA.body.checkCollision.none = false;
                enemyB.body.checkCollision.none = true;

                this.time.delayedCall(50, () => {
                    enemyB.body.checkCollision.none = false;
                });
                return; // no hacer rebote normal
            } 
            if(eB.state === KOOPA_STATE.SHELL_MOVING && eA.alive){
                eA.hitByShell(eB);
                enemyB.body.checkCollision.none = false;
                enemyA.body.checkCollision.none = true;
                this.time.delayedCall(50, () => {
                    enemyA.body.checkCollision.none = false;
                });
                return; // no hacer rebote normal
            }
                
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
        this.physics.add.overlap(
            this.player.sprite, 
            this.enemies, 
            (playerSprite, enemySprite) => {
                this.handlePlayerEnemyCollision(playerSprite, enemySprite);
            }
        );

        // Fireballs / enemigos * REVISAR
        this.physics.add.overlap(this.fireballs, this.enemies, (fbSprite, enemySprite) => {
            const fb = fbSprite.fireballRef;
            const enemy = enemySprite.enemyRef;

            enemy?.stomped?.();
            fb?.explodeAndDestroy?.();
        });
    }

    handlePlayerEnemyCollision(playerSprite, enemySprite) {
        const enemy = enemySprite.enemyRef;
        const player = this.player;
        
        if (!enemy || !enemy.alive) return;

        if (enemySprite.tempIgnorePlayer) return;

        const isKoopa = enemy.type === 'koopa' || enemy.isKoopa;
        
        // Calcular dirección de la colisión
        const playerBottom = playerSprite.body.bottom;
        const enemyTop = enemySprite.body.top;
        const verticalOverlap = playerBottom - enemyTop;
        
        // Si el jugador está cayendo y se superpone significativamente por arriba -> STOMP
        if (playerSprite.body.velocity.y > 0 && verticalOverlap > 0 && verticalOverlap < 10) {
            enemy.stomped();
            playerSprite.setVelocityY(-200);
        } 
        // Si no es stomp y el jugador no ignora colisiones laterales
        else if (!player.ignoreEnemySide) {
            if(isKoopa && ['SHELL_STATIONARY', 'REVIVE_WARNING'].includes(enemy.state)){
                const dir = playerSprite.x < enemySprite.x ? 1 : -1;
                enemy.kick(dir);
            } else {
                enemy.hitPlayer(player);
            }
        }
        // Si ignoreEnemySide es true, NO HACER NADA - permitir superposición
    }

    handleEnemySpawning(){
        const playerX = this.player.sprite.x;
        const activationDistance = 200;

        this.enemySpawnData.forEach(data => {
            if(!data.spawned && data.x - playerX < activationDistance){
                data.spawned = true;

                let enemy;
                if(data.type === 'goomba'){
                    enemy = new Goomba(this, data.x, data.y, {type: 'goomba'});
                } else if(data.type === 'koopa'){
                    enemy = new Koopa(this, data.x, data.y, {type: 'koopa'});
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

    checkPlayerFell(){
        if(this.isGameOver) return;
        
        // Usar un valor fijo más alto para testing
        const deathThreshold = 300; // distancia debajo del borde inferior de la camara
        
        if(this.player.sprite.y > deathThreshold){
            console.log('Muerte por caída detectada');
            this.gameOver();
        }
    }

    gameOver(options = {}) {
        if (this.isGameOver) return;
        this.isGameOver = true;

        const { withAnimation = false } = options;

        // Detener enemigos y fireballs inmediatamente
        this.enemies.getChildren().forEach(enemySprite => {
            const e = enemySprite.enemyRef;
            if (e) {
                e.alive = false;
                e.sprite.setVelocity(0, 0);
                e.sprite.anims.pause();
            }
        });

        this.fireballs?.getChildren().forEach(fbSprite => {
            const fb = fbSprite.fireballRef;
            if (fb) {
                fb.sprite.setVelocity(0, 0);
                fb.sprite.anims?.pause();
            }
        });

        // Cambiar sprite del jugador
        this.player.sprite.play('small-die');
        this.player.sprite.setDepth(1000); // Z-index máximo

        if (withAnimation) {
            console.log('Muerte por enemigo - con animación');

            // Pausa breve antes del salto
            this.player.sprite.body.stop();
            this.player.sprite.setVelocity(0, 0);
            this.player.sprite.body.allowGravity = false;
            this.player.sprite.body.checkCollision.none = true;

            this.time.delayedCall(200, () => {
                this.player.sprite.body.allowGravity = true;
                this.player.sprite.setVelocityY(-400);
                this.audio.playDie();

                // Espera hasta que caiga y muestre la pantalla final
                this.time.delayedCall(1000, () => {
                    this.showGameOverScreen();
                });
            });
        } else {
            console.log('Muerte por caída - inmediata');
            this.audio.playDie();
            this.showGameOverScreen();
        }
    }


    showGameOverScreen() {
        this.pauseAll();

        const { width, height } = this.sys.game.canvas;
        this.add.text(width / 2, height / 2, 'GAME OVER', {
            fontSize: '10px',
            color: '#fff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

        this.time.delayedCall(3000, () => {
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
        this.cameras.main.scrollY = 0;
        this.cameras.main.startFollow(this.player.sprite, false, 1, 0);
    };

}
export default GameScene