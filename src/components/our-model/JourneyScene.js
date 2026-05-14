"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import TrACModel from "./TrACModel";
import { sampleAt, mixHue, mixHex } from "@/lib/journey-chapters";

/**
 * JourneyScene
 *
 * Three.js viewport for the eleven-chapter walkthrough.
 *
 * The rig reads `chapterRef` + `mouseRef` every frame and writes
 * camera + lighting + background straight out of the chapter sample.
 * No React state changes on the hot path.
 *
 * For the bird's-eye hot-spot overlay, the rig also publishes a
 * `projection` function onto `projectionRef.current` each frame. The
 * overlay reads that function and converts world XZ → screen pixels
 * so the dots ride the canvas exactly even as the building rotates /
 * scales between chapters.
 *
 * Interior chapters: an extra point light is parented to the camera
 * so the inside of the building isn't a black void when the key light
 * is rolled off. The chapter sample's `interiorFill` term controls
 * how much it contributes — high inside, zero outside.
 */
function SceneRig({ chapterRef, mouseRef, projectionRef, rooms, getActiveRoomId, getActiveRoomRect }) {
  const { camera, scene, gl } = useThree();
  const modelRef = useRef();
  const keyLightRef = useRef();
  const ambientRef = useRef();
  const fillLightRef = useRef();

  const mouseSmooth = useRef({ x: 0, y: 0 });
  const _bgColor = useRef(new THREE.Color("#fff6eb"));
  const _camTarget = useRef(new THREE.Vector3(0, 0, 0));
  const _projVec = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const c = chapterRef.current ?? 0;
    const s = sampleAt(c);

    const mx = mouseRef?.current?.x ?? 0;
    const my = mouseRef?.current?.y ?? 0;
    const k = 1 - Math.pow(0.001, Math.min(dt || 0.016, 0.1));
    mouseSmooth.current.x += (mx - mouseSmooth.current.x) * k;
    mouseSmooth.current.y += (my - mouseSmooth.current.y) * k;

    const dist = Math.hypot(s.camX - s.targetX, s.camZ - s.targetZ) || 1;
    const PARALLAX = 0.025;
    const pX = mouseSmooth.current.x * dist * PARALLAX;
    const pY = -mouseSmooth.current.y * dist * PARALLAX * 0.6;

    camera.position.set(s.camX + pX, s.camY + pY, s.camZ);
    _camTarget.current.set(s.targetX, s.targetY, s.targetZ);
    camera.lookAt(_camTarget.current);

    /* Per-chapter FOV. updateProjectionMatrix is non-trivial, so we
     * only call it when the value actually changes by > 0.05° (which
     * still keeps the lerp visually smooth). */
    const desiredFov = s.fov ?? 50;
    if (Math.abs(camera.fov - desiredFov) > 0.05) {
      camera.fov = desiredFov;
      camera.updateProjectionMatrix();
    }

    if (modelRef.current) {
      modelRef.current.rotation.y = s.modelRotY;
      modelRef.current.scale.setScalar(s.modelScale);
      modelRef.current.position.y = s.modelPosY;
    }

    const hue = mixHue(s.hueA, s.hueB, s.hueT);
    if (keyLightRef.current) {
      keyLightRef.current.intensity = s.keyIntensity;
      keyLightRef.current.color.setRGB(hue.r, hue.g, hue.b);
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = s.ambIntensity;
      ambientRef.current.color.setRGB(
        hue.r * 0.6 + 0.3,
        hue.g * 0.6 + 0.3,
        hue.b * 0.7 + 0.25
      );
    }

    /* Interior fill light — strong when the camera is low (inside
     * eye-height ≈ Y 1.1) and rolls off as we climb back to a bird's
     * eye. Keeps the building's interior legible without flooding the
     * exterior chapters with extra light. */
    if (fillLightRef.current) {
      const camY = camera.position.y;
      // 1 when y<=1.8, 0 when y>=4 — smoothstep between.
      const lo = 1.8, hi = 4.0;
      const tFill = camY <= lo ? 1 : camY >= hi ? 0 : 1 - (camY - lo) / (hi - lo);
      const eased = tFill * tFill * (3 - 2 * tFill);
      fillLightRef.current.intensity = eased * 1.6;
      fillLightRef.current.position.copy(camera.position);
      fillLightRef.current.color.setRGB(
        hue.r * 0.75 + 0.20,
        hue.g * 0.75 + 0.20,
        hue.b * 0.80 + 0.15
      );
    }

    const bg = mixHex(s.bgA, s.bgB, s.bgT);
    _bgColor.current.setRGB(bg.r, bg.g, bg.b);
    scene.background = _bgColor.current;

    if (!scene.fog) scene.fog = new THREE.Fog(_bgColor.current, 30, 60);
    scene.fog.color.copy(_bgColor.current);
    scene.fog.near = THREE.MathUtils.lerp(60, 8, s.fog);
    scene.fog.far = THREE.MathUtils.lerp(120, 28, s.fog);

    /* Publish a projection function that the React overlay can use to
     * convert world XZ → screen pixels. Cheap closure on a stable ref
     * (one allocation per frame, all the math is allocation-free). */
    if (projectionRef) {
      const canvas = gl.domElement;
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      const cam = camera;
      projectionRef.current = (wx, wy, wz) => {
        _projVec.current.set(wx, wy, wz).project(cam);
        const sx = ( _projVec.current.x * 0.5 + 0.5) * w;
        const sy = (-_projVec.current.y * 0.5 + 0.5) * h;
        return { x: sx, y: sy, inFront: _projVec.current.z < 1 };
      };
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.85} />
      <directionalLight
        ref={keyLightRef}
        position={[8, 12, 6]}
        intensity={1.4}
      />
      {/* Interior fill light — moves with the camera so corridors / room
       * walls don't black out when the key light is occluded by the
       * roof. Intensity is gated by camera height in useFrame above. */}
      <pointLight
        ref={fillLightRef}
        position={[0, 1.4, 0]}
        intensity={0}
        distance={9}
        decay={1.4}
      />

      <Suspense fallback={null}>
        <TrACModel
          modelRef={modelRef}
          chapterRef={chapterRef}
          rooms={rooms}
          getActiveRoomId={getActiveRoomId}
          getActiveRoomRect={getActiveRoomRect}
        />
      </Suspense>
    </>
  );
}

export default function JourneyScene({ chapterRef, mouseRef, projectionRef, rooms, getActiveRoomId, getActiveRoomRect }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      flat
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true,
      }}
      camera={{ fov: 50, near: 0.05, far: 200, position: [-5.6, 1.7, 7.0] }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.NoToneMapping;
      }}
    >
      <SceneRig
        chapterRef={chapterRef}
        mouseRef={mouseRef}
        projectionRef={projectionRef}
        rooms={rooms}
        getActiveRoomId={getActiveRoomId}
        getActiveRoomRect={getActiveRoomRect}
      />
    </Canvas>
  );
}
