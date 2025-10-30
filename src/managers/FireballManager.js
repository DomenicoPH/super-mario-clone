export default class FireballManager {
    constructor(scene, mapManager, blockManager){
        this.scene = scene;
        this.mapManager = mapManager;
        this.blockManager = blockManager;
        this.fireballs = this.scene.physics.add.group();
    }

    createFireballs() {
        // 1. Collider con el suelo
        this.scene.physics.add.collider(this.fireballs, this.mapManager.groundLayer);
        // 2. Collider con los bloques
        this.scene.physics.add.collider(this.fireballs, this.blockManager.blocksGroup);
    }

    getFireballs(){
        return this.fireballs;
    }

    handleGameOver() {
        this.fireballs?.getChildren().forEach(fbSprite => {
            const fb = fbSprite.fireballRef;
            if (fb) {
                fb.sprite.setVelocity(0, 0);
                fb.sprite.anims?.pause();
            }
        });
    }

}