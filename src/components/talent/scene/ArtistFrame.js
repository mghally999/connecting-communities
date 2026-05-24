"use client";

/**
 * ArtistFrame — single artist plane in the 3D gallery.
 *
 * Reproduces the floating image card from foam.org/talent-2024: a textured
 * plane at the artist's authored `pos3` (x, y, z), sized to its image's
 * aspect ratio, with a colored "frame" border behind it. On hover, the
 * frame scales slightly and emits the artist's accent up to the parent
 * scene which tweens the background.
 *
 * Click → bubbles up to the scene which calls onDive(artist).
 */

import React, { useMemo, useRef, useState } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const BASE_SIZE = 3.2; // world-space height of an artist frame (matches the
                       // visual scale on foam.org at default camera distance)

export default function ArtistFrame({ artist, onHover, onLeave, onActivate, dim }) {
  const group = useRef(null);
  const [hovered, setHovered] = useState(false);

  // useTexture suspends — fine, the scene wraps us in <Suspense>
  const tex = useTexture(artist.hero || "/images/talent/placeholder.png");
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;

  // Plane aspect from texture
  const aspect = useMemo(() => {
    const w = tex.image?.naturalWidth || tex.image?.width || 1;
    const h = tex.image?.naturalHeight || tex.image?.height || 1;
    return w / h;
  }, [tex.image]);

  const planeW = BASE_SIZE * aspect;
  const planeH = BASE_SIZE;

  // Smooth scale on hover
  useFrame((_, dt) => {
    if (!group.current) return;
    const target = hovered ? 1.06 : (dim ? 0.92 : 1.0);
    const cur = group.current.scale.x;
    const next = THREE.MathUtils.damp(cur, target, 6, dt);
    group.current.scale.setScalar(next);
  });

  const handleOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(artist);
    document.body.style.cursor = "pointer";
  };
  const handleOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    onLeave?.(artist);
    document.body.style.cursor = "";
  };

  return (
    <group
      ref={group}
      position={[
        parseFloat(artist.pos3.x),
        parseFloat(artist.pos3.y),
        parseFloat(artist.pos3.z),
      ]}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={(e) => { e.stopPropagation(); onActivate?.(artist); }}
    >
      {/* Coloured frame border, slightly larger than the image */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[planeW + 0.45, planeH + 0.45]} />
        <meshBasicMaterial color={artist.accent} toneMapped={false} />
      </mesh>

      {/* The image plane itself */}
      <mesh>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial map={tex} toneMapped={false} transparent={false} />
      </mesh>
    </group>
  );
}
