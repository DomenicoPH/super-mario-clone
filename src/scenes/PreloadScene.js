import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
    constructor(){
        super('PreloadScene')
    }

    preload(){
        this.load.image('sky', '/assets/tilemaps/sky.png');
        this.load.image('world-tileset', '/assets/tilemaps/world-tileset.png');
        this.load.tilemapTiledJSON('level1', '/assets/tilemaps/level1.json');

        this.load.spritesheet('mario-small', '/assets/sprites/mario-small.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('mario-big', '/assets/sprites/mario-big.png', { frameWidth: 16, frameHeight: 32 });
        this.load.spritesheet('mario-fire', '/assets/sprites/mario-fire.png', { frameWidth: 16, frameHeight: 32 });
        this.load.spritesheet('mario-trans', '/assets/sprites/mario-trans.png', { frameWidth: 16, frameHeight: 32 });
        this.load.image('mario-fire-shoot', '/assets/sprites/mario-fire-shoot.png');

        this.load.spritesheet('fireball', '/assets/sprites/fire-ball.png', { frameWidth: 8, frameHeight: 8 });
        this.load.spritesheet('fireball-explode', '/assets/sprites/fire-ball-explode.png', { frameWidth: 16, frameHeight: 16 });

        this.load.image('block-brick', '/assets/sprites/brick-block-sprite.png');
        this.load.spritesheet('block-question', '/assets/sprites/question-block-spritesheet.png', { frameWidth:16, frameHeight:16 });
        this.load.image('block-question-empty', '/assets/sprites/question-block-empty.png');
        this.load.spritesheet('broken-block', '/assets/sprites/broken-block.png', { frameWidth: 8, frameHeight: 8 });

        this.load.spritesheet('coin', '/assets/sprites/coin-spin.png', {frameWidth: 8, frameHeight: 16});
        this.load.image('mushroom', '/assets/sprites/mushroom-grow.png');
        this.load.spritesheet('flower', '/assets/sprites/fire-flower.png', { frameWidth: 16, frameHeight: 16 });

        this.load.spritesheet('goomba', '/assets/sprites/goomba-normal.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('koopa', '/assets/sprites/koopa-normal.png', { frameWidth: 16, frameHeight: 24 });

        //SOUND
        this.load.audio('jump-small-sound', '/assets/sound/smb_jump-small.wav');
        this.load.audio('jump-super-sound', '/assets/sound/smb_jump-super.wav');
        this.load.audio('powerup-appears-sound', '/assets/sound/smb_powerup_appears.wav');
        this.load.audio('powerup-sound', '/assets/sound/smb_powerup.wav');
        this.load.audio('powerdown-sound', '/assets/sound/smb_pipe.wav');
        this.load.audio('stomp-sound', '/assets/sound/smb_stomp.wav');
        this.load.audio('kick-sound', '/assets/sound/smb_kick.wav');
        this.load.audio('pipe-sound', '/assets/sound/smb_pipe.wav');
        this.load.audio('bump-sound', '/assets/sound/smb_bump.wav');
        this.load.audio('break-sound', '/assets/sound/smb_breakblock.wav');
        this.load.audio('coin-sound', '/assets/sound/smb_coin.wav');
        this.load.audio('fireball-sound', '/assets/sound/smb_fireball.wav');

        this.load.audio('die-sound', '/assets/sound/smb_mariodie.wav');
    }

    create(){
        this.scene.start('GameScene');
    }
}
export default PreloadScene;