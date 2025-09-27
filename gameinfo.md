# Mario Bros Clone
Vite & Phaser

## Enlaces  
[Spriters: NES Super Mario Bros (sprites)](https://www.spriters-resource.com/nes/supermariobros/)

---

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

---

## EASE en animaciones
### Lineales

"Linear" → constante, sin aceleración.

### Suaves

"Sine.easeIn", "Sine.easeOut", "Sine.easeInOut" → transiciones suaves (tipo seno).

"Quad.easeIn", "Quad.easeOut", "Quad.easeInOut" → aceleración cuadrática.

"Cubic.*", "Quart.*", "Quint.*" → lo mismo pero con curvas más pronunciadas.

### Exponenciales y Potentes

"Expo.easeIn", "Expo.easeOut", "Expo.easeInOut" → cambios muy rápidos o muy lentos.

"Power0", "Power1", "Power2", "Power3", "Power4" → alias cortos para distintos grados de aceleración.

### Elásticas y Rebotes

"Elastic.easeIn", "Elastic.easeOut", "Elastic.easeInOut" → efecto resorte (rebota varias veces).

"Bounce.easeIn", "Bounce.easeOut", "Bounce.easeInOut" → rebote al final o inicio.

### Retroceso

"Back.easeIn", "Back.easeOut", "Back.easeInOut" → empieza retrocediendo un poco y luego avanza.

---

## FIXES (arreglos pendientes)
- Las monedas deben aparecer detras del bloque, no por delante.
- El hongo debe subir hasta la superficie del bloque y no dar un saltito.
- El hongo debe ser suceptible de ser empujado hacia arriba si el bloque (brick) por el que se desplaza debajo es golpeado por el jugador por abajo.