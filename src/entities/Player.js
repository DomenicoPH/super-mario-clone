const speed = 160;
const jumpForce = -400;

export default class Player {
    constructor(scene, x, y){
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'mario-small');
        this.sprite.setCollideWorldBounds(true);
        this.createAnimations();
        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    createAnimations(){
        const anims = this.scene.anims;
        anims.create({ key: 'idle', frames: [{ key: 'mario-small', frame: 0}], frameRate: 1});
        anims.create({ key: 'walk', frames: anims.generateFrameNumbers('mario-small', {start: 1, end: 2}), frameRate: 8, repeat: -1 });
        anims.create({ key: 'jump', frames: [{ key: 'mario-small', frame: 5}], frameRate: 1});
    }

    update(){
        this.playerControl();
        this.playerAnims();        
    }

    get body(){ 
        return this.sprite.body 
    };
    
    /* --Custom methods-- */

    //Player control
    playerControl(){
        const {left, right, space} = this.cursors;

        if(left.isDown){
            this.sprite.setVelocityX(-speed);
            this.sprite.setFlipX(true);
        } else if(right.isDown){
            this.sprite.setVelocityX(speed);
            this.sprite.setFlipX(false);
        } else {
            this.sprite.setVelocityX(0);
        }

        if(space.isDown && this.body.onFloor()){
            this.sprite.setVelocityY(jumpForce);
        }
    }

    //Anims
    playerAnims(){
        if(!this.body.onFloor()){
            this.sprite.play('jump', true);
        } else if (this.body.velocity.x !== 0){
            this.sprite.play('walk', true);
        } else {
            this.sprite.play('idle', true);
        }
    }
};