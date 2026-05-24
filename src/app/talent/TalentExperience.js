"use client";

/**
 * TalentExperience — client shell for /talent.
 *
 * Sequence:
 *  1. IntroTypography pins to the viewport. As the visitor scrolls,
 *     three hero images crossfade beneath the TALENT wordmark.
 *  2. At ~95% scroll the intro plays its exit animation and fires
 *     onExitComplete. We swap scene → 'gallery'.
 *  3. GalleryScene takes over: a full 3D R3F gallery of artist frames
 *     positioned at the (x, y, z) coordinates Foam authored.
 *  4. Clicking a frame triggers DiveTransition then routes to
 *     /talent/<slug>.
 *
 * FoamSidebar persists across all scenes (intro -> gallery -> portfolio)
 * and animates its rotation between states.
 */

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { ARTISTS } from "@/lib/talent-artists";
import IntroTypography from "@/components/talent/IntroTypography";
import FoamSidebar from "@/components/talent/FoamSidebar";
import "@/styles/talent.css";

const GalleryScene = dynamic(
  () => import("@/components/talent/GalleryScene"),
  { ssr: false }
);
const DiveTransition = dynamic(
  () => import("@/components/talent/DiveTransition"),
  { ssr: false }
);

// First three artists (with hero images) drive the intro crossfade.
const HEROES = ARTISTS.filter((a) => a.hero).slice(0, 3).map((a) => a.hero);

export default function TalentExperience() {
  const router = useRouter();
  const [scene, setScene] = useState("intro"); // 'intro' | 'gallery'
  const diveRef = useRef(null);

  const handleDive = (artist) => {
    // In the 3D scene we don't have a clickable card rect, so the dive
    // opens from screen-centre. The transition still hides the route
    // change behind a colour flood.
    const rect = {
      left: window.innerWidth / 2 - 200,
      top: window.innerHeight / 2 - 150,
      width: 400,
      height: 300,
    };
    if (!diveRef.current) {
      router.push(`/talent/${artist.slug}`);
      return;
    }
    diveRef.current.dive({
      artist,
      rect,
      onArrive: () => router.push(`/talent/${artist.slug}`),
    });
  };

  return (
    <div className="talent-root">
      <FoamSidebar state={scene} />

      <IntroTypography
        heroes={HEROES}
        onExitComplete={() => setScene("gallery")}
      />

      <GalleryScene onDive={handleDive} />

      <DiveTransition ref={diveRef} />
    </div>
  );
}
