import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';

const Particle1 = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            const engine = new BABYLON.Engine(canvasRef.current);
            const scene = new BABYLON.Scene(engine);

            // Setup environment
            const camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 20, new BABYLON.Vector3(0, 0, 0), scene);
            camera.attachControl(canvasRef.current, true);
            camera.wheelPrecision = 100;
            const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, -1), scene);

            const SPS = new BABYLON.SolidParticleSystem("SPS", scene);
    const sphere = BABYLON.MeshBuilder.CreateSphere("s", {});
    const poly = BABYLON.MeshBuilder.CreatePolyhedron("p", { type: 2 });
    SPS.addShape(sphere, 20); // 20 spheres
    SPS.addShape(poly, 120); // 120 polyhedrons
    SPS.addShape(sphere, 80); // 80 other spheres
    sphere.dispose(); //dispose of original model sphere
    poly.dispose(); //dispose of original model poly

    const mesh = SPS.buildMesh(); // finally builds and displays the SPS mesh
    
    // initiate particles function
    SPS.initParticles = () => {
        for (let p = 0; p < SPS.nbParticles; p++) {
            const particle = SPS.particles[p];
      	    particle.position.x = BABYLON.Scalar.RandomRange(-20, 20);
            particle.position.y = BABYLON.Scalar.RandomRange(-20, 20);
            particle.position.z = BABYLON.Scalar.RandomRange(-20, 20);
            particle.color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        }
    };

    //Update SPS mesh
    SPS.initParticles();
    SPS.setParticles();
    var faceColors = [];
	faceColors[0] = BABYLON.Color3.Blue();
	faceColors[1] = BABYLON.Color3.White()
	faceColors[2] = BABYLON.Color3.Red();
	faceColors[3] = BABYLON.Color3.Black();   
	faceColors[4] = BABYLON.Color3.Green();
	faceColors[5] = BABYLON.Color3.Yellow();
 
	var box = BABYLON.MeshBuilder.CreateBox("cone", {faceColors:faceColors, size:2}, scene, true);
    box.material = new BABYLON.StandardMaterial("", scene);

    //Create a manager for the player's sprite animation
    var pcs= new BABYLON.PointsCloudSystem("pcs", 5, scene) 

    pcs.addVolumePoints(box, 10000, BABYLON.PointColor.Color);
    pcs.buildMeshAsync().then(() => box.dispose());
    box.dispose();

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

export default Particle1;
