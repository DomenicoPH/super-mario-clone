import Phaser from "phaser";
import Fireball from "./Fireball";

const maxSpeed = 160;
const acceleration = 300;
const drag = 200;
const jumpForce = -400;

export default class Player {
    constructor(scene, x, y){
        this.scene = scene;
        this.size = 'small';
        this.isTransforming = false;
        this.invulnerable = false;
        this.isCrouching = false;

        this.sprite = scene.physics.add.sprite(x, y, 'mario-small');
        this.setBodySize(10, 16, 3, 0);

        this.sprite.setCollideWorldBounds(true);

        this.sprite.body.setMaxVelocity(maxSpeed, 500);
        this.sprite.body.setDragX(drag);

        this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z); //tecla fireball (Z)

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
        anims.create({ key: 'big-crouch', frames: [{ key: 'mario-big', frame: 6 }], frameRate: 1, repeat: -1})

        // Mario Fire
        anims.create({ key: 'fire-idle', frames: [{ key: 'mario-fire', frame: 0}], frameRate: 1});
        anims.create({ key: 'fire-walk', frames: anims.generateFrameNumbers('mario-fire', {start: 1, end: 2}), frameRate: 8, repeat: -1 });
        anims.create({ key: 'fire-jump', frames: [{ key: 'mario-fire', frame: 5}], frameRate: 1});
        anims.create({ key: 'fire-crouch', frames: [{ key: 'mario-fire', frame: 6 }], frameRate: 1, repeat: -1})

        // Mario dies
        anims.create({ key: 'small-die', frames: [{ key: 'mario-small', frame: 6 }], frameRate: 1 });

        // GROW animation
        anims.create({
            key: 'transform-grow',
            frames: [
                { key: 'mario-trans', frame: 0 }, // small
                { key: 'mario-trans', frame: 1 }, // medium
                { key: 'mario-trans', frame: 2 }, // big
                { key: 'mario-trans', frame: 0 }, // back to small
                { key: 'mario-trans', frame: 2 }, // big
                { key: 'mario-trans', frame: 0 }, // small
                { key: 'mario-trans', frame: 2 }, // big
                { key: 'mario-trans', frame: 2 }  // final big
            ],
            frameRate: 12,
            repeat: 0
        });

        // SHRINK animation
        anims.create({
            key: 'transform-shrink',
            frames: [
                { key: 'mario-trans', frame: 2 }, // big
                { key: 'mario-trans', frame: 1 }, // medium
                { key: 'mario-trans', frame: 0 }, // small
                { key: 'mario-trans', frame: 2 }, // back to big
                { key: 'mario-trans', frame: 0 }, // small
                { key: 'mario-trans', frame: 2 }, // big
                { key: 'mario-trans', frame: 0 }, // small
                { key: 'mario-trans', frame: 0 }  // final small
            ],
            frameRate: 12,
            repeat: 0
        })

        // FIRE-MARIO transform animation
        anims.create({
            key: 'transform-fire',
            frames: [
                { key: 'mario-big', frame: 0 },
                { key: 'mario-fire', frame: 0 },
                { key: 'mario-big', frame: 0 },
                { key: 'mario-fire', frame: 0 },
                { key: 'mario-fire', frame: 0 }
            ],
            frameRate: 12,
            repeat: 0,
        })

    }

    get body(){ 
        return this.sprite.body 
    };

    update() {
        if(!this.isTransforming) this.playerControl();
        this.playerAnims();

        if(Phaser.Input.Keyboard.JustDown(this.shootKey)){
            this.shootFireball();
        }
    }

    
    /* --Custom methods-- */

    //Player control
    playerControl(){
        const {left, right, space} = this.cursors;

        if(left.isDown && !this.isCrouching){
            this.sprite.setAccelerationX(-acceleration);
            this.sprite.setFlipX(true);
        } else if(right.isDown && !this.isCrouching){
            this.sprite.setAccelerationX(acceleration);
            this.sprite.setFlipX(false);
        } else {
            this.sprite.setAccelerationX(0);
        }

        // crouch
        if ((this.size === 'big' || this.size === 'fire') && this.cursors.down.isDown && this.body.onFloor()) {
            if (!this.isCrouching) {
                this.isCrouching = true;
                this.sprite.body.setSize(14, 20);
                this.sprite.body.setOffset(1, 12);
            }
        } else if (this.isCrouching) {
            // dejar de agacharse
            this.isCrouching = false;
            this.sprite.body.setSize(14, 32);
            this.sprite.body.setOffset(1, 0);
        }

        // jump
        if(Phaser.Input.Keyboard.JustDown(space) && this.body.onFloor()){
            this.sprite.setVelocityY(jumpForce);
            //sound:
            if(this.size === 'small'){
                this.scene.audio.playJumpSmall();
            } else {
                this.scene.audio.playJumpSuper();
            }
        }

        if (this.body.onFloor()) {
          this.body.setDragX(drag);
        } else {
          this.body.setDragX(0);
        }

        // Bloquear al jugador en el borde izquierdo de la cámara
        const cameraLeft = this.scene.cameras.main.scrollX;
        const playerLeft = this.sprite.x - this.sprite.body.halfWidth;
        
        if (playerLeft < cameraLeft) {
            this.sprite.x = cameraLeft + this.sprite.body.halfWidth;
            if (this.sprite.body.velocity.x < 0) {
                this.sprite.body.velocity.x = 0;
            }
        }
    }

    //Anims
    playerAnims(){
        if(this.isTransforming) return;

        const prefix = this.size;
        if(!this.body.onFloor()){
            this.sprite.play(`${prefix}-jump`, true);
        } else if (this.body.velocity.x !== 0){
            this.sprite.play(`${prefix}-walk`, true);
        } else {
            this.sprite.play(`${prefix}-idle`, true);
        }

        // crouch anim
        if (this.isCrouching) {
            const prefix = this.size;
            this.sprite.play(`${prefix}-crouch`, true);
            return; // evita que entre en idle o walk
        }
    }

    // setBodySize: Ajusta el tamaño y offset del cuerpo físico manteniendo los pies del sprite en la misma posición (no se hunde ni flota).
    setBodySize(width, height, offsetX = 0, offsetY = 0) {
        const oldBottom = this.sprite.body.bottom;
        this.sprite.body.setSize(width, height);
        this.sprite.body.setOffset(offsetX, offsetY);
        this.sprite.y = oldBottom - this.sprite.body.halfHeight;
    }



    grow() {
        if (this.size !== 'small' || this.isTransforming) return;
    
        this.isTransforming = true;

        this.sprite.setVelocity(0, 0);   // detener velocidad en ambos ejes
        this.sprite.setAcceleration(0, 0); // quitar aceleración
        this.sprite.body.allowGravity = false; // opcional: congelar en el aire
        this.sprite.anims.stop(); // detener cualquier animación previa

        this.setBodySize(14, 32, 1, 0);
        this.sprite.play('transform-grow');
    
        this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          this.size = 'big';
          this.sprite.setTexture('mario-big');
          this.isTransforming = false;
          this.sprite.body.allowGravity = true;
        });
    }

    shrink() {
        if (this.size !== 'big' && this.size !== 'fire' || this.isTransforming) return;
        
        this.isTransforming = true;
        
        this.sprite.play('transform-shrink');
        this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.size = 'small';
            this.sprite.setTexture('mario-small');
            this.setBodySize(10, 16, 3, 0);
        
            this.isTransforming = false;
        });
    }

    powerUpFire() {
        if (this.size !== 'big' || this.isTransforming) return;

        this.isTransforming = true;

        this.sprite.setVelocity(0, 0);
        this.sprite.setAcceleration(0, 0);
        this.sprite.body.allowGravity = false;
        this.sprite.anims.stop();

        this.sprite.play('transform-fire');

        this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.size = 'fire';
            this.sprite.setTexture('mario-fire');
            this.isTransforming = false;
            this.sprite.body.allowGravity = true;
        });
    }

    shootFireball(){
        if(this.size !== 'fire' || this.isTransforming) return;

        const active = (this.scene.fireballs?.getChildren() ?? []).filter( s => s.active ).length;
        if(active >= 2) return;

        const dir = this.sprite.flipX ? -1 : 1;
        const offsetX = dir * (this.sprite.displayWidth * 0.5 + 4);
        const spawnX = this.sprite.x + offsetX;
        const spawnY = this.sprite.y;

            // Cambio de sprite al disparar
            const prevTexture = this.sprite.texture.key;
            const prevFrame = this.sprite.frame.name;
            this.sprite.setTexture('mario-fire-shoot');
            this.sprite.setOrigin(0.5);

        const fireball = new Fireball(this.scene, spawnX, spawnY, dir);
        this.scene.fireballs.add(fireball.sprite);

            // Restaura la sprite despues de 250 ms
            this.scene.time.delayedCall(250, () => {
                this.sprite.setTexture(prevTexture, prevFrame)
            })

        //sound:
        this.scene.audio.playFireball();
    }

};