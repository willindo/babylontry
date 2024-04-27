import React, { useEffect } from 'react';
import * as BABYLON from '@babylonjs/core';
import  { Engine, Scene, ShaderMaterial, Vector3, ArcRotateCamera, HemisphericLight, MeshBuilder } from '@babylonjs/core';
function Tryshader() {
  useEffect(() => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    var emitter0 = BABYLON.Mesh.CreateBox("emitter0", 0.1, scene);
    emitter0.isVisible = false;

    var particleSystem = new BABYLON.ParticleSystem("particles", 4000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("./valleygrass.png", scene);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 1.0;
    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 5.0;
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 3.0;
    particleSystem.emitter = emitter0;
    particleSystem.emitRate = 100;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
    particleSystem.color1 = new BABYLON.Color4(1, 1, 0, 1);
    particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
    particleSystem.gravity = new BABYLON.Vector3(0, -1.0, 0);
    particleSystem.renderingGroupId = 1;
    particleSystem.start();

    BABYLON.NodeMaterial.ParseFromSnippetAsync("#X3PJMQ", scene).then((nodeMaterial) => {
        nodeMaterial.createEffectForParticles(particleSystem);

        scene.debugLayer.show({ showExplorer: true, embedMode: true }).then(() => {
            scene.debugLayer.select(nodeMaterial, "INPUTS");
        });
    });
    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      engine.dispose();
    };
  }, []);

  return (
    <canvas id="renderCanvas" />
  );
}

export default Tryshader;
