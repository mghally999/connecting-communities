"use client";

import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/**
 * TrACModelLight
 *
 * A lighter wrapper around building.glb tuned for the cinematic scene.
 *
 * Differences from the regular TrACModel:
 *   - No dimmer overlays / no highlight ring (CinematicScene draws its
 *     own bloom-friendly versions).
 *   - Materials are flagged toneMapped so the ACES filmic tone map +
 *     bloom pass land cleanly on them.
 *   - Same TIGHT_OFFSET / FIT_SIZE calibration so the building's
 *     centre matches Model 1 / Model 2 exactly.
 */

const BUILDING_URL = "/models/building.glb";

const TIGHT_OFFSET_X = 1.45;
const TIGHT_OFFSET_Z = -2.94;
const FIT_SIZE = 18.0;

function attachMeshopt(loader) {
  loader.setMeshoptDecoder(MeshoptDecoder);
}

function autoFitTransform(scene) {
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const longestHoriz = Math.max(size.x, size.z) || 1;
  const scale = FIT_SIZE / longestHoriz;
  return {
    scale,
    tx: (-center.x - TIGHT_OFFSET_X) * scale,
    ty: -box.min.y * scale,
    tz: (-center.z - TIGHT_OFFSET_Z) * scale,
  };
}

export default function TrACModelLight() {
  const gltf = useLoader(GLTFLoader, BUILDING_URL, attachMeshopt);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
  const fit = useMemo(() => autoFitTransform(scene), [scene]);

  useEffect(() => {
    const owned = [];
    const cache = new Map();
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = false;
      obj.receiveShadow = false;
      obj.frustumCulled = true;
      const dedupe = (m) => {
        if (!m) return m;
        const hit = cache.get(m.uuid);
        if (hit) return hit;
        const c = m.clone();
        c.side = THREE.DoubleSide;
        c.transparent = false;
        c.toneMapped = true;
        c.depthWrite = true;
        c.needsUpdate = true;
        cache.set(m.uuid, c);
        owned.push(c);
        return c;
      };
      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map(dedupe);
      } else {
        obj.material = dedupe(obj.material);
      }
    });
    return () => owned.forEach((d) => d.dispose && d.dispose());
  }, [scene]);

  return (
    <>
      {/* Sand-coloured ground disc — warmer than the model 1/2 cream so
       *  it reads as evening earth under the golden-hour key light. */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color="#8c6a45" roughness={1.0} metalness={0} />
      </mesh>

      <group position={[fit.tx, fit.ty, fit.tz]} scale={fit.scale}>
        <primitive object={scene} />
      </group>
    </>
  );
}
