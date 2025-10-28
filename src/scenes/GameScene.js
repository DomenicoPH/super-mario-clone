import Phaser from "phaser";
import Player from "../entities/Player";
import { createAnimations } from "../utils/createAnimations";
import { createGridOverlay } from "../debug/gridOverlay";
import AudioManager from "../utils/AudioManager";
import MapManager from "../managers/MapManager";
import BlockManager from "../managers/BlockManager";
import EnemyManager from "../managers/EnemyManager";
import PlayerManager from "../managers/PlayerManager";

class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene')
    }

    create(){
        this.isGameOver = false;
        createAnimations(this);
        this.createBackground();
        
        this.mapManager = new MapManager(this);
        this.mapManager.createMap();

        this.blockManager = new BlockManager(this, this.mapManager);
        this.blockManager.createBlocks();

        this.playerManager = new PlayerManager(this, this.mapManager, this.blockManager);
        this.playerManager.createPlayer();
        this.player = this.playerManager.getPlayer();

        this.createFireballs();
        
        this.enemyManager = new EnemyManager(this, this.mapManager, this.blockManager, this.player, this.fireballs);
        this.enemyManager.createEnemies();
        this.enemies = this.enemyManager.getEnemies();
        this.enemySpawnData = this.enemyManager.getEnemySpawnData();
        
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
        
        this.enemyManager.update();

        this.fireballs?.getChildren().forEach( f => f.fireballRef?.update());
        this.cameras.main.scrollY = 0; //fija la camara en Y
        this.checkPlayerFell();
    }

    /* --- Custom functions --- */

    createBackground(){
        const sky = this.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(0).setDepth(-1); //cielo de fondo
    };

    createFireballs() {
        this.fireballs = this.physics.add.group();

        // 1. Collider con el suelo
        this.physics.add.collider(this.fireballs, this.mapManager.groundLayer);

        // 2. Collider con los bloques
        this.physics.add.collider(this.fireballs, this.blockManager.blocksGroup);
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
        this.physics.world.setBounds(0, 0, this.mapManager.map.widthInPixels, this.mapManager.map.heightInPixels, ...worldBounds);
    }

    setupCamera(){
        this.cameras.main.setBounds(0, 0, this.mapManager.map.widthInPixels, this.mapManager.map.heightInPixels);
        this.cameras.main.scrollY = 0;
        this.cameras.main.startFollow(this.player.sprite, false, 1, 0);
    };

}
export default GameScene