"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { HashMap } from "@/utils/data-structures";

/**
 * TrACModel — single hubsite GLB, properly framed.
 *
 *  Calibration story (this iteration):
 *
 *  An earlier pass auto-fit the model on its full bounding box. That
 *  bbox is dominated by two outliers — the signage pillar in the
 *  back-left corner of the site and the AQUASOL water-tank-+-solar
 *  kit in the back-right corner — both of which sit OUTSIDE the
 *  building proper. After centring the bbox on (0,0,0), the actual
 *  rooms ended up off-centre by ~3 m. Every interior camera target
 *  set to "(0,*,0)" framed empty ground next to the building.
 *
 *  The fix is to centre on the TIGHT building footprint instead of
 *  the full bbox, and to scale up so the building reads at proper
 *  human architectural scale (~14 m wide × 6 m tall). The tight
 *  footprint coordinates below were derived by volume-weighted
 *  occupancy analysis of the source GLB — see the analysis notes
 *  in the handoff for the spreadsheet.
 *
 *  Architecture note:
 *  The GLB is a TOP-DOWN architectural visualisation, not a
 *  walk-through model. Interior partition walls are knee-height,
 *  the roof is missing entirely, and the furniture is decorative
 *  top-down silhouette. We make that work cinematically by:
 *
 *    - Filming exteriors and angled aerial top-downs only
 *    - Adding a soft orange highlight ring on the floor of the
 *      currently-active room so the eye knows which one to look at
 *
 *  Two knobs are exposed for fast tuning without recompiling logic:
 *
 *    BUILDING_ROT_Y     — rotate the whole model (entry face wrong way?)
 *    BUILDING_CENTER    — auto-fit re-centring offset, in original
 *                         world units (before scaling)
 *    FIT_SIZE           — target longest-horizontal-axis in world units
 *                         after the auto-fit
 */

const BUILDING_URL = "/models/building.glb";

/* Source-GLB constants ----------------------------------------------------- */
/* These come from volume-weighted occupancy analysis of the raw GLB.
 *   Full bbox X centre: 378.93        full bbox Z centre: -110.63
 *   TIGHT building X centre: 380.38   TIGHT building Z centre: -113.57
 *   Δ (tight − full): X +1.45  Z −2.94    ← these are what we subtract
 *
 * If the architect re-exports the GLB and the building shifts inside
 * its world-coords, update these two numbers and everything else stays
 * calibrated. */
const TIGHT_OFFSET_X = 1.45;
const TIGHT_OFFSET_Z = -2.94;

/* Auto-fit target. 18 makes the building approximately 14 m wide /
 * 3.6 m tall after scaling — proper architectural scale, so the
 * camera positions read at human eye-level. */
const FIT_SIZE = 18.0;

/* Spin the model around Y if the entry / signage face comes out the
 * wrong way. 0 / π/2 / π / −π/2 are the four useful values.
 *
 * Tuning shortcut: append ?rot=0/1/2/3 to the URL on /our-model or
 * /our-model-2 to hot-swap the rotation without a code change. The
 * helper below picks the URL override if present, otherwise this
 * constant. Useful for verifying which face is "front" before
 * committing the right value. */
export const BUILDING_ROT_Y = 0;

function getBuildingRotY() {
  if (typeof window === "undefined") return BUILDING_ROT_Y;
  try {
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("rot");
    if (raw == null) return BUILDING_ROT_Y;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return BUILDING_ROT_Y;
    return ((n % 4) + 4) % 4 * (Math.PI / 2);
  } catch {
    return BUILDING_ROT_Y;
  }
}

function attachMeshopt(loader) {
  loader.setMeshoptDecoder(MeshoptDecoder);
}

/**
 * autoFitTransform
 *
 * Computes the (scale, translate) needed to:
 *   1. Scale so the longest *full-bbox* horizontal axis maps to FIT_SIZE
 *   2. Centre the building's TIGHT footprint on (0, *, 0) — NOT the
 *      bbox centre, which is biased by the back-corner outliers
 *   3. Lift the floor to y = 0
 */
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
    /* Translate the bbox centre + tight-offset back to origin, then scale. */
    tx: (-center.x - TIGHT_OFFSET_X) * scale,
    ty: -box.min.y * scale,
    tz: (-center.z - TIGHT_OFFSET_Z) * scale,
  };
}

/* ------------------------------------------------------------------------ */
/* Room highlight ring                                                       */
/* ------------------------------------------------------------------------ */
/**
 * A soft orange disc on the floor of the active room. As the chapter
 * sample moves between rooms, the disc tweens its centre + radius so
 * the eye is guided to "this is the room you're looking at right now".
 *
 * Reading the chapter sample directly from journey-chapters.js' rooms
 * keeps the highlight in lock-step with the camera framing — same
 * source of truth, no risk of drift.
 */
function RoomHighlight({ chapterRef, getActiveRoomRect }) {
  const meshRef = useRef();
  const matRef = useRef();
  const _v3 = useRef(new THREE.Vector3());

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#FD8C3B",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    []
  );
  matRef.current = mat;

  /* The ring geometry is a thin annulus rendered just above the floor.
   * We use scale and position to tween size/centre per frame. */
  const geom = useMemo(() => new THREE.RingGeometry(0.9, 1.0, 64), []);

  useEffect(() => () => {
    mat.dispose();
    geom.dispose();
  }, [mat, geom]);

  /* Lerp state — kept in plain numbers, no allocations on hot path. */
  const sx = useRef(2);
  const sz = useRef(2);
  const px = useRef(0);
  const pz = useRef(0);
  const op = useRef(0);

  useFrame((_, dt) => {
    const target = getActiveRoomRect && getActiveRoomRect(chapterRef.current);
    const dtClamped = Math.min(dt || 0.016, 0.1);
    const k = 1 - Math.pow(0.001, dtClamped);

    if (target) {
      /* Compute the rectangle on the floor we want to ring. We make
       * the disc slightly larger than the room rect so the ring sits
       * just outside the walls. */
      const desX = target.cx;
      const desZ = target.cz;
      const desSX = (target.hx + 0.4) * 2;
      const desSZ = (target.hz + 0.4) * 2;
      px.current += (desX - px.current) * k;
      pz.current += (desZ - pz.current) * k;
      sx.current += (desSX - sx.current) * k;
      sz.current += (desSZ - sz.current) * k;
      op.current += (0.32 - op.current) * k;
    } else {
      op.current += (0.0 - op.current) * k;
    }

    if (meshRef.current) {
      meshRef.current.position.set(px.current, 0.02, pz.current);
      meshRef.current.scale.set(sx.current * 0.5, sz.current * 0.5, 1);
    }
    if (matRef.current) {
      matRef.current.opacity = op.current;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geom}
      material={mat}
    />
  );
}

/* ------------------------------------------------------------------------ */
/* Room dimmer overlays                                                      */
/* ------------------------------------------------------------------------ */
/**
 * For chapters that target a specific room, soft-darken every OTHER
 * room with a translucent quad over its floor. The active room
 * stays clear, so attention is drawn to it without moving the camera.
 *
 * `rooms` is a list of {id, cx, cz, hx, hz}. We render one quad per
 * room and tween its opacity each frame based on whether it's the
 * current active room. The ring above sits on top of all of these.
 */
function RoomDimmers({ chapterRef, rooms, getActiveRoomId }) {
  const mats = useRef([]);

  const materials = useMemo(
    () =>
      rooms.map(
        () =>
          new THREE.MeshBasicMaterial({
            color: "#000000",
            transparent: true,
            opacity: 0,
            depthWrite: false,
            toneMapped: false,
          })
      ),
    [rooms]
  );
  mats.current = materials;

  useEffect(
    () => () => materials.forEach((m) => m.dispose && m.dispose()),
    [materials]
  );

  useFrame((_, dt) => {
    const c = chapterRef.current ?? 0;
    const activeId = getActiveRoomId && getActiveRoomId(c);
    const dtC = Math.min(dt || 0.016, 0.1);
    const k = 1 - Math.pow(0.001, dtC);

    for (let i = 0; i < rooms.length; i++) {
      const isActive = rooms[i].id === activeId;
      /* No dim when no room targeted (pillar / birdseye / tank chapters).
       * Otherwise dim everything except active. */
      const desired = activeId ? (isActive ? 0 : 0.18) : 0;
      const m = mats.current[i];
      if (m) m.opacity += (desired - m.opacity) * k;
    }
  });

  return (
    <group>
      {rooms.map((r, i) => (
        <mesh
          key={r.id}
          position={[r.cx, 0.005, r.cz]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={materials[i]}
        >
          <planeGeometry args={[r.hx * 2, r.hz * 2]} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------------ */
/* TrACModel                                                                  */
/* ------------------------------------------------------------------------ */

export default function TrACModel({ modelRef, chapterRef, rooms, getActiveRoomId, getActiveRoomRect }) {
  const gltf = useLoader(GLTFLoader, BUILDING_URL, attachMeshopt);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
  const fit = useMemo(() => autoFitTransform(scene), [scene]);

  /* PBR material clone-once + dedupe. DoubleSide so interior reveals
   * read correctly when the camera dips below the wall tops. */
  useEffect(() => {
    const cache = new HashMap(64);
    const owned = [];
    const dedupe = (m) => {
      if (!m) return m;
      const hit = cache.get(m.uuid);
      if (hit) return hit;
      const c = m.clone();
      c.side = THREE.DoubleSide;
      c.transparent = false;
      c.depthWrite = true;
      c.needsUpdate = true;
      cache.set(m.uuid, c);
      owned.push(c);
      return c;
    };
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = false;
      obj.receiveShadow = false;
      obj.frustumCulled = true;
      if (Array.isArray(obj.material)) obj.material = obj.material.map(dedupe);
      else obj.material = dedupe(obj.material);
    });
    return () => owned.forEach((d) => d && d.dispose && d.dispose());
  }, [scene]);

  return (
    <>
      {/* Ground disc. Sized to the new FIT_SIZE so the building's
       * exterior chapters don't sit on a small patch. */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[36, 64]} />
        <meshStandardMaterial color="#c9a878" roughness={0.95} />
      </mesh>

      {/* Building itself. */}
      <group ref={modelRef} rotation={[0, getBuildingRotY(), 0]}>
        <group position={[fit.tx, fit.ty, fit.tz]} scale={fit.scale}>
          <primitive object={scene} />
        </group>

        {/* Room dimmer overlays — rendered in the same group as the
         * building so they share its transform. */}
        {rooms && chapterRef && getActiveRoomId && (
          <RoomDimmers
            chapterRef={chapterRef}
            rooms={rooms}
            getActiveRoomId={getActiveRoomId}
          />
        )}

        {/* Active room highlight ring. */}
        {chapterRef && getActiveRoomRect && (
          <RoomHighlight
            chapterRef={chapterRef}
            getActiveRoomRect={getActiveRoomRect}
          />
        )}
      </group>
    </>
  );
}
