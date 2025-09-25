import Phaser from "phaser";
import PreloadScene from "./scenes/PreloadScene";
import GameScene from "./scenes/GameScene";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 1000
      },
      debug: false,
    }
  },
  scene: [ PreloadScene, GameScene ]
}

const game = new Phaser.Game(config);