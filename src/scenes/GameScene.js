import Phaser from "phaser";
import Player from "../entities/Player";
import { createAnimations } from "../utils/createAnimations";
import { createGridOverlay } from "../debug/gridOverlay";
import AudioManager from "../utils/AudioManager";
import CameraManager from "../managers/CameraManager";
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
        
        this.bumpables = this.physics.add.group();
        this.audio = new AudioManager(this);
        
        //Camera
        this.cameraManager = new CameraManager(this, this.mapManager, this.player);
        this.cameraManager.setupWorldBounds()
        this.cameraManager.setupCamera();
        
        //debug..
        //createGridOverlay(this, this.map);
    }

    update(){
        if(this.isGameOver) return;
        this.player.update();
        this.cameraManager.update();
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

        this.enemyManager.handleGameOver();
        this.fireballManager.handleGameOver();
        this.playerManager.handleGameOver(withAnimation);
        this.uiManager.handleGameOver(withAnimation);
    }

}
export default GameScene