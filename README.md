# Binary Star System Simulation

An interactive 3D simulation of two stars orbiting a shared center of gravity, or **barycenter**. This project uses **Three.js** to render a realistic, space-themed experience that explores orbital mechanics through code.

## Features

* **Dynamic Orbits:** Stars rotate around a common center, with size and pathing determined by their mass.
* **Interactive View:** Click and drag to rotate the system in 3D space.
* **Scroll-to-Zoom:** Smoothly transition the camera perspective as you scroll.
  
## Technical Details

* **Rendering:** Powered by WebGL and the Three.js library.
* **Math:** Uses trigonometry to calculate circular motion and vector interpolation (`lerp`) for smooth camera movement.
* **Lighting:** Emissive materials and `PointLight` objects.
* **I assumed both the stars to be of same mass**
