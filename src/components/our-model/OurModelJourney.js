"use client";

import { useRef } from "react";
import styled from "styled-components";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Container, H2, Body } from "@/components/primitives";
import Reveal from "@/components/Reveal";

/**
 * OurModelJourney
 *
 * A scroll-driven cinematic walkthrough of a TrAC (Transformation
 * Aspirational Centre). The user scrolls and the camera "moves" through
 * the building scene by scene: exterior -> reception -> services rooms.
 *
 * Implementation notes:
 *  - The outer <Wrap> is tall (one full viewport per scene of scroll
 *    distance) and contains a sticky 100vh stage. As the user scrolls
 *    through the wrap, the stage stays pinned and we cross-fade scenes
 *    inside it based on scroll progress.
 *  - Each scene gets a Ken Burns scale ramp (1.0 -> 1.08) over its own
 *    visible window so it FEELS like the camera is pushing into the room.
 *  - Captions live in a separate sticky overlay, fading in/out
 *    independently per scene. This is the same pattern used by
 *    scroll-storytelling sites built with framer-motion.
 *  - Once the real .glb files arrive from AKA Partners, swap the
 *    <Image> blocks below for <Canvas><Model/></Canvas> from
 *    @react-three/fiber. Everything else stays.
 */

const Intro = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: 4.5rem 0 3rem;
`;

const IntroTitle = styled(H2)`
  font-size: clamp(2rem, 3.4vw, 2.85rem);
  margin-bottom: 1rem;
`;

const IntroBody = styled(Body)`
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.7;
  letter-spacing: 0.01em;
  max-width: 78ch;
`;

const ScrollHint = styled.div`
  margin-top: 2.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.orange};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};

  &::after {
    content: "";
    display: inline-block;
    width: 56px;
    height: 1px;
    background: ${({ theme }) => theme.colors.orange};
  }
`;

const Wrap = styled.section`
  position: relative;
  width: 100%;
  /* One viewport of scroll distance per scene; tweak if you change SCENES.length */
  height: ${({ $scenes }) => $scenes * 100}vh;
  background: ${({ theme }) => theme.colors.black};
`;

const Sticky = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

const Stage = styled.div`
  position: absolute;
  inset: 0;
`;

const Scene = styled(motion.div)`
  position: absolute;
  inset: 0;
  will-change: opacity, transform;
`;

const SceneImage = styled(motion.div)`
  position: absolute;
  inset: 0;
  will-change: transform;

  & img {
    object-fit: cover;
  }

  /* Subtle vignette so caption text has contrast regardless of scene */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(11,16,24,0) 35%, rgba(11,16,24,0.55) 78%, rgba(11,16,24,0.78) 100%),
      linear-gradient(90deg, rgba(11,16,24,0.45) 0%, rgba(11,16,24,0) 45%);
    pointer-events: none;
  }
`;

const Captions = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  z-index: 2;
`;

const CaptionWrap = styled(motion.div)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 0 4rem;
  will-change: opacity, transform;
`;

const CaptionInner = styled.div`
  max-width: ${({ theme }) => theme.layout.contentWidth};
  margin: 0 auto;
  padding: 0 2.5rem;
  color: white;
  max-width: 720px;
  margin-left: max(2.5rem, calc((100vw - ${({ theme }) => theme.layout.contentWidth}) / 2));

  @media (max-width: 900px) {
    margin-left: 1.5rem;
    padding: 0 1rem 0 0;
  }
`;

const ChapterLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1rem;
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.orange};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};

  & .num {
    color: white;
    opacity: 0.7;
  }

  & .bar {
    display: inline-block;
    width: 36px;
    height: 1px;
    background: ${({ theme }) => theme.colors.orange};
  }
`;

const SceneTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.8rem, 3.4vw, 2.85rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  line-height: 1.1;
  margin: 0 0 0.85rem 0;
  color: white;
  letter-spacing: -0.005em;
`;

const SceneBody = styled.p`
  margin: 0;
  font-size: clamp(0.95rem, 1.1vw, 1.05rem);
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.9);
  max-width: 56ch;
`;

const ProgressRail = styled.div`
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  z-index: 3;

  @media (max-width: 768px) { display: none; }
`;

const ProgressDot = styled(motion.div)`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: white;
  will-change: opacity, transform;
`;

const Closing = styled.section`
  position: relative;
  width: 100%;
  height: clamp(320px, 38vw, 500px);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 60%);
  }
`;

const ClosingInner = styled.div`
  position: absolute;
  inset: auto 0 0 0;
  z-index: 2;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 0 5rem 3rem;
  color: white;

  & h3 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(2rem, 3.6vw, 3rem);
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    line-height: 1.1;
    white-space: pre-line;
    margin: 0;
    color: white;
  }
  & p {
    margin-top: 0.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
  }
  @media (max-width: 768px) { padding: 0 1.5rem 2rem; }
`;

/* -------------------------------------------------------------------------- */
/* Scene data                                                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_SCENES = [
  {
    id: "exterior",
    label: "Exterior",
    title: "A TrAC at the heart of the community",
    body:
      "Each Transformation Aspirational Centre — TrAC — is a single welcoming address where every Connecting Communities service lives side by side. This is what arriving at one looks like.",
    image: "/images/our-model/journey/01-exterior.jpg",
    alt: "Exterior of a TrAC building with TrAC and aspire signage at dusk",
  },
  {
    id: "reception",
    label: "Reception",
    title: "One front desk for everything",
    body:
      "Aspire microfinance and TrAC services share a single counter, so a farmer applying for a loan, a parent enrolling a child in a class, and a trader topping up data all start in the same place.",
    image: "/images/our-model/journey/02-reception-aspire.jpg",
    alt: "Reception area featuring Aspire microfinance and TrAC counters",
  },
  {
    id: "tele-conferencing",
    label: "Tele-conferencing",
    title: "Connecting people across borders",
    body:
      "Private rooms equipped for tele-conferencing let community members meet a doctor, an instructor, or a relative anywhere in the world — without leaving the village.",
    image: "/images/our-model/journey/03-trac-room.jpg",
    alt: "Tele-conferencing room with desk, monitor and TrAC branding",
  },
  {
    id: "edtech",
    label: "EdTech",
    title: "Learning, locally",
    body:
      "Classrooms host literacy, vocational training, and digital-skills programmes — built into the same building as the rest of the services families already rely on.",
    image: "/images/our-model/journey/05-classroom.jpg",
    alt: "Education room with shared desks, screens and Education-themed wall art",
  },
  {
    id: "agritech",
    label: "AgriTech",
    title: "Tools for the farms outside the door",
    body:
      "AgroEdu counters give smallholder farmers access to diversified-crop guidance, market prices, and the buyers who want to source from them.",
    image: "/images/our-model/journey/07-agroedu.jpg",
    alt: "AgroEdu counter with farming education poster behind it",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    title: "Where the local economy lives",
    body:
      "Shelving, payment, and inventory tools turn the same building into a community marketplace — owned by the people who use it, supported by everything else under this roof.",
    image: "/images/our-model/journey/08-marketplace.jpg",
    alt: "Marketplace and retail shelving area with chalkboard pricing",
  },
];

/* -------------------------------------------------------------------------- */
/* Scene component                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Calculate the timing window for scene #i out of n total scenes.
 * Scenes overlap slightly so cross-fades feel natural.
 *
 * Returns {fadeIn, hold, fadeOut} as scrollYProgress values.
 */
function sceneWindow(i, n) {
  const slot = 1 / n;            // each scene's slot of the timeline
  const start = i * slot;
  const end = (i + 1) * slot;
  const fade = slot * 0.18;      // 18% of slot is cross-fade

  return {
    fadeInStart:  i === 0 ? 0 : start - fade,
    fadeInEnd:    i === 0 ? 0 : start + fade,
    fadeOutStart: i === n - 1 ? 1 : end - fade,
    fadeOutEnd:   i === n - 1 ? 1 : end + fade,
    holdStart:    start,
    holdEnd:      end,
  };
}

function SceneLayer({ scene, index, total, scrollYProgress, priority, reduceMotion }) {
  const w = sceneWindow(index, total);

  // Opacity: fade in over fadeIn window, hold full opacity, fade out over fadeOut window
  const opacity = useTransform(
    scrollYProgress,
    [w.fadeInStart, w.fadeInEnd, w.fadeOutStart, w.fadeOutEnd],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0]
  );

  // Ken Burns: scene image scales from 1.0 to 1.08 over its visible window
  const scale = useTransform(
    scrollYProgress,
    [w.fadeInStart, w.fadeOutEnd],
    reduceMotion ? [1, 1] : [1.0, 1.08]
  );

  // Subtle vertical drift to add "stepping forward" feel
  const y = useTransform(
    scrollYProgress,
    [w.fadeInStart, w.fadeOutEnd],
    reduceMotion ? ["0%", "0%"] : ["2%", "-2%"]
  );

  return (
    <Scene style={{ opacity }} aria-hidden={index !== 0 ? "true" : "false"}>
      <SceneImage style={{ scale, y }}>
        <Image
          src={scene.image}
          alt={scene.alt}
          fill
          sizes="100vw"
          priority={priority}
          quality={88}
        />
      </SceneImage>
    </Scene>
  );
}

function ProgressDotItem({ index, total, scrollYProgress }) {
  const w = sceneWindow(index, total);
  const opacity = useTransform(
    scrollYProgress,
    [w.fadeInStart, w.holdStart, w.holdEnd, w.fadeOutEnd],
    [0.35, 1, 1, 0.35]
  );
  const scale = useTransform(
    scrollYProgress,
    [w.fadeInStart, w.holdStart, w.holdEnd, w.fadeOutEnd],
    [1, 1.4, 1.4, 1]
  );
  return <ProgressDot style={{ opacity, scale }} />;
}

function ProgressIndicator({ total, scrollYProgress }) {
  return (
    <ProgressRail aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <ProgressDotItem
          key={i}
          index={i}
          total={total}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </ProgressRail>
  );
}

function Caption({ scene, index, total, scrollYProgress, reduceMotion }) {
  const w = sceneWindow(index, total);

  // Captions fade in slightly after the scene image, fade out slightly before
  const captionFade = (1 / total) * 0.10;
  const captionOpacity = useTransform(
    scrollYProgress,
    [
      Math.max(0, w.holdStart - captionFade),
      w.holdStart + captionFade,
      w.holdEnd - captionFade,
      Math.min(1, w.holdEnd + captionFade),
    ],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0]
  );

  const captionY = useTransform(
    scrollYProgress,
    [w.holdStart, w.holdEnd],
    reduceMotion ? ["0px", "0px"] : ["20px", "-20px"]
  );

  const num = String(index + 1).padStart(2, "0");
  const totalStr = String(total).padStart(2, "0");

  return (
    <CaptionWrap style={{ opacity: captionOpacity, y: captionY }}>
      <CaptionInner>
        <ChapterLabel>
          <span className="num">{num} / {totalStr}</span>
          <span className="bar" />
          {scene.label}
        </ChapterLabel>
        <SceneTitle>{scene.title}</SceneTitle>
        <SceneBody>{scene.body}</SceneBody>
      </CaptionInner>
    </CaptionWrap>
  );
}



/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function OurModelJourney({ data, scenes }) {
  const wrapRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const SCENES = scenes && scenes.length > 0 ? scenes : DEFAULT_SCENES;

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  return (
    <>
      <Intro>
        <Container>
          <Reveal>
            <IntroTitle>{data?.launchTitle || "Inside a TrAC"}</IntroTitle>
            <IntroBody>
              {data?.launchBody ||
                "Our launch will roll out across East Africa, beginning with Rwanda as our regional headquarters. Step inside one of our Transformation Aspirational Centres."}
            </IntroBody>
            <ScrollHint>Scroll to enter</ScrollHint>
          </Reveal>
        </Container>
      </Intro>

      <Wrap ref={wrapRef} $scenes={SCENES.length}>
        <Sticky>
          <Stage>
            {SCENES.map((scene, i) => (
              <SceneLayer
                key={scene.id || i}
                scene={scene}
                index={i}
                total={SCENES.length}
                scrollYProgress={scrollYProgress}
                priority={i === 0}
                reduceMotion={reduceMotion}
              />
            ))}
          </Stage>

          <Captions>
            {SCENES.map((scene, i) => (
              <Caption
                key={`cap-${scene.id || i}`}
                scene={scene}
                index={i}
                total={SCENES.length}
                scrollYProgress={scrollYProgress}
                reduceMotion={reduceMotion}
              />
            ))}
          </Captions>

          <ProgressIndicator total={SCENES.length} scrollYProgress={scrollYProgress} />
        </Sticky>
      </Wrap>

      {data?.bottomBandImage && (
        <Closing>
          <Image
            src={data.bottomBandImage}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <ClosingInner>
            <h3>{data.bottomBandTitle}</h3>
            <p>{data.bottomBandSub}</p>
          </ClosingInner>
        </Closing>
      )}
    </>
  );
}
