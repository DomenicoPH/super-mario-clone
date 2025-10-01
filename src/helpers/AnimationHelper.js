export default class AnimationHelper {

    static bump(scene, target, { offsetY = 8, duration = 100, onStart, onComplete } = {}){
        scene.tweens.add({
            targets: target,
            y: target.y - offsetY,
            duration,
            yoyo: true,
            ease: 'Power1',
            onStart,
            onComplete,
        });
    }

    static coinPop(scene, coin, { rise = 50, drop = 35 } = {}){
        // tween 1: sube
        scene.tweens.add({
            targets: coin,
            y: coin.y - rise,
            duration: 200,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // tween 2: baja y se destruye
                scene.tweens.add({
                    targets: coin,
                    y: coin.y - drop,
                    duration: 100,
                    ease: 'Sine.easeIn',
                    onComplete: () => coin.destroy(),
                });
            }
        });
    }

    static mushroomRise(scene, mushroom, { distance = null, duration = 1000, onComplete } = {}){
        const riseDistance = distance ?? mushroom.height;
        
        scene.tweens.add({
            targets: mushroom,
            y: mushroom.y - riseDistance,
            duration,
            ease: 'Linear',
            onComplete
        });
    }
}