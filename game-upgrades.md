# Upgrades

## Player
1. agacharse
2. Flor - Si soy 'big' y saco una flor y ante de cogerla vuelvo a ser 'small', al cogerla el efecto debería ser como si cogiera un 'mushroom'

## EnemyManager
1. Responsabilidad del “update”
Si más adelante tus enemigos se vuelven más complejos (por ejemplo, IA con pathfinding o grupos grandes), podrías dejar que cada Enemy tenga su propio update() interno y que el manager solo llame enemy.update() (como ya haces). Es una buena base para escalar.

2. Desacoplar colisiones de createEnemies()
En proyectos grandes, podrías separar el registro de colisiones en un método setupCollisions() dentro del manager, solo por orden visual. Pero en tu caso actual, no hay necesidad funcional.

3. Optimización de spawns
Si más adelante el mapa es muy largo, podrías borrar (destroy()) enemigos fuera de cámara y marcarlos como “despawned” para optimizar memoria, todo dentro del manager.

# Modularización por responsabilidad en GameScene
pendientes:
- CameraManager
- UIManager -> showGameOverScreen() y PauseAll()