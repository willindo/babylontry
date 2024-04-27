import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';

const Particle = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            const engine = new BABYLON.Engine(canvasRef.current);
            const scene = new BABYLON.Scene(engine);

            // Setup environment
            const camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 20, new BABYLON.Vector3(0, 0, 0), scene);
            camera.attachControl(canvasRef.current, true);
            camera.wheelPrecision = 100;

            const fountain = BABYLON.Mesh.CreateBox("foutain", 0.1, scene);
            fountain.visibility = 0.1;

            // Create a particle system
            let particleSystem;
            const useGPUVersion = true;

            const createNewSystem = () => {
                if (particleSystem) {
                    particleSystem.dispose();
                }

                if (useGPUVersion && BABYLON.GPUParticleSystem.IsSupported) {
                    particleSystem = new BABYLON.GPUParticleSystem("particles", { capacity:1000000}, scene);
                    particleSystem.activeParticleCount = 200000;
                } else {
                    particleSystem = new BABYLON.ParticleSystem("particles", 50000 , scene);
                }

                const customEmitter = new BABYLON.CustomParticleEmitter();

                let id = 0;
                customEmitter.particlePositionGenerator = (index, particle, out) => {
                    out.x = Math.cos(id) * 5;
                    out.y = Math.sin(id) * 5;
                    out.z = 0;
                    id += 0.01;
                }

                customEmitter.particleDestinationGenerator = (index, particle, out) => {
                    out.x = 0;
                    out.y = 0;
                    out.z = 0;
                }

                particleSystem.emitRate = 10000;
                particleSystem.particleEmitterType = customEmitter;
                particleSystem.particleTexture = new BABYLON.Texture("/textures/crate.png", scene);
                particleSystem.maxLifeTime = 10;
                particleSystem.minSize = 0.01;
                particleSystem.maxSize = 0.1;
                particleSystem.emitter = fountain;

                particleSystem.start();
            }

            createNewSystem();

            let alpha = 0;
            let moveEmitter = false;
            let rotateEmitter = false;

            scene.registerBeforeRender(() => {
                if (moveEmitter) {
                    fountain.position.x = 5 * Math.cos(alpha);
                    fountain.position.z = 2 * Math.cos(alpha) ;
                }

                if (rotateEmitter) {
                    fountain.rotation.x += 0.01;
                }

                alpha += 0.01;
            });
            const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
            sphere.isVisible = false;
        
            // Asset manager for loading texture and particle system
            const assetsManager = new BABYLON.AssetsManager(scene);
            const particleTexture = assetsManager.addTextureTask("my particle texture", "https://models.babylonjs.com/Demos/particles/textures/dotParticle.png")
            const particleFile = assetsManager.addTextFileTask("my particle system", "https://patrickryanms.github.io/BabylonJStextures/Demos/Particles/particleSystem.json");
            
            // load all tasks
            assetsManager.load();
        
            // after all tasks done, set up particle system
            assetsManager.onFinish = function (tasks) {
                console.log("tasks successful", tasks);
        
                // prepare to parse particle system files
                const particleJSON = JSON.parse(particleFile.text);
                const myParticleSystem = BABYLON.ParticleSystem.Parse(particleJSON, scene, "", false, 1000);
        
                // set particle texture
                myParticleSystem.particleTexture = particleTexture.texture;
        
                // set emitter
                myParticleSystem.emitter = sphere;
            }
            BABYLON.ParticleHelper.CreateAsync("fire", scene).then((set) => {
                set.start();
            });
            engine.runRenderLoop(() => {
                scene.render();
            });

            return () => {
                scene.dispose();
                engine.dispose();
            }
        }
    }, []);

    return (
        <canvas ref={canvasRef} />
    );
}

export default Particle;
