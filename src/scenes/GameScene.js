import Phaser from "phaser";
import Player from "../entities/Player";
import { createAnimations } from "../utils/createAnimations";
import { createGridOverlay } from "../debug/gridOverlay";
import AudioManager from "../utils/AudioManager";
import UIManager from "../managers/UIManager";
import MapManager from "../managers/MapManager";
import BlockManager from "../managers/BlockManager";
import EnemyManager from "../managers/EnemyManager";
import PlayerManager from "../managers/PlayerManager";
import FireballManager from "../managers/FireballManager";

class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene')
    }

    create(){
        this.isGameOver = false;
        createAnimations(this);

        //UI
        this.uiManager = new UIManager(this);
        
        //Map
        this.mapManager = new MapManager(this);
        this.mapManager.createBackground();
        this.mapManager.createMap();

        //Blocks
        this.blockManager = new BlockManager(this, this.mapManager);
        this.blockManager.createBlocks();

        //Player
        this.playerManager = new PlayerManager(this, this.mapManager, this.blockManager);
        this.playerManager.createPlayer();
        this.player = this.playerManager.getPlayer();

        //Fireballs
        this.fireballManager = new FireballManager(this, this.mapManager, this.blockManager);
        this.fireballManager.createFireballs();
        this.fireballs = this.fireballManager.getFireballs();
        
        //Enemies
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
        this.playerManager.update(); //actualiza checkPlayerFell() desde PlayerManager
    }

    /* --- Custom functions --- */

    

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
                    this.uiManager.showGameOverScreen();
                });
            });
        } else {
            console.log('Muerte por caída - inmediata');
            this.audio.playDie();
            this.uiManager.showGameOverScreen();
        }
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