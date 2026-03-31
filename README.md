# Isometric 2D Combat MVP (Single Prompt Test)

Este repositorio contiene una prueba de un Producto Mínimo Viable (MVP) para un juego isométrico 2D de combate en arenas de 3v3 (Personajes vs Enemigos).
El objetivo de este proyecto consistía en evaluar y probar la creación de toda la estructura, mecánicas y el juego funcional mediante **un único prompt** detallado utilizado con un agente de IA.

## Características del MVP:
- **Vista Isométrica 2D**: Perspectiva y renderizado de mapa utilizando un tilemap como grid.
- **Sistema de Combate 3v3**: Peleas en arena con guerreros de múltiples tipos (melee, magos, arqueros).
- **IA y FSM (Finite State Machine)**: Lógica básica en la que los distintos enemigos y protagonistas saben atacar, huir, y priorizar a quién atacar según sus stats.
- **Knockback y Físicas Básicas**: Sistema de empuje para expulsar a un rival de la arena hacia la lava, que actúa a modo de 'muerte instantánea'.
- **Sistema de Power-ups**: Generación aleatoria de bufos (fuerza, velocidad, sanación o resistencia al knockback).
- **Stack Técnico**: Desarrollo basado en JavaScript nativo combinado con Phaser 3 y gestionado localmente por Vite.

## Cómo ejecutar localmente
1. Clona el repositorio
2. Navega a la carpeta `/game`: \`cd game\`
3. Instala las dependencias: \`npm install\`
4. Corre el proyecto en modo desarrollo: \`npm run dev\`

### Notas de Desarrollo
Este prototipo es completamente funcional; en versiones recientes se ha ajustado el tiempo y el balance para asegurar unas duraciones de combate más entretenidas.
Todos los assets, animaciones y mecánicas fueron implementados basándose puramente en las especificaciones del diseño proporcionado y el prompt original.
