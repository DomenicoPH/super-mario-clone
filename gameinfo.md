# Mario Bros Clone
Vite & Phaser

## Enlaces  
[Spriters: NES Super Mario Bros (sprites)](https://www.spriters-resource.com/nes/supermariobros/)

## Estructura de mapa en capas
✅ Capa 1: Ground
- Contenido: bloques sólidos (suelo, plataformas, ladrillos, tubos).
- Uso en Phaser: esta capa tendrá colisiones activadas.
- Consejo: marca los tiles con collides: true en sus propiedades.
✅ Capa 2: Decoration
- Contenido: elementos visuales sin interacción (arbustos, nubes, fondo de colinas).
- Uso en Phaser: se renderiza pero no tiene colisión.
- Consejo: útil para ambientar sin afectar la jugabilidad.
✅ Capa 3: Objects
- Contenido: monedas, bloques sorpresa, enemigos, power-ups.
- Uso en Phaser: puedes leer esta capa como objetos dinámicos.
- Consejo: usa Object Layer si quieres definir posiciones exactas con propiedades.
✅ Capa 4: Background (opcional)
- Contenido: cielo, fondo estático.
- Uso en Phaser: puede ser una imagen fija o una capa de tiles sin colisión.
- Consejo: si usas scroll lateral, fija esta capa con setScrollFactor(0).
✅ Capa 5: Ref (solo para ti)
- Contenido: imagen de referencia del mapa original.
- Uso en Phaser: no se exporta ni se usa en el juego.
- Consejo: bloquea esta capa para evitar moverla accidentalmente.

## FIXES (arreglos pendientes)
- Las monedas deben aparecer detras del bloque, no por delante.
- El hongo debe subir hasta la superficie del bloque y no dar un saltito.
- El hongo debe ser suceptible de ser empujado hacia arriba si el bloque (brick) por el que se desplaza debajo es golpeado por el jugador por abajo.