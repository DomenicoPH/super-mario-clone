import Phaser from "phaser";
import Player from "../entities/Player";
import Block from "../entities/Block";
import Goomba from "../enemies/Goomba";
import { createGridOverlay } from "../debug/gridOverlay";

class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene')
    }

    create(){
        this.createBackground();
        this.createMap();
        this.createAnimations();
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
        this.player.update();
        this.enemies.getChildren().forEach(e => e.enemyRef.update());
        this.fireballs?.getChildren().forEach( f => f.fireballRef?.update());
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

    createAnimations(){
        this.anims.create({
            key: 'block-question-idle',
            frames: this.anims.generateFrameNumbers('block-question', { start: 0, end: 2 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'coin-spin',
            frames: this.anims.generateFrameNumbers('coin', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'flower-idle',
            frames: this.anims.generateFrameNumbers('flower', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        })

        this.anims.create({
            key: 'fireball-spin',
            frames: this.anims.generateFrameNumbers('fireball', { start: 0, end: 3 }),
            frameRate: 12,
            repeat: -1
        })

        this.anims.create({
            key: 'fireball-explode',
            frames: this.anims.generateFrameNumbers('fireball-explode', { start: 0, end: 2 }),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true,
        })
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

    createEnemies(){
        this.enemies = this.physics.add.group();

        const goomba1 = new Goomba(this, 400, 200);
        this.enemies.add(goomba1.sprite);

        this.physics.add.collider(this.enemies, this.groundLayer);
        this.physics.add.collider(this.enemies, this.blocksGroup);
        this.physics.add.collider(this.player.sprite, this.enemies, (player, enemySprite) => {
            const enemy = enemySprite.enemyRef;
            if(player.body.touching.down && enemySprite.body.touching.up){
                enemy.stomped();
                player.setVelocityY(-200);
            } else {
                enemy.hitPlayer(this.player);
            }
        })

        //fireballs
        this.physics.add.overlap(this.fireballs, this.enemies, (fbSprite, enemySprite) => {
            const fb = fbSprite.fireballRef;
            const enemy = enemySprite.enemyRef;
            if(enemy && enemy.stomped){
                enemy.stomped();
            } else {
                enemySprite.destroy?.();
            }
            fb?.destroy();
        })
    }

    createFireballs() {
      this.fireballs = this.physics.add.group();

      // 1. Collider con el suelo
      this.physics.add.collider(this.fireballs, this.groundLayer);

      // 2. Collider con los bloques
      this.physics.add.collider(this.fireballs, this.blocksGroup);
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