import Phaser from "phaser";

const maxSpeed = 160;
const acceleration = 300;
const drag = 200;
const jumpForce = -400;

export default class Player {
    constructor(scene, x, y){
        this.scene = scene;
        this.size = 'small';

        this.sprite = scene.physics.add.sprite(x, y, 'mario-small').setSize(8, 16);

        this.sprite.setCollideWorldBounds(true);

        this.body.setMaxVelocity(maxSpeed, 500);
        this.body.setDragX(drag);

        this.createAnimations();
        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    createAnimations(){
        const anims = this.scene.anims;

        // Mario SMALL
        anims.create({ key: 'small-idle', frames: [{ key: 'mario-small', frame: 0}], frameRate: 1});
        anims.create({ key: 'small-walk', frames: anims.generateFrameNumbers('mario-small', {start: 1, end: 2}), frameRate: 8, repeat: -1 });
        anims.create({ key: 'small-jump', frames: [{ key: 'mario-small', frame: 5}], frameRate: 1});

        // Mario BIG
        anims.create({ key: 'big-idle', frames: [{ key: 'mario-big', frame: 0}], frameRate: 1});
        anims.create({ key: 'big-walk', frames: anims.generateFrameNumbers('mario-big', {start: 1, end: 2}), frameRate: 8, repeat: -1 });
        anims.create({ key: 'big-jump', frames: [{ key: 'mario-big', frame: 5}], frameRate: 1});
    }

    get body(){ 
        return this.sprite.body 
    };

    update(){
        this.playerControl();
        this.playerAnims();        
    }

    
    /* --Custom methods-- */

    //Player control
    playerControl(){
        const {left, right, space} = this.cursors;

        if(left.isDown){
            this.sprite.setAccelerationX(-acceleration);
            this.sprite.setFlipX(true);
        } else if(right.isDown){
            this.sprite.setAccelerationX(acceleration);
            this.sprite.setFlipX(false);
        } else {
            this.sprite.setAccelerationX(0);
        }

        if(Phaser.Input.Keyboard.JustDown(space) && this.body.onFloor()){
            this.sprite.setVelocityY(jumpForce);
        }

        if (this.body.onFloor()) {
          this.body.setDragX(drag);
        } else {
          this.body.setDragX(0);
        }
    }

    //Anims
    playerAnims(){
        const prefix = this.size;

        if(!this.body.onFloor()){
            this.sprite.play(`${prefix}-jump`, true);
        } else if (this.body.velocity.x !== 0){
            this.sprite.play(`${prefix}-walk`, true);
        } else {
            this.sprite.play(`${prefix}-idle`, true);
        }
    }

    grow(){
        if(this.size === 'small'){
            this.size = 'big';
            this.sprite.setTexture('mario-big');
            this.sprite.setSize(12, 32);
            this.sprite.setOffset(2, 0);
        }
    }

    shrink(){
        if(this.size === 'big'){
            this.size = 'small';
            this.sprite.setTexture('mario-small');
            this.sprite.setSize(8, 16);
            this.sprite.setOffset(4, 0);
        }
    }
};