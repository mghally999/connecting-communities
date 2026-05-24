"use client";

/**
 * FilterLabels — 8 floating category labels positioned in 3D world space
 * at the coordinates foam.org authored (see FILTERS export in
 * src/lib/talent-artists.js).
 *
 * Rendered with @react-three/drei <Text>. Clicking a label sets it as
 * the active filter, which the parent scene uses to dim non-matching
 * artist frames.
 */

import React from "react";
import { Text } from "@react-three/drei";

export default function FilterLabels({ filters, active, onChange }) {
  return (
    <group>
      {filters.map((f) => {
        const on = f.name === active;
        return (
          <Text
            key={f.name}
            position={[parseFloat(f.x), parseFloat(f.y), parseFloat(f.z)]}
            fontSize={1.1}
            anchorX="center"
            anchorY="middle"
            color={on ? "#000" : "#ffffff"}
            outlineWidth={on ? 0.02 : 0.005}
            outlineColor={on ? "#ffffff" : "#000000"}
            onClick={(e) => { e.stopPropagation(); onChange(on ? null : f.name); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
            onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = ""; }}
          >
            {f.name.toLowerCase()}
          </Text>
        );
      })}
    </group>
  );
}
