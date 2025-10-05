export function createAnimations(scene){
        scene.anims.create({
            key: 'block-question-idle',
            frames: scene.anims.generateFrameNumbers('block-question', { start: 0, end: 2 }),
            frameRate: 4,
            repeat: -1
        });

        scene.anims.create({
            key: 'coin-spin',
            frames: scene.anims.generateFrameNumbers('coin', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        })

        scene.anims.create({
            key: 'flower-idle',
            frames: scene.anims.generateFrameNumbers('flower', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        })

        scene.anims.create({
            key: 'fireball-spin',
            frames: scene.anims.generateFrameNumbers('fireball', { start: 0, end: 3 }),
            frameRate: 12,
            repeat: -1
        })

        scene.anims.create({
            key: 'fireball-explode',
            frames: scene.anims.generateFrameNumbers('fireball-explode', { start: 0, end: 2 }),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true,
        })
    };