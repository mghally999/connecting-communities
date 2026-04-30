"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/**
 * TrACModel
 *
 * Loads /models/building.glb and applies brand-styled PBR materials
 * with a separate orange wireframe overlay per mesh. Crossfade between
 * solid + wireframe via opacity. Wireframe uses polygonOffset and
 * depthWrite:false to avoid z-fighting and occlusion.
 */

const BUILDING_URL = "/models/building.glb";
const SCALE = 0.85;
const BRAND_ORANGE = "#FD542B";

function attachMeshopt(loader) {
  loader.setMeshoptDecoder(MeshoptDecoder);
}

export default function TrACModel({ wireframeRef, visibilityRef, modelRef }) {
  const gltf = useLoader(GLTFLoader, BUILDING_URL, attachMeshopt);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);

  const solidMats = useRef([]);
  const wireMats = useRef([]);

  useEffect(() => {
    solidMats.current = [];
    wireMats.current = [];

    const meshes = [];
    scene.traverse((obj) => { if (obj.isMesh) meshes.push(obj); });

    for (const obj of meshes) {
      obj.castShadow = true;
      obj.receiveShadow = true;
      const srcName = (obj.material && obj.material.name) || "";

      let solid;
      if (/glass/i.test(srcName)) {
        solid = new THREE.MeshStandardMaterial({
          color: "#a4cad8",
          roughness: 0.18,
          metalness: 0.55,
          emissive: new THREE.Color("#9CC9DD"),
          emissiveIntensity: 0.18,
        });
      } else if (/wood/i.test(srcName)) {
        solid = new THREE.MeshStandardMaterial({
          color: "#a47a4a",
          roughness: 0.85,
          metalness: 0.05,
        });
      } else if (/metal/i.test(srcName)) {
        solid = new THREE.MeshStandardMaterial({
          color: "#cfd4d8",
          roughness: 0.45,
          metalness: 0.7,
        });
      } else {
        solid = new THREE.MeshStandardMaterial({
          color: "#dccfb6",
          roughness: 0.7,
          metalness: 0.1,
        });
      }
      solid.transparent = true;
      solid.opacity = 1;
      solid.needsUpdate = true;

      const wire = new THREE.MeshBasicMaterial({
        color: BRAND_ORANGE,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        toneMapped: false,
      });

      obj.material = solid;
      const wireMesh = new THREE.Mesh(obj.geometry, wire);
      wireMesh.name = obj.name + "_wire";
      obj.add(wireMesh);

      solidMats.current.push(solid);
      wireMats.current.push(wire);
    }
  }, [scene]);

  useFrame(() => {
    const w = wireframeRef.current ?? 0;
    const v = visibilityRef.current ?? 1;
    const solidA = THREE.MathUtils.clamp((1 - w) * v, 0, 1);
    const wireA = THREE.MathUtils.clamp(w * v, 0, 1);
    for (const m of solidMats.current) m.opacity = solidA;
    for (const m of wireMats.current) m.opacity = wireA;
  });

  return (
    <>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[24, 64]} />
        <meshStandardMaterial color="#c9a878" roughness={0.95} />
      </mesh>

      <group ref={modelRef}>
        <primitive object={scene} scale={SCALE} position={[0, 0, 0]} />
      </group>
    </>
  );
}
