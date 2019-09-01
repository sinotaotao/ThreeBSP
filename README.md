# ThreeBSP
CSG plugin for Three.js (with ThreeJS r107 and WebPack support)

Everything is come from [electricessence/ThreeBSP](https://github.com/electricessence/ThreeBSP) and [chandlerprall/ThreeCSG](https://github.com/chandlerprall/ThreeCSG).

Thanks to every author!

## To use

```ts
import ThreeBSP = require("../lib/ThreeBSP/ThreeBSP");

//...

let cubeGeo1 = new THREE.BoxGeometry(50, 200, 80);
let cube1 = new THREE.Mesh(cubeGeo1, cubeMaterial);
let bsp1 = new ThreeBSP(cube1);

let cubeGeo2 = new THREE.BoxGeometry(40, 180, 80);
let cube2 = new THREE.Mesh(cubeGeo2, cubeMaterial);
let bsp2 = new ThreeBSP(cube2);

let resBSP = bsp1.subtract(bsp2);
let resultMesh = resBSP.toMesh(cubeMaterial);
```
