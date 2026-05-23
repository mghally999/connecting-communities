"use client";

/**
 * IntroTypography
 *
 * Implements FOAM_TALENT_SPEC.md §2.1–2.2.
 *
 * - On mount: TALENT mark fades up and the tagline reveals word-by-word
 *   with a 240 ms cadence. Each word is dim grey at rest and brightens
 *   to white once it has landed (the colour transition is handled in
 *   CSS via `.tag-word.is-on`).
 * - The whole section is 300vh tall with a position: sticky stage. As
 *   the visitor scrolls past it three hero images crossfade in/out and
 *   each enters at scale 1.04 → 1.0.
 * - At ~95% scroll the typography plays its exit animation
 *   (scale 0.92, opacity 0). `onExitComplete` fires when done; the
 *   parent route uses it to swap to the gallery scene.
 *
 * The foam wordmark itself is owned by <FoamSidebar /> so it can persist
 * across route transitions.
 */

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import TalentMarkSVG from "./TalentMarkSVG";

gsap.registerPlugin(useGSAP);

const TAGLINE = ["artists", "shaping", "the", "future", "of", "photography"];

export default function IntroTypography({ heroes = [], onExitComplete }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const markRef = useRef(null);
  const heroLayerRef = useRef(null);
  const textLayerRef = useRef(null);
  const [reduced, setReduced] = useState(false);

  useGSAP(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) { setReduced(true); return; }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(markRef.current, { y: 30, opacity: 0, duration: 0.85, ease: "expo.out" }, 0.30)
      .fromTo(".pattern-fill", { opacity: 0 }, { opacity: 1, duration: 0.65 }, 0.55)
      .to(".tag-word", {
        opacity: 1, y: 0, duration: 0.45, stagger: 0.24, ease: "power3.out",
        onStart: function () {
          this.targets().forEach((el) => el.classList.add("is-on"));
        },
      }, 1.05);

    // Subtle infinite horizontal drift on the op-art fill (~9 s loop)
    gsap.to(".pattern-fill", { attr: { x: 1200 }, duration: 9, repeat: -1, ease: "none" });
  }, { scope: rootRef });

  useEffect(() => {
    const root = rootRef.current;
    const heroLayer = heroLayerRef.current;
    const textLayer = textLayerRef.current;
    if (!root || !heroLayer || !textLayer) return;

    const imgs = Array.from(heroLayer.querySelectorAll("img"));
    let exited = false;
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = root.getBoundingClientRect();
        const total = root.offsetHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, total)));

        // Crossfade three heroes across thirds of the section
        imgs.forEach((img, i) => {
          const lo = i / 3;
          const hi = (i + 1) / 3;
          const local = gsap.utils.clamp(0, 1, (progress - lo) / (hi - lo));
          // Each image fades in over its third and stays visible for the
          // next. We fade the previous out as the next fades in.
          const next = i < imgs.length - 1
            ? gsap.utils.clamp(0, 1, (progress - hi) / (1 / 3))
            : 0;
          const opacity = Math.max(0, local - next);
          img.style.opacity = String(opacity);
          img.style.transform = `scale(${1.04 - 0.04 * local})`;
        });

        // Exit animation in the final 5%
        if (progress >= 0.95 && !exited) {
          exited = true;
          gsap.to(textLayer, {
            scale: 0.92, opacity: 0, duration: 0.55, ease: "power3.in",
            onComplete: () => onExitComplete?.(),
          });
        } else if (progress < 0.92 && exited) {
          exited = false;
          gsap.to(textLayer, { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" });
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onExitComplete]);

  return (
    <section
      ref={rootRef}
      className="intro-section"
      aria-label="Foam Talent 2024 intro"
      style={{ position: "relative", height: "300vh" }}
    >
      <div
        ref={stageRef}
        className="intro-stage"
        style={{ position: "sticky", top: 0 }}
      >
        <div ref={heroLayerRef} className="intro-heroes">
          {heroes.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" loading={i === 0 ? "eager" : "lazy"} />
          ))}
          <div className="intro-vignette" />
        </div>

        <div ref={textLayerRef} className="intro-text-layer">
          <div className="intro-fixed">
            <div className="intro-talent" aria-label="TALENT">
              <TalentMarkSVG ref={markRef} className="intro-talent" />
            </div>
            <p className="intro-tagline">
              {TAGLINE.map((w) => (
                <span
                  key={w}
                  className={`tag-word${reduced ? " is-on" : ""}`}
                  style={reduced ? { opacity: 1, transform: "none", color: "#fff" } : undefined}
                >
                  {w}
                </span>
              ))}
            </p>
            <div className="intro-chevron" aria-hidden="true">↓</div>
          </div>
        </div>
      </div>
    </section>
  );
}
