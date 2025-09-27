export function createGridOverlay(scene, map, tileSize = 16) {
  const graphics = scene.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.5);

  const width = map.widthInPixels;
  const height = map.heightInPixels;

  // Líneas verticales
  for (let x = 0; x <= width; x += tileSize) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, height);
  }

  // Líneas horizontales
  for (let y = 0; y <= height; y += tileSize) {
    graphics.moveTo(0, y);
    graphics.lineTo(width, y);
  }

  graphics.strokePath();

  graphics.setScrollFactor(1); // que siga la cámara
  graphics.setDepth(999); // encima de todo

  return graphics;
};