"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import TrACModel from "./TrACModel";
import Globe from "./Globe";
import { sampleAt, mixHue, mixHex } from "@/lib/journey-chapters";

/**
 * SceneRig
 *
 * Reads chapterRef + mouseRef every frame and applies the sampled
 * scene state. Both the Globe and the building Model are mounted at
 * once; their visibility is faded via shared refs so the whole
 * 9-chapter timeline is one continuous shot.
 *
 * Mouse parallax: when the mouse moves, the camera offsets by a
 * small fraction of its distance from target. Smoothed for a lazy
 * cinematic feel.
 */
function SceneRig({ chapterRef, mouseRef, wireframeRef, modelVisibilityRef, globeRotRef, globeVisRef }) {
  const { camera, scene } = useThree();
  const modelRef = useRef();
  const globeRef = useRef();
  const keyLightRef = useRef();
  const fillLightRef = useRef();
  const ambientRef = useRef();

  const mouseSmooth = useRef({ x: 0, y: 0 });
  const _bgColor = useRef(new THREE.Color("#04060a"));
  const _camTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, dt) => {
    const c = chapterRef.current ?? 0;
    const s = sampleAt(c);

    const mx = mouseRef?.current?.x ?? 0;
    const my = mouseRef?.current?.y ?? 0;
    const k = 1 - Math.pow(0.001, Math.min(dt || 0.016, 0.1));
    mouseSmooth.current.x += (mx - mouseSmooth.current.x) * k;
    mouseSmooth.current.y += (my - mouseSmooth.current.y) * k;

    const dist = Math.hypot(s.camX, s.camZ) || 1;
    const PARALLAX = 0.035;
    const pX = mouseSmooth.current.x * dist * PARALLAX;
    const pY = -mouseSmooth.current.y * dist * PARALLAX * 0.6;

    camera.position.set(s.camX + pX, s.camY + pY, s.camZ);
    _camTarget.current.set(s.targetX, s.targetY, s.targetZ);
    camera.lookAt(_camTarget.current);

    if (modelRef.current) {
      modelRef.current.rotation.y = s.modelRotY;
      modelRef.current.scale.setScalar(s.modelScale);
      modelRef.current.position.y = s.modelPosY;
    }

    wireframeRef.current = s.wireframe;
    modelVisibilityRef.current = s.modelVisible;
    globeRotRef.current = s.globeRotY;
    globeVisRef.current = s.globeVisible;

    const hue = mixHue(s.hueA, s.hueB, s.hueT);
    if (keyLightRef.current) {
      keyLightRef.current.intensity = s.keyIntensity;
      keyLightRef.current.color.setRGB(hue.r, hue.g, hue.b);
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = s.keyIntensity * 0.55;
      fillLightRef.current.color.setRGB(hue.r * 0.85, hue.g * 0.9, hue.b * 1.0);
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = s.ambIntensity;
      ambientRef.current.color.setRGB(
        hue.r * 0.6 + 0.3,
        hue.g * 0.6 + 0.3,
        hue.b * 0.7 + 0.25
      );
    }

    const bg = mixHex(s.bgA, s.bgB, s.bgT);
    _bgColor.current.setRGB(bg.r, bg.g, bg.b);
    scene.background = _bgColor.current;

    if (!scene.fog) scene.fog = new THREE.Fog(_bgColor.current, 14, 50);
    scene.fog.color.copy(_bgColor.current);
    scene.fog.near = THREE.MathUtils.lerp(40, 6, s.fog);
    scene.fog.far = THREE.MathUtils.lerp(80, 22, s.fog);
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
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight ref={fillLightRef} position={[-6, 5, -4]} intensity={0.6} />
      <hemisphereLight args={["#ffd9a8", "#3b2a18", 0.4]} />

      <Suspense fallback={null}>
        <Globe
          rotationRef={globeRotRef}
          visibilityRef={globeVisRef}
          globeRef={globeRef}
        />
        <TrACModel
          modelRef={modelRef}
          wireframeRef={wireframeRef}
          visibilityRef={modelVisibilityRef}
        />
      </Suspense>
    </>
  );
}

export default function JourneyScene({ chapterRef, mouseRef }) {
  const wireframeRef = useRef(0);
  const modelVisibilityRef = useRef(0);
  const globeRotRef = useRef(0);
  const globeVisRef = useRef(1);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 38, near: 0.1, far: 200, position: [0, 0, 22] }}
    >
      <SceneRig
        chapterRef={chapterRef}
        mouseRef={mouseRef}
        wireframeRef={wireframeRef}
        modelVisibilityRef={modelVisibilityRef}
        globeRotRef={globeRotRef}
        globeVisRef={globeVisRef}
      />
    </Canvas>
  );
}
