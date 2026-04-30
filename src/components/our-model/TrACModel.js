"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/**
 * TrACModel
 *
 * Loads /models/building.glb (a real ~6m architectural building, meshopt
 * compressed). Builds two parallel material sets per source mesh — a
 * solid PBR set and a bright orange wireframe set — and crossfades them
 * via the shared `wireframeRef` ∈ [0,1].  Also fades model OPACITY via
 * `visibilityRef` ∈ [0,1] so the dark "text-only" chapters can hide the
 * model entirely.
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

    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;

      const srcName = (obj.material && obj.material.name) || "";
      const srcColor = obj.material?.color
        ? obj.material.color.clone()
        : new THREE.Color("#e8d8be");

      let solid;
      if (/glass/i.test(srcName)) {
        solid = new THREE.MeshStandardMaterial({
          color: "#a4cad8",
          roughness: 0.18,
          metalness: 0.55,
          emissive: new THREE.Color("#9CC9DD"),
          emissiveIntensity: 0.22,
        });
      } else if (/wood/i.test(srcName)) {
        solid = new THREE.MeshStandardMaterial({
          color: "#a47a4a",
          roughness: 0.85,
          metalness: 0.05,
        });
      } else if (/metal/i.test(srcName)) {
        solid = new THREE.MeshStandardMaterial({
          color: "#cdd2d6",
          roughness: 0.45,
          metalness: 0.7,
        });
      } else {
        solid = new THREE.MeshStandardMaterial({
          color: srcColor,
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
        toneMapped: false,
      });

      obj.material = solid;
      const wireMesh = new THREE.Mesh(obj.geometry, wire);
      wireMesh.position.copy(obj.position);
      wireMesh.rotation.copy(obj.rotation);
      wireMesh.scale.copy(obj.scale);
      wireMesh.scale.multiplyScalar(1.001);
      obj.parent.add(wireMesh);

      solidMats.current.push(solid);
      wireMats.current.push(wire);
    });
  }, [scene]);

  /* Per-frame: blend solid↔wire opacity AND apply global visibility fade. */
  useFrame(() => {
    const w = wireframeRef.current ?? 0;
    const v = visibilityRef.current ?? 1;
    const solidA = (1 - w * 0.85) * v;
    const wireA = w * v;
    for (const m of solidMats.current) m.opacity = solidA;
    for (const m of wireMats.current) m.opacity = wireA;
  });

  return (
    <>
      {/* Subtle ground disc */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial color="#c9a878" roughness={0.95} />
      </mesh>

      <group ref={modelRef}>
        <primitive object={scene} scale={SCALE} position={[0, 0, 0]} />
      </group>
    </>
  );
}
