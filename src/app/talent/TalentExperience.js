"use client";

/**
 * TalentExperience — client-side composition for the /talent route.
 *
 * Owns the cross-scene state:
 *  - which "scene" is visible (intro vs gallery)
 *  - the dive overlay imperative ref
 *  - the FoamSidebar's animated state
 *
 * Per FOAM_TALENT_SPEC.md §2.2 the intro section is 300vh and emits
 * `onExitComplete` once its exit animation finishes — that's our cue to
 * swap from "intro" to "gallery" state and let GalleryBoard take over.
 */

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { ARTISTS } from "@/lib/talent-artists";
import IntroTypography from "@/components/talent/IntroTypography";
import FoamSidebar from "@/components/talent/FoamSidebar";
import "@/styles/talent.css";

// Heavy components are dynamic so the intro scene ships first.
const GalleryBoard = dynamic(
  () => import("@/components/talent/GalleryBoard"),
  { ssr: false }
);
const DiveTransition = dynamic(
  () => import("@/components/talent/DiveTransition"),
  { ssr: false }
);

const HEROES = ARTISTS.slice(0, 3).map((a) => a.hero);

export default function TalentExperience() {
  const router = useRouter();
  const [scene, setScene] = useState("intro"); // 'intro' | 'gallery'
  const diveRef = useRef(null);

  const handleDive = (artist, rect) => {
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

      <GalleryBoard artists={ARTISTS} onDive={handleDive} />

      <DiveTransition ref={diveRef} />
    </div>
  );
}
