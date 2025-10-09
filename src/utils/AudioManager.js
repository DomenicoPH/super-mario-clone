import Phaser from "phaser";

export default class AudioManager {
    constructor(scene){
        this.scene = scene;
        this.sounds = new Map();
        this.muted = false;
        this.globalVolume = 0.7;

        this.init();
    }

    init(){
        //jump sounds
        this.sounds.set('jump-small', {
            key: 'jump-small-sound',
            config: { volume: 0.4, rate: 1.0 }
        });

        this.sounds.set('jump-super', {
            key: 'jump-super-sound',
            config: { volume: 0.4, rate: 1.0 }
        });

        //powerup sounds
        this.sounds.set('powerup-appears', {
            key: 'powerup-appears-sound',
            config: { volume: 0.4, rate: 1.0 }
        });

        this.sounds.set('powerup', {
            key: 'powerup-sound',
            config: { volume: 0.4, rate: 1.0 }
        });

        //powerdown sound
        this.sounds.set('powerdown', {
            key: 'powerdown-sound',
            config: { volume: 0.4, rate: 1.0 }
        })

        //pipe travel sound
        this.sounds.set('pipe', {
            key: 'pipe-sound',
            config: { volume: 0.4, rate: 1.0 }
        })

        //stomp sound
        this.sounds.set('stomp', {
            key: 'stomp-sound',
            config: { volume: 0.4, rate: 1.0 }
        })

        //bump sound
        this.sounds.set('bump', {
            key: 'bump-sound',
            config: { volume: 0.6, rate: 1.0 }
        })

        //break sound
        this.sounds.set('break', {
            key: 'break-sound',
            config: { volume: 0.4, rate: 1.0 }
        })

        //coin sound
        this.sounds.set('coin', {
            key: 'coin-sound',
            config: { volume: 0.4, rate: 1.0 }
        });

        //fireball sound
        this.sounds.set('fireball', {
            key: 'fireball-sound',
            config: { volume: 0.4, rate: 1.0 }
        });

        //Mario dies sound
        this.sounds.set('die', {
            key: 'die-sound',
            config: { volume: 0.4, rate: 1.0 }
        });

        // Instancias:
        this.sounds.forEach((soundData, name) => {
            soundData.instance = this.scene.sound.add(soundData.key, soundData.config);
        });
    }

    play(soundName, overrides = {}){
        if(this.muted) return null;

        const soundData = this.sounds.get(soundName);
        if(!soundData || !soundData.instance){
            console.warn(`Sound "${soundName}" not found`);
            return null;
        }

        const config = { ...soundData.config, ...overrides };
        config.volume = (config.volume || 1) * this.globalVolume;

        soundData.instance.play(config);
        return soundData.instance;
    }

    // Métodos específicos:
    playJumpSmall(){ return this.play('jump-small') };
    playJumpSuper(){ return this.play('jump-super') };
    playPowerUpAppears(){ return this.play('powerup-appears') };
    playPowerUp(){ return this.play('powerup') };
    playPowerDown(){ return this.play('powerdown') };
    playStomp(){ return this.play('stomp') };
    playPipe(){ return this.play('pipe') };
    playBump(){ return this.play('bump') };
    playBreak(){ return this.play('break') };
    playCoin(){ return this.play('coin') };
    playFireball(){ return this.play('fireball') };

    playDie(){ return this.play('die') };

}