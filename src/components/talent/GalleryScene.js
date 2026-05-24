"use client";

/**
 * GalleryScene — R3F 3D exhibition gallery.
 *
 * Implements the gallery from foam.org/talent-2024 as it actually exists:
 * not a flat draggable canvas, but a 3D scene of floating image frames
 * at the (x, y, z) coordinates authored by Foam (preserved verbatim in
 * src/lib/talent-artists.js → ARTISTS[*].pos3).
 *
 * Camera: PerspectiveCamera at (0, 0, 8) with OrbitControls (rotate +
 * pan + zoom). The primary artist (rehab-eldalil) sits at the origin so
 * the camera frames her image on first paint.
 *
 * Hover an artist frame → its accent colour fades up onto the scene
 * background, other frames dim, and a fixed HUD shows the artist's name
 * + exhibition. Click → onDive(artist) is fired by the parent which
 * routes to /talent/<slug>.
 */

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ARTISTS, FILTERS } from "@/lib/talent-artists";
import ArtistFrame from "./scene/ArtistFrame";
import FilterLabels from "./scene/FilterLabels";

function SceneBackground({ color }) {
  // Use scene.background so the entire viewport tints with the hovered accent.
  const ref = useRef(new THREE.Color(color));
  return (
    <color attach="background" args={[color]} />
  );
}

export default function GalleryScene({ onDive }) {
  const [hovered, setHovered] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [bg, setBg] = useState("#0b0b0b");

  // When the user hovers an artist, fade the scene background to that
  // artist's accent. When they leave, restore black.
  useEffect(() => {
    setBg(hovered ? hovered.accent : "#0b0b0b");
  }, [hovered]);

  const matchesFilter = (a) =>
    !activeFilter || (a.tags || []).map((t) => t.toLowerCase()).includes(activeFilter.toLowerCase());

  return (
    <div
      className="gallery-stage gallery-scene"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: bg,
        transition: "background 480ms cubic-bezier(0.22, 1, 0.36, 1)",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneBackground color={bg} />
        <ambientLight intensity={1.0} />
        <Suspense fallback={null}>
          {ARTISTS.filter((a) => a.hero).map((a) => (
            <ArtistFrame
              key={a.slug}
              artist={a}
              dim={!!activeFilter && !matchesFilter(a)}
              onHover={(art) => setHovered(art)}
              onLeave={() => setHovered(null)}
              onActivate={(art) => onDive?.(art)}
            />
          ))}
          <FilterLabels
            filters={FILTERS}
            active={activeFilter}
            onChange={setActiveFilter}
          />
        </Suspense>
        <OrbitControls
          enablePan
          enableRotate
          enableZoom
          zoomSpeed={0.6}
          rotateSpeed={0.4}
          panSpeed={0.8}
          minDistance={2}
          maxDistance={60}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Fixed HUD: hovered artist's name + exhibition (mirrors foam.org's
       *  bottom-centre caption). */}
      <div
        className={`gallery-caption${hovered ? " is-on" : ""}`}
        aria-live="polite"
        style={{ color: hovered?.accentText || "#fff" }}
      >
        {hovered && (
          <>
            <span className="gc-title">{hovered.exhibition || hovered.name}</span>
            <span className="gc-artist">{hovered.name}</span>
          </>
        )}
      </div>
    </div>
  );
}
