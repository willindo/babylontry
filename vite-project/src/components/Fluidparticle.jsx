import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';

const Fluidparticle = () => {
    const canvasRef = useRef(null);

    // useEffect(() => {
        if (canvasRef.current) {
            const engine = new BABYLON.Engine(canvasRef.current);
            const scene = new BABYLON.Scene(engine);

            // Setup environment
            const camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 20, new BABYLON.Vector3(0, 0, 0), scene);
            camera.attachControl(canvasRef.current, true);
            camera.wheelPrecision = 100;

        
            const useGPU = false;
            const renderAsFluid = true;
            const numParticles = 20000 * 2;
            const numParticlesEmitRate = 1500 * 2;
            
            // scene = scene;
            
            const envTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
                "./environment.env",
                scene
            );
            
            scene.createDefaultSkybox(envTexture);
            
            // Create a particle system
            if (useGPU) {
        var particleSystem
        particleSystem = new BABYLON.GPUParticleSystem(
            "particles",
            { capacity: numParticles },
            scene
        );
    } else {
        var particleSystem
        particleSystem = new BABYLON.ParticleSystem(
            "particles",
            numParticles,
            scene
        );
    }

    // window.pp = particleSystem;

    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture(
        "./flare32bits.png",
        scene
    );
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODEADD;

    // Where the particles come from
    particleSystem.createConeEmitter(4, Math.PI / 2);

    // Colors of all particles
    particleSystem.color1 = new BABYLON.Color4(0.4, 1.5, 0.3, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.4, 1.5, 0.3, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
    particleSystem.colorDead = new BABYLON.Color4(0.4, 1.0, 0.3, 1.0);

    // Size of each particle (random between...
    particleSystem.minSize = 0.5 * 1.5;
    particleSystem.maxSize = 0.5 * 1.5;

    // Life time of each particle (random between...
    particleSystem.minLifeTime = 2.0;
    particleSystem.maxLifeTime = 2.5;

    // Emission rate
    particleSystem.emitRate = numParticlesEmitRate;

    // Set the gravity of all particles
    particleSystem.gravity = new BABYLON.Vector3(0, -10.81, 0);

    // Speed
    particleSystem.minEmitPower = 2.5;
    particleSystem.maxEmitPower = 6.5;
    particleSystem.updateSpeed = 0.02;

    // Start the particle system
    particleSystem.preWarmCycles = 60 * 8;

    particleSystem.start();

    return new Promise((resolve) => {
        scene.executeWhenReady(() => {
            scene.updateTransformMatrix(true);

            particleSystem.render(); // make sure the pre-warm cycles are done in the GPU case (for CPU case it is done when calling start())

            particleSystem.renderAsFluid = renderAsFluid;

            if (renderAsFluid) {
                fluidRenderer = scene.enableFluidRenderer();

                fluidRenderer.addParticleSystem(particleSystem);

                fluidRenderObject =
                    fluidRenderer.getRenderObjectFromParticleSystem(
                        particleSystem
                    );

                fluidRenderObject.object.particleSize = 0.75;
                fluidRenderObject.object.particleThicknessAlpha = 0.02;
                fluidRenderObject.object.useTrueRenderingForDiffuseTexture = true;
                fluidRenderObject.targetRenderer.minimumThickness = fluidRenderObject.object.particleThicknessAlpha;
                fluidRenderObject.targetRenderer.blurDepthFilterSize = 10;
                fluidRenderObject.targetRenderer.blurDepthDepthScale = 10;
                fluidRenderObject.targetRenderer.thicknessMapSize = 1024;
                fluidRenderObject.targetRenderer.density = 8;
                fluidRenderObject.targetRenderer.fresnelClamp = 0.04;
                fluidRenderObject.targetRenderer.fluidColor = new BABYLON.Color3(
                    219 / 255,
                    228 / 255,
                    1
                );
                fluidRenderObject.targetRenderer.generateDiffuseTexture = false;

            }

            resolve(scene);
        }, true);
        
        engine.runRenderLoop(() => {
            scene.render();
        });
        
        return () => {
            scene.dispose();
            engine.dispose();
        }
    });
}
    
    return (
        <canvas ref={canvasRef} />
    );
}

export default Fluidparticle;
