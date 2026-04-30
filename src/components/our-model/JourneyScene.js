"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import TrACModel from "./TrACModel";
import { sampleAt, mixHue, mixHex } from "@/lib/journey-chapters";

/**
 * SceneRig
 *
 * Reads the chapterRef (continuous fractional 0..N-1) every frame and
 * applies the SAMPLED scene state — camera, model rotation, lights, fog,
 * background, wireframe blend, model visibility.
 *
 * EVERY visual property in the WebGL scene flows from a single source of
 * truth: `chapterRef.current`. Same chapter index → same scene, every
 * time.
 */
function SceneRig({ chapterRef, wireframeRef, visibilityRef }) {
  const { camera, scene } = useThree();
  const modelRef = useRef();
  const keyLightRef = useRef();
  const fillLightRef = useRef();
  const ambientRef = useRef();

  const _bgColor = useRef(new THREE.Color("#fff6eb"));
  const _camTarget = useRef(new THREE.Vector3(0, 2.4, 0));

  useFrame(() => {
    const c = chapterRef.current ?? 0;
    const s = sampleAt(c);

    camera.position.set(s.camX, s.camY, s.camZ);
    _camTarget.current.set(s.targetX, s.targetY, s.targetZ);
    camera.lookAt(_camTarget.current);

    if (modelRef.current) {
      modelRef.current.rotation.y = s.modelRotY;
      modelRef.current.scale.setScalar(s.modelScale);
      modelRef.current.position.y = s.modelPosY;
    }

    wireframeRef.current = s.wireframe;
    visibilityRef.current = s.modelVisible;

    const hue = mixHue(s.hueA, s.hueB, s.hueT);
    if (keyLightRef.current) {
      keyLightRef.current.intensity = s.keyIntensity;
      keyLightRef.current.color.setRGB(hue.r, hue.g, hue.b);
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = s.keyIntensity * 0.5;
      fillLightRef.current.color.setRGB(hue.r * 0.85, hue.g * 0.9, hue.b * 1.0);
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = s.ambIntensity;
      ambientRef.current.color.setRGB(
        hue.r * 0.7 + 0.2,
        hue.g * 0.7 + 0.2,
        hue.b * 0.8 + 0.2
      );
    }

    const bg = mixHex(s.bgA, s.bgB, s.bgT);
    _bgColor.current.setRGB(bg.r, bg.g, bg.b);
    scene.background = _bgColor.current;

    if (!scene.fog) scene.fog = new THREE.Fog(_bgColor.current, 14, 50);
    scene.fog.color.copy(_bgColor.current);
    scene.fog.near = THREE.MathUtils.lerp(40, 6, s.fog);
    scene.fog.far = THREE.MathUtils.lerp(80, 20, s.fog);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.65} />
      <directionalLight
        ref={keyLightRef}
        position={[8, 12, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight ref={fillLightRef} position={[-6, 5, -4]} intensity={0.6} />
      <hemisphereLight args={["#ffd9a8", "#3b2a18", 0.35]} />

      <Suspense fallback={null}>
        <TrACModel
          modelRef={modelRef}
          wireframeRef={wireframeRef}
          visibilityRef={visibilityRef}
        />
      </Suspense>
    </>
  );
}

export default function JourneyScene({ chapterRef }) {
  const wireframeRef = useRef(0);
  const visibilityRef = useRef(1);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 38, near: 0.1, far: 200, position: [6, 4, 12.5] }}
    >
      <SceneRig
        chapterRef={chapterRef}
        wireframeRef={wireframeRef}
        visibilityRef={visibilityRef}
      />
    </Canvas>
  );
}
