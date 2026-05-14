"use client";

import { useRef, useMemo, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import TrACModelLight from "./TrACModelLight";
import { CINEMATIC_CHAPTERS, highlightRectAt, lerp, lerpHexRgb } from "@/lib/cinematic-chapters";

/**
 * CinematicScene
 *
 * The high-polish Three.js viewport for /our-model-3. Differences vs.
 * Model 1's JourneyScene:
 *
 *   1. **Continuous tween between target chapters** — `targetRef.current`
 *      is the integer chapter the page wants to be on, `progressRef`
 *      is a smoothly interpolated float that catches up. The camera +
 *      lights + bg sample CINEMATIC_CHAPTERS at progressRef each frame.
 *
 *   2. **Camera drift** — each chapter declares (ax, az, ay, speed) and
 *      the rig adds a continuous sinusoidal offset to camera position
 *      so the frame is never frozen. This is the most-felt-but-least-
 *      named technique that makes Pyramids of Meroë feel alive.
 *
 *   3. **Bloom-glow post-processing** — a second offscreen render of
 *      the scene through a brightness threshold + 3-pass gaussian blur
 *      is composited back over the base render. No external lib — we
 *      use three.js's own effect-composer-equivalent built from
 *      ShaderMaterials so the bundle stays small.
 *
 *   4. **Vignette + film grain + dust particles** — additional fullscreen
 *      quad over the bloom, parameters chapter-driven.
 *
 *   5. **Highlight ring on active room** — same idea as Model 1 but
 *      with a soft bloom-friendly emissive material so it ignites
 *      under the bloom pass.
 *
 * The whole thing runs at the requested DPR and falls back gracefully
 * if WebGL2 is unavailable (the SafeBoundary in the parent renders
 * the static fallback).
 */

/* ---------------------------------------------------------------------- */
/* Shaders                                                                 */
/* ---------------------------------------------------------------------- */

const COPY_SHADER = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() { gl_FragColor = texture2D(tDiffuse, vUv); }
  `,
};

const BRIGHT_SHADER = {
  uniforms: {
    tDiffuse:  { value: null },
    threshold: { value: 0.7 },
    smoothing: { value: 0.18 },
  },
  vertexShader: COPY_SHADER.vertexShader,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float threshold;
    uniform float smoothing;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      float luma = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      float w = smoothstep(threshold - smoothing, threshold + smoothing, luma);
      gl_FragColor = vec4(c.rgb * w, 1.0);
    }
  `,
};

const BLUR_SHADER = {
  uniforms: {
    tDiffuse:   { value: null },
    direction:  { value: new THREE.Vector2(1.0, 0.0) },
    resolution: { value: new THREE.Vector2(1024, 1024) },
  },
  vertexShader: COPY_SHADER.vertexShader,
  /* 9-tap gaussian. Cheap enough for mobile, wide enough for a real glow. */
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 direction;
    uniform vec2 resolution;
    varying vec2 vUv;
    void main() {
      vec2 pix = direction / resolution;
      vec4 sum = vec4(0.0);
      sum += texture2D(tDiffuse, vUv - pix * 4.0) * 0.05;
      sum += texture2D(tDiffuse, vUv - pix * 3.0) * 0.09;
      sum += texture2D(tDiffuse, vUv - pix * 2.0) * 0.12;
      sum += texture2D(tDiffuse, vUv - pix * 1.0) * 0.15;
      sum += texture2D(tDiffuse, vUv              ) * 0.18;
      sum += texture2D(tDiffuse, vUv + pix * 1.0) * 0.15;
      sum += texture2D(tDiffuse, vUv + pix * 2.0) * 0.12;
      sum += texture2D(tDiffuse, vUv + pix * 3.0) * 0.09;
      sum += texture2D(tDiffuse, vUv + pix * 4.0) * 0.05;
      gl_FragColor = sum;
    }
  `,
};

const COMPOSITE_SHADER = {
  uniforms: {
    tBase:     { value: null },
    tBloom:    { value: null },
    bloomMul:  { value: 0.75 },
    vignette:  { value: 0.42 },
    grain:     { value: 0.05 },
    time:      { value: 0.0 },
  },
  vertexShader: COPY_SHADER.vertexShader,
  fragmentShader: `
    uniform sampler2D tBase;
    uniform sampler2D tBloom;
    uniform float bloomMul;
    uniform float vignette;
    uniform float grain;
    uniform float time;
    varying vec2 vUv;
    /* fast deterministic hash for grain */
    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }
    void main() {
      vec3 base = texture2D(tBase, vUv).rgb;
      vec3 bloom = texture2D(tBloom, vUv).rgb;
      vec3 c = base + bloom * bloomMul;
      /* Vignette — soft radial darkening from the edges. */
      vec2 d = vUv - 0.5;
      float v = 1.0 - dot(d, d) * vignette * 3.4;
      v = clamp(v, 0.0, 1.0);
      c *= mix(1.0, v, vignette);
      /* Grain — animated by time so it shimmers like film. */
      float n = (rand(vUv * 800.0 + time) - 0.5) * grain;
      c += n;
      gl_FragColor = vec4(c, 1.0);
    }
  `,
};

/* ---------------------------------------------------------------------- */
/* Particles — slow drifting dust motes catching the light                  */
/* ---------------------------------------------------------------------- */

function DustField({ count = 220 }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = Math.random() * 12 + 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;
      sizes[i] = 0.5 + Math.random() * 2.5;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [count]);

  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime:   { value: 0 },
        uColor:  { value: new THREE.Color("#ffd9a8") },
        uOpacity:{ value: 0.55 },
      },
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        varying float vFade;
        void main() {
          vec3 p = position;
          /* gentle vertical bob + tiny lateral drift, deterministic from
             the particle's own X/Z so they don't all drift in sync. */
          p.y += sin(uTime * 0.5 + position.x * 0.3 + position.z * 0.2) * 0.18;
          p.x += sin(uTime * 0.3 + position.z * 0.4) * 0.12;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aSize * (220.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
          vFade = clamp(1.0 - (-mv.z / 40.0), 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vFade;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = (1.0 - smoothstep(0.18, 0.5, d)) * vFade * uOpacity;
          gl_FragColor = vec4(uColor, a);
        }
      `,
    });
  }, []);

  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt;
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

/* ---------------------------------------------------------------------- */
/* Highlight ring + tank halo                                              */
/* ---------------------------------------------------------------------- */

function CinematicHighlight({ stateRef }) {
  const ringRef = useRef();
  const matRef = useRef();
  const px = useRef(0);
  const pz = useRef(0);
  const sx = useRef(2);
  const sz = useRef(2);
  const op = useRef(0);

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffaa55",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  matRef.current = mat;

  const geom = useMemo(() => new THREE.RingGeometry(0.9, 1.0, 64), []);

  useEffect(() => () => { mat.dispose(); geom.dispose(); }, [mat, geom]);

  useFrame((_, dt) => {
    const s = stateRef.current;
    const target = s?.highlightRect ?? null;
    const k = 1 - Math.pow(0.001, Math.min(dt || 0.016, 0.1));
    if (target) {
      const dSX = (target.hx + 0.5) * 2;
      const dSZ = (target.hz + 0.5) * 2;
      px.current += (target.cx - px.current) * k;
      pz.current += (target.cz - pz.current) * k;
      sx.current += (dSX - sx.current) * k;
      sz.current += (dSZ - sz.current) * k;
      op.current += (0.65 - op.current) * k;
    } else {
      op.current += (0.0 - op.current) * k;
    }
    if (ringRef.current) {
      ringRef.current.position.set(px.current, 0.02, pz.current);
      ringRef.current.scale.set(sx.current * 0.5, sz.current * 0.5, 1);
    }
    if (matRef.current) matRef.current.opacity = op.current;
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} geometry={geom} material={mat} />
  );
}

/* ---------------------------------------------------------------------- */
/* Gradient sky — fullscreen background quad                                */
/* ---------------------------------------------------------------------- */

function SkyDome({ stateRef }) {
  const meshRef = useRef();
  const matRef = useRef();
  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTop: { value: new THREE.Color("#0c0d18") },
        uBot: { value: new THREE.Color("#241828") },
      },
      vertexShader: `
        varying vec3 vWorld;
        void main() {
          vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTop;
        uniform vec3 uBot;
        varying vec3 vWorld;
        void main() {
          float h = normalize(vWorld).y;
          float t = clamp(0.5 + h * 0.5, 0.0, 1.0);
          gl_FragColor = vec4(mix(uBot, uTop, t), 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);
  matRef.current = mat;

  useFrame(() => {
    const s = stateRef.current;
    if (!s || !matRef.current) return;
    matRef.current.uniforms.uTop.value.setRGB(s.bgTopR, s.bgTopG, s.bgTopB);
    matRef.current.uniforms.uBot.value.setRGB(s.bgBotR, s.bgBotG, s.bgBotB);
  });

  return (
    <mesh ref={meshRef} material={mat} renderOrder={-1000}>
      <sphereGeometry args={[120, 24, 16]} />
    </mesh>
  );
}

/* ---------------------------------------------------------------------- */
/* The scene rig                                                            */
/* ---------------------------------------------------------------------- */

function SceneRig({ targetRef, progressRef, stateRef }) {
  const { camera, gl, scene, size } = useThree();
  const keyRef = useRef();
  const ambRef = useRef();
  const fillRef = useRef();

  /* Render targets for the bloom pass. */
  const rtBase = useMemo(
    () => new THREE.WebGLRenderTarget(1, 1, { samples: 0, depthBuffer: true }),
    []
  );
  const rtBright = useMemo(() => new THREE.WebGLRenderTarget(1, 1), []);
  const rtBlurA  = useMemo(() => new THREE.WebGLRenderTarget(1, 1), []);
  const rtBlurB  = useMemo(() => new THREE.WebGLRenderTarget(1, 1), []);

  /* Fullscreen quad scene for the post-processing passes. */
  const fsScene = useMemo(() => new THREE.Scene(), []);
  const fsCam   = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const fsGeom  = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

  const brightMat = useMemo(() => new THREE.ShaderMaterial(BRIGHT_SHADER), []);
  const blurMat   = useMemo(() => new THREE.ShaderMaterial(BLUR_SHADER), []);
  const compositeMat = useMemo(() => new THREE.ShaderMaterial(COMPOSITE_SHADER), []);
  const fsMesh = useMemo(() => new THREE.Mesh(fsGeom, brightMat), [fsGeom, brightMat]);
  useEffect(() => { fsScene.add(fsMesh); return () => fsScene.remove(fsMesh); },
    [fsScene, fsMesh]);

  /* Resize render targets to match canvas. */
  useEffect(() => {
    const w = Math.max(1, Math.floor(size.width  * gl.getPixelRatio()));
    const h = Math.max(1, Math.floor(size.height * gl.getPixelRatio()));
    rtBase.setSize(w, h);
    /* Half-res for the bloom chain — cheaper, wider glow. */
    const bw = Math.max(1, Math.floor(w / 2));
    const bh = Math.max(1, Math.floor(h / 2));
    rtBright.setSize(bw, bh);
    rtBlurA.setSize(bw, bh);
    rtBlurB.setSize(bw, bh);
    blurMat.uniforms.resolution.value.set(bw, bh);
  }, [size, gl, rtBase, rtBright, rtBlurA, rtBlurB, blurMat]);

  /* Allocation-free scratch. */
  const _tgt = useRef(new THREE.Vector3());
  const _v3  = useRef(new THREE.Vector3());

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw || 0.016, 0.1);

    /* 1. Catch up `progressRef` toward `targetRef`. */
    const desired = targetRef.current ?? 0;
    const curr = progressRef.current ?? 0;
    /* exponential smoothing — softer than instant snap, won't overshoot. */
    const k = 1 - Math.pow(0.001, dt * 0.55);
    progressRef.current = curr + (desired - curr) * k;
    const p = progressRef.current;

    /* 2. Sample chapter pair. */
    const n = CINEMATIC_CHAPTERS.length - 1;
    const pp = Math.max(0, Math.min(n, p));
    const i = Math.floor(pp);
    const f = pp - i;
    const tt = 1 - Math.pow(1 - f, 4); /* ease-out quart */
    const a = CINEMATIC_CHAPTERS[i];
    const b = CINEMATIC_CHAPTERS[Math.min(n, i + 1)];

    /* 3. Camera position + target. */
    const cx = lerp(a.cam.x, b.cam.x, tt);
    const cy = lerp(a.cam.y, b.cam.y, tt);
    const cz = lerp(a.cam.z, b.cam.z, tt);
    const tx = lerp(a.target.x, b.target.x, tt);
    const ty = lerp(a.target.y, b.target.y, tt);
    const tz = lerp(a.target.z, b.target.z, tt);

    /* 4. Per-chapter drift — continuous gentle motion so the frame is
     *    never frozen. Each chapter has its own amplitudes + speed. */
    const driftAX = lerp(a.drift.ax, b.drift.ax, tt);
    const driftAZ = lerp(a.drift.az, b.drift.az, tt);
    const driftAY = lerp(a.drift.ay, b.drift.ay, tt);
    const driftSp = lerp(a.drift.speed, b.drift.speed, tt);
    const t = state.clock.elapsedTime * driftSp;
    const dCX = Math.sin(t * 0.85) * driftAX;
    const dCZ = Math.cos(t * 0.65) * driftAZ;
    const dCY = Math.sin(t * 0.45 + 1.1) * driftAY;

    camera.position.set(cx + dCX, cy + dCY, cz + dCZ);
    _tgt.current.set(tx, ty, tz);
    camera.lookAt(_tgt.current);

    /* 5. FOV. */
    const fov = lerp(a.fov, b.fov, tt);
    if (Math.abs(camera.fov - fov) > 0.05) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    /* 6. Lights. */
    if (keyRef.current) {
      keyRef.current.position.set(
        lerp(a.key.x, b.key.x, tt),
        lerp(a.key.y, b.key.y, tt),
        lerp(a.key.z, b.key.z, tt),
      );
      keyRef.current.intensity = lerp(a.key.intensity, b.key.intensity, tt);
      const kc = lerpHexRgb(a.key.color, b.key.color, tt);
      keyRef.current.color.setRGB(kc.r, kc.g, kc.b);
    }
    if (ambRef.current) {
      ambRef.current.intensity = lerp(a.ambient.intensity, b.ambient.intensity, tt);
      const ac = lerpHexRgb(a.ambient.color, b.ambient.color, tt);
      ambRef.current.color.setRGB(ac.r, ac.g, ac.b);
    }
    if (fillRef.current) {
      /* Soft camera-locked fill so the model never goes pure black even
       * when the key light angles away. */
      fillRef.current.position.copy(camera.position);
      const ac = lerpHexRgb(a.ambient.color, b.ambient.color, tt);
      fillRef.current.color.setRGB(ac.r * 0.7 + 0.25, ac.g * 0.7 + 0.25, ac.b * 0.7 + 0.25);
      fillRef.current.intensity = 0.5;
    }

    /* 7. Sky colours → write to stateRef so SkyDome reads them. */
    const skyTop = lerpHexRgb(a.bg.top, b.bg.top, tt);
    const skyBot = lerpHexRgb(a.bg.bot, b.bg.bot, tt);

    /* 8. Fog. */
    const fogStrength = lerp(a.fog, b.fog, tt);
    if (!scene.fog) scene.fog = new THREE.Fog(0x000000, 25, 80);
    scene.fog.color.setRGB(skyBot.r, skyBot.g, skyBot.b);
    scene.fog.near = lerp(80, 14, fogStrength);
    scene.fog.far  = lerp(160, 50, fogStrength);

    /* 9. Highlight rect — driven by chapter + sub-progress. */
    const highlightRect = highlightRectAt(i, f);

    /* 10. Publish all of this to the state ref so SkyDome + Highlight +
     *    composite shader can read it. */
    stateRef.current = stateRef.current || {};
    stateRef.current.bgTopR = skyTop.r;
    stateRef.current.bgTopG = skyTop.g;
    stateRef.current.bgTopB = skyTop.b;
    stateRef.current.bgBotR = skyBot.r;
    stateRef.current.bgBotG = skyBot.g;
    stateRef.current.bgBotB = skyBot.b;
    stateRef.current.highlightRect = highlightRect;
    stateRef.current.chapterIndex = i;
    stateRef.current.chapterProgress = f;

    /* 11. Bloom + composite. */
    const bloomStrength = lerp(a.bloom.strength, b.bloom.strength, tt);
    const bloomThresh   = lerp(a.bloom.threshold, b.bloom.threshold, tt);
    const vig           = lerp(a.vignette, b.vignette, tt);

    /* Render base into rtBase. */
    const prevTarget = gl.getRenderTarget();
    gl.setRenderTarget(rtBase);
    gl.clear(true, true, true);
    gl.render(scene, camera);

    /* Bright pass: rtBase -> rtBright */
    fsMesh.material = brightMat;
    brightMat.uniforms.tDiffuse.value = rtBase.texture;
    brightMat.uniforms.threshold.value = bloomThresh;
    gl.setRenderTarget(rtBright);
    gl.clear(true, true, true);
    gl.render(fsScene, fsCam);

    /* Horizontal blur: rtBright -> rtBlurA */
    fsMesh.material = blurMat;
    blurMat.uniforms.tDiffuse.value = rtBright.texture;
    blurMat.uniforms.direction.value.set(1.0, 0.0);
    gl.setRenderTarget(rtBlurA);
    gl.clear(true, true, true);
    gl.render(fsScene, fsCam);

    /* Vertical blur: rtBlurA -> rtBlurB */
    blurMat.uniforms.tDiffuse.value = rtBlurA.texture;
    blurMat.uniforms.direction.value.set(0.0, 1.0);
    gl.setRenderTarget(rtBlurB);
    gl.clear(true, true, true);
    gl.render(fsScene, fsCam);

    /* Composite: rtBase + rtBlurB -> screen */
    fsMesh.material = compositeMat;
    compositeMat.uniforms.tBase.value     = rtBase.texture;
    compositeMat.uniforms.tBloom.value    = rtBlurB.texture;
    compositeMat.uniforms.bloomMul.value  = bloomStrength;
    compositeMat.uniforms.vignette.value  = vig;
    compositeMat.uniforms.grain.value     = 0.045;
    compositeMat.uniforms.time.value      = state.clock.elapsedTime;
    gl.setRenderTarget(prevTarget);
    gl.clear(true, true, true);
    gl.render(fsScene, fsCam);
  }, 1); /* render priority 1 — we take over the render loop */

  return (
    <>
      <SkyDome stateRef={stateRef} />
      <ambientLight ref={ambRef} intensity={0.4} color="#3a3650" />
      <directionalLight
        ref={keyRef}
        position={[-2, 3, 14]}
        intensity={0.9}
        color="#ffb46c"
      />
      <pointLight
        ref={fillRef}
        position={[0, 4, 6]}
        intensity={0.5}
        distance={20}
        decay={1.5}
      />
      <DustField />
      <Suspense fallback={null}>
        <TrACModelLight />
      </Suspense>
      <CinematicHighlight stateRef={stateRef} />
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* Exported Canvas                                                          */
/* ---------------------------------------------------------------------- */

export default function CinematicScene({ targetRef, progressRef, stateRef }) {
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
        preserveDrawingBuffer: false,
      }}
      camera={{ fov: 50, near: 0.05, far: 200, position: [-6, 9, 18] }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        /* Render loop is driven manually in SceneRig — keep autoClear on
         * so each pass starts clean. */
        gl.autoClear = true;
      }}
    >
      <SceneRig
        targetRef={targetRef}
        progressRef={progressRef}
        stateRef={stateRef}
      />
    </Canvas>
  );
}
