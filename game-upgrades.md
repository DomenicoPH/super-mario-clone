# Upgrades

## Nuevas funcionalidades

1. Sistema de Puntuación (Score) y Monedas ⭐ PRIORIDAD ALTA
Las monedas que aparecen en los bloques no se están contando. Implementar:

- Contador de score que aumente con monedas (+100), enemigos pisados (+100), bloques rotos (+50)
- Contador de monedas recolectadas
- Sistema de vidas extra cada 100 monedas
- Mostrar todo en el UI

2. Sistema de Vidas y Reinicio ⭐ PRIORIDAD ALTA

- Implementar contador de vidas (empezar con 3)
- Cuando Mario muere, restar vida y reiniciar desde el checkpoint
- Game Over real cuando se acaban las vidas
- Pantalla de "Game Over" con opción de reiniciar

3. Sistema de Tiempo (Timer) ⭐ PRIORIDAD MEDIA

- Agregar temporizador que cuenta hacia atrás desde 400 segundos
- Perder vida cuando llega a 0
- Bonus de puntos al terminar el nivel según tiempo restante

4. Flag de Victoria (Final de Nivel) ⭐ PRIORIDAD ALTA

- Implementar la bandera al final del nivel
- Animación de Mario bajando la bandera
- Cálculo de puntos según altura donde tocó la bandera
- Transición al siguiente nivel o pantalla de victoria

5. Power-ups Adicionales ⭐ PRIORIDAD MEDIA

- Estrella de invencibilidad
- 1-UP mushroom (hongo verde)

6. Más Enemigos (próximos niveles) ⭐ PRIORIDAD MEDIA

- Piranha Plants (plantas carnívoras en tuberías)
- Paratroopas (Koopas con alas)
- Buzzy Beetles
- Hammer Bros

7. Elementos del Mundo ⭐ PRIORIDAD BAJA

- Tuberías funcionales (entrar/salir)
- Áreas secretas/bonus
- Plataformas móviles
- Trampolines

8. Audio y Polish ⭐ PRIORIDAD BAJA

- Música de fondo del nivel
- Música de invencibilidad
- Efectos de sonido que falten
- Partículas visuales adicionales


## EnemyManager
1. Responsabilidad del “update”
    Si más adelante tus enemigos se vuelven más complejos (por ejemplo, IA con pathfinding o grupos grandes), podrías dejar que cada Enemy tenga su propio update() interno y que el manager solo llame enemy.update() (como ya haces). Es una buena base para escalar.

2. Desacoplar colisiones de createEnemies()
    En proyectos grandes, podrías separar el registro de colisiones en un método setupCollisions() dentro del manager, solo por orden visual. Pero en tu caso actual, no hay necesidad funcional.

3. Optimización de spawns
    Si más adelante el mapa es muy largo, podrías borrar (destroy()) enemigos fuera de cámara y marcarlos como “despawned” para optimizar memoria, todo dentro del manager.