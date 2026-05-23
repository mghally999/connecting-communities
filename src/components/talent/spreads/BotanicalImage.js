"use client";

/**
 * BotanicalImage — transparent PNG illustration with a subtle float.
 *
 * Used inside Rehab Eldalil's spreads (and any other artist whose
 * portfolio includes cut-out botanical illustrations). The float is a
 * cheap 6-second ease-in-out loop; respect prefers-reduced-motion by
 * holding still.
 */

import React from "react";

export default function BotanicalImage({ src, alt = "" }) {
  return (
    <div
      className="botanical-float"
      style={{
        width: "100%",
        height: "100%",
        animation: "botanicalFloat 6s ease-in-out infinite",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
        }}
      />
      <style jsx>{`
        @keyframes botanicalFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .botanical-float { animation: none; }
        }
      `}</style>
    </div>
  );
}
