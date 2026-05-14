"use client";

import { useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import TrACModel from "@/components/our-model/TrACModel";
import { ROOM_RECTS_LIST } from "@/lib/journey-chapters";

/**
 * RoomScene — three.js viewport for /our-model-2.
 *
 * Shares its TrACModel with /our-model (same building.glb, same
 * auto-fit, same BUILDING_ROT_Y), but drives the camera from a
 * `cameraStateRef` that the parent tweens between rooms.
 *
 * No room highlight on /our-model-2 — the click-to-walk interaction
 * is enough wayfinding, and a ring would compete with the beacons.
 * TrACModel happily skips its highlight + dimmer overlays when the
 * relevant props aren't supplied.
 */

function SceneRig({ cameraStateRef, projectionRef }) {
  const { camera, gl, scene } = useThree();
  const fillLightRef = useRef();
  const _v = useRef(new THREE.Vector3());
  const _t = useRef(new THREE.Vector3());
  const _bg = useRef(new THREE.Color("#06080d"));

  useFrame(() => {
    const s = cameraStateRef?.current;
    if (!s) return;
    camera.position.set(s.camX, s.camY, s.camZ);
    _t.current.set(s.tgtX, s.tgtY, s.tgtZ);
    camera.lookAt(_t.current);

    /* Per-room FOV. Same gate as the cinematic — only update the
     * projection matrix when it actually changes. */
    const desiredFov = s.fov ?? 50;
    if (Math.abs(camera.fov - desiredFov) > 0.05) {
      camera.fov = desiredFov;
      camera.updateProjectionMatrix();
    }

    /* Fill light gated by camera height. */
    if (fillLightRef.current) {
      const lo = 2.0, hi = 6.0;
      const camY = camera.position.y;
      const k = camY <= lo ? 1 : camY >= hi ? 0 : 1 - (camY - lo) / (hi - lo);
      const eased = k * k * (3 - 2 * k);
      fillLightRef.current.intensity = eased * 1.4;
      fillLightRef.current.position.copy(camera.position);
    }

    _bg.current.setRGB(0.04, 0.05, 0.07);
    scene.background = _bg.current;

    if (projectionRef) {
      const canvas = gl.domElement;
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      const cam = camera;
      projectionRef.current = (wx, wy, wz) => {
        _v.current.set(wx, wy, wz).project(cam);
        const sx = ( _v.current.x * 0.5 + 0.5) * w;
        const sy = (-_v.current.y * 0.5 + 0.5) * h;
        return { x: sx, y: sy, inFront: _v.current.z < 1 };
      };
    }
  });

  /* We DON'T pass rooms / getActiveRoomId / getActiveRoomRect, so
   * TrACModel skips the highlight + dimmer overlays. The beacons
   * are the wayfinding on this page. */
  return (
    <>
      <ambientLight intensity={0.85} color="#fff2dc" />
      <directionalLight position={[8, 12, 6]} intensity={1.35} color="#ffe7b3" />
      <pointLight
        ref={fillLightRef}
        position={[0, 1.4, 0]}
        intensity={0}
        distance={12}
        decay={1.4}
        color="#ffd9a8"
      />
      <Suspense fallback={null}>
        <TrACModel />
      </Suspense>
    </>
  );
}

export default function RoomScene({ cameraStateRef, projectionRef }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      flat
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
      }}
      camera={{ fov: 48, near: 0.05, far: 200, position: [0, 3, 12] }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.NoToneMapping;
      }}
    >
      <SceneRig
        cameraStateRef={cameraStateRef}
        projectionRef={projectionRef}
      />
    </Canvas>
  );
}
