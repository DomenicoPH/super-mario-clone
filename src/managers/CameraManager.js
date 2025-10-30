export default class CameraManager {
    constructor(scene, mapManager, player){
        this.scene = scene;
        this.mapManager = mapManager;
        this.player = player;
        this.camera = scene.cameras.main;
        this.physics = scene.physics;
    };

    setupWorldBounds() {
        const worldBounds = [true, true, false, true];
        this.physics.world.setBounds(
            0,
            0,
            this.mapManager.map.widthInPixels,
            this.mapManager.map.heightInPixels,
            ...worldBounds
        );
    }

    setupCamera() {
        this.camera.setBounds(
            0,
            0,
            this.mapManager.map.widthInPixels,
            this.mapManager.map.heightInPixels
        );
        this.camera.scrollY = 0;
        this.camera.startFollow(this.player.sprite, false, 1, 0);
    }

    lockY() {
        this.camera.scrollY = 0; // mantiene fija la cámara en Y
    }

    update() {
        this.lockY();
    }

}