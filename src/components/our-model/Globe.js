"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Globe
 *
 * Photorealistic earth built procedurally from JPG textures supplied by
 * the client (Diffuse / Bump / Clouds / Night-lights / Ocean-mask).
 *
 * Composition:
 *   - Inner sphere: planet surface with day-time diffuse map and a
 *     bump map. Night-lights texture is mixed on the dark side using
 *     the directional light vector.
 *   - Outer sphere (slightly larger): cloud layer with a separate
 *     rotation rate for parallax.
 *   - Atmosphere glow: third sphere using a soft additive shader for
 *     the rim glow.
 *
 * The component reads `globeRotYRef` and `globeVisibilityRef` every
 * frame and applies them; opacity fades in/out, rotation drives the
 * spin. This lets the journey timeline keyframes control the globe
 * the same way they control the building.
 */

const TEX = {
  diffuse: "/textures/earth-diffuse.jpg",
  bump:    "/textures/earth-bump.jpg",
  clouds:  "/textures/earth-clouds.jpg",
  lights:  "/textures/earth-lights.jpg",
};

const RADIUS = 5.0;

export default function Globe({ rotationRef, visibilityRef, globeRef }) {
  const [diffuseMap, bumpMap, cloudsMap, lightsMap] = useLoader(THREE.TextureLoader, [
    TEX.diffuse, TEX.bump, TEX.clouds, TEX.lights,
  ]);

  // sRGB color space for the diffuse + lights so colors look right
  useEffect(() => {
    [diffuseMap, lightsMap].forEach((t) => {
      if (!t) return;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
    [bumpMap, cloudsMap].forEach((t) => {
      if (!t) return;
      t.anisotropy = 8;
    });
  }, [diffuseMap, bumpMap, cloudsMap, lightsMap]);

  /* Earth surface material — uses an `onBeforeCompile` to inject a
   * night-lights blend on the unlit side. Standard PBR otherwise. */
  const earthMaterial = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: diffuseMap,
      bumpMap,
      bumpScale: 0.04,
      roughness: 0.85,
      metalness: 0.0,
      transparent: true,
    });

    // Inject the night-lights blend.
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uLightsMap = { value: lightsMap };
      shader.uniforms.uSunDir = { value: new THREE.Vector3(1, 0, 0) };
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `
          #include <common>
          uniform sampler2D uLightsMap;
          uniform vec3 uSunDir;
          `
        )
        .replace(
          "#include <dithering_fragment>",
          `
          #include <dithering_fragment>
          // Mix in night lights on the unlit side
          vec3 N = normalize(vNormal);
          float sunAmt = dot(N, normalize(uSunDir));
          float darkness = smoothstep(0.05, -0.25, sunAmt);
          vec3 nightCol = texture2D(uLightsMap, vMapUv).rgb;
          gl_FragColor.rgb += nightCol * darkness * 1.4;
          `
        );
      m.userData.shader = shader;
    };

    return m;
  }, [diffuseMap, bumpMap, lightsMap]);

  /* Atmosphere glow — additive shader on a slightly larger sphere */
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float uOpacity;
        void main() {
          float intensity = pow(0.85 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          vec3 col = vec3(0.45, 0.78, 1.0) * intensity;
          gl_FragColor = vec4(col, uOpacity * intensity);
        }
      `,
    });
  }, []);

  const cloudsMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      alphaMap: cloudsMap,
      roughness: 1.0,
      metalness: 0.0,
    });
  }, [cloudsMap]);

  const earthRef = useRef();
  const cloudsRef = useRef();
  const atmRef = useRef();
  const groupRef = useRef();

  /* Sun direction — points from the world's directional light. We use
   * a fixed direction here for visual clarity (sun roughly to the
   * right). */
  const sunDir = useMemo(() => new THREE.Vector3(1.0, 0.3, 0.5).normalize(), []);

  useFrame((state) => {
    const rot = rotationRef.current ?? 0;
    const vis = visibilityRef.current ?? 1;

    if (groupRef.current) {
      groupRef.current.rotation.y = rot;
      // Visibility fade — also drives material opacity
      groupRef.current.visible = vis > 0.001;
    }
    if (earthRef.current && earthMaterial) {
      earthMaterial.opacity = vis;
      earthMaterial.transparent = vis < 0.999;
      // Update shader sunDir
      const shader = earthMaterial.userData.shader;
      if (shader) shader.uniforms.uSunDir.value.copy(sunDir);
    }
    if (cloudsRef.current && cloudsMaterial) {
      cloudsMaterial.opacity = 0.35 * vis;
      // Clouds drift slightly faster than the surface
      cloudsRef.current.rotation.y = rot * 1.08 + state.clock.elapsedTime * 0.015;
    }
    if (atmRef.current && atmosphereMaterial) {
      atmosphereMaterial.uniforms.uOpacity.value = 0.85 * vis;
    }
  });

  return (
    <group ref={(g) => { groupRef.current = g; if (globeRef) globeRef.current = g; }}>
      {/* Atmosphere */}
      <mesh ref={atmRef} scale={1.06}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>

      {/* Clouds layer */}
      <mesh ref={cloudsRef} scale={1.012}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <primitive object={cloudsMaterial} attach="material" />
      </mesh>

      {/* Earth surface */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[RADIUS, 96, 96]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>
    </group>
  );
}
