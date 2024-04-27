import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders'; // Don't forget to import the loaders
// import './water.fragment.fx'
// import '../water.vertex.fx'
import './babyl.css'
function BabylonScene() {
    const reactCanvas = useRef(null);

    useEffect(() => {
        const engine = new BABYLON.Engine(reactCanvas.current);
        const scene = new BABYLON.Scene(engine);

        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(reactCanvas.current, true);

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 512, height: 512, subdivisions: 32 }, scene);

        // var plane = BABYLON.MeshBuilder.CreatePlane("plane", {});

        var shader = new BABYLON.ShaderMaterial(
            "shader", 
            scene, 
            "./water", 
            {
                attributes: ["position", "uv"],
                uniforms: ["worldViewProjection"],
                samplers: ["textureSampler"],
            }
        );
        
        const amigaTexture = new BABYLON.Texture("./crate.png", scene);
        shader.setTexture("textureSampler", amigaTexture);
        ground.material = shader;
        
        BABYLON.SceneLoader.ImportMesh("", "./beer_mug/scene.gltf", "", scene, function (newMeshes) {
            // This function will be called when the model is loaded
            scene.createDefaultCameraOrLight(true, true, true);
        });
        engine.runRenderLoop(() => {
            if (scene) {
                scene.render();
            }
        });

        return () => {
            if (scene) {
                scene.dispose();
            }
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    return (
        <canvas ref={reactCanvas} />
    );
}

export default BabylonScene;
