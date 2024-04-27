import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';

const Waterpool = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new BABYLON.Engine(canvasRef.current);
      var scene = new BABYLON.Scene(engine);
      var createScene = async function () {
        // Your existing Babylon.js code here...
        const groundColor = new BABYLON.Color4(0.4, 1.5, 0.3, 1.0);
        const shadowColor = new BABYLON.Color4(0.4, 1.5, 0.3, 1.0);
        const lights = {};
        const env = {};
        const camera = {};

        async function initScene() {
            // color of scene set to match the ground plane so the edges of the ground are invisible
            scene.clearColor = groundColor;
    
            // standard ArcRotate camera
            camera.main = new BABYLON.ArcRotateCamera("camera", 1.0332, 0.9753, 0.1444, new BABYLON.Vector3(0.0, 0.015, 0.0), scene);
            camera.main.wheelDeltaPercentage = 0.08;
            // camera.main.attachControl(canvas, true);
    
            // set limits on camera to prevent clipping as well as keep the user close to the mesh
            camera.main.minZ = 0.001;
            camera.main.lowerRadiusLimit = 0.1;
            camera.main.upperRadiusLimit = 0.3;
            camera.main.upperBetaLimit = 1.25;
    
            // add in IBL with linked environment
            env.lighting = BABYLON.CubeTexture.CreateFromPrefilteredData("https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/env/kloofendal_pureSky.env", scene);
            env.lighting.name = "sky";
            env.lighting.gammaSpace = false;
            env.lighting.rotationY = 4.0823;
            scene.environmentTexture = env.lighting;
    
            // directional light needed for shadows and some highlights on the water mesh
            lights.dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0.45, -0.34, -0.83), scene);
            lights.dirLight.position = new BABYLON.Vector3(0, .1, .05);
            lights.dirLight.shadowMinZ = 0.01;
            lights.dirLight.shadowMaxZ = 0.15;
            lights.dirLight.intensity = 1; 

        }   
    
        // load or create meshes in scene
        const meshes = {};
        async function loadMeshes() {
            // load pool asset which is three meshes separated to help cull unneeded meshes from render target texture
            meshes.poolAsset = await BABYLON.SceneLoader.AppendAsync("https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/gltf/", "pool.glb", scene);
            meshes.pool = scene.getMeshByName("pool_low");
            meshes.groundTiles = scene.getMeshByName("groundTiles_low");
            meshes.ground = scene.getMeshByName("ground_low");
            meshes.water = scene.getMeshByName("waterSurface_low");
            meshes.waterRatio = (meshes.water._boundingInfo.maximum.x - meshes.water._boundingInfo.minimum.x) / (meshes.water._boundingInfo.maximum.z - meshes.water._boundingInfo.minimum.z);
    
            // include only ground mesh in directional light
            lights.dirLight.includedOnlyMeshes.push(meshes.ground);
            lights.dirLight.includedOnlyMeshes.push(meshes.water);
        }
    
        // ignore textures embedded in shader when loading
        BABYLON.NodeMaterial.IgnoreTexturesAtLoadTime = true;
        const meshesMats = {};
        const textures = {};
        async function createMaterials() {
            //load noise textures
            textures.noise = new BABYLON.Texture("https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/textures/noiseTextures_noise.png", scene);
            textures.noiseNormal = new BABYLON.Texture("https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/textures/noiseTextures_normal.png", scene);
    
            // create water node material
            meshesMats.water = new BABYLON.NodeMaterial("waterNodeMat", scene, { emitComments: false });
            await meshesMats.water.loadAsync("https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/shaders/waterShader.json");
            meshesMats.water.build(false);
    
            // grab blocks and set default values
            meshesMats.noiseTex = meshesMats.water.getBlockByName("noiseTex");
            meshesMats.noiseTex.texture = textures.noise;
            meshesMats.waterRatio = meshesMats.water.getBlockByName("waterRatio");
            meshesMats.waterRatio.value = meshes.waterRatio;
            meshesMats.rtTex = meshesMats.water.getBlockByName("rtTex");
            meshesMats.noiseNormal = meshesMats.water.getBlockByName("noiseNormalTex");
            meshesMats.noiseNormal.texture = textures.noiseNormal;
            meshes.water.material.dispose();
            meshes.water.material = meshesMats.water;
    
            // create ground node material
            meshesMats.ground = new BABYLON.NodeMaterial("groundNodeMat", scene, { emitComments: false });
            await meshesMats.ground.loadAsync("https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/shaders/groundShader.json");
            meshesMats.ground.build(false);
    
            // grab blocks and set default values
            meshesMats.groundColor = meshesMats.ground.getBlockByName("groundColor");
            meshesMats.groundColor.value = groundColor;
            meshesMats.shadowColor = meshesMats.ground.getBlockByName("shadowColor");
            meshesMats.shadowColor = shadowColor;
    
            // assign material to mesh
            meshes.ground.material = meshesMats.ground;
        }
    
        // generate shadows in scene
        const shadows = {};
        function generateShadows() {
            // create shadow generator
            shadows.shadowGenerator = new BABYLON.ShadowGenerator(512, lights.dirLight);
    
            // set up soft shadows
            shadows.shadowGenerator.useContactHardeningShadow = true;
            shadows.shadowGenerator.contactHardeningLightSizeUVRatio = 0.07;
    
            // add shadow casters and what meshes receive shadows
            shadows.shadowGenerator.addShadowCaster(meshes.groundTiles);
            meshes.ground.receiveShadows = true;
        }
    
        // create render target texture
        const rtt = {};
        function createRTT() {
            // create render target texture
            rtt.texture = new BABYLON.RenderTargetTexture("waterRefraction", { ratio: engine.getRenderWidth()/engine.getRenderHeight() }, scene)
    
            // add rtt to scene custom render targets. If this is not done, the RTT will not render anything
            scene.customRenderTargets.push(rtt.texture);
    
            // choose which meshes will render in RTT which helps refraction not show incorrect elements
            rtt.texture.renderList.push(meshes.pool);
            rtt.texture.renderList.push(meshes.ground);
    
            // assign RTT to node material for water which is used for distortion to simulate refraction
            meshesMats.rtTex.texture = rtt.texture;
        }
    
        // scene logic
        initScene()
        await loadMeshes();
        await createMaterials();
        generateShadows();
        createRTT();

      };

      createScene();

      engine.runRenderLoop(function () {
        if (scene) {
          scene.render();
        }
      });

      window.addEventListener('resize', function () {
        engine.resize();
      });
    }
  }, []);

  return <canvas ref={canvasRef} />;
};

export default Waterpool;
