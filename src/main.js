import Phaser from "phaser";
import PreloadScene from "./scenes/PreloadScene";
import GameScene from "./scenes/GameScene";

const config = {
  type: Phaser.CANVAS,
  width: 256,
  height: 240,
  pixelArt: true,
  zoom: 2,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 1000
      },
      debug: true,
    }
  },
  scene: [ PreloadScene, GameScene ]
}

const game = new Phaser.Game(config);