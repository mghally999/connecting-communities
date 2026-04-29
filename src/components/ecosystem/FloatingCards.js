"use client";

import { useMemo, useState, useRef } from "react";
import styled from "styled-components";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";

/**
 * FloatingCards
 *
 * A grid of cards that:
 *  - Animate in with a spring stagger
 *  - Idle-float continuously (gentle bob + sway) for a "living" feel
 *  - Respond to mouse movement with subtle parallax
 *  - Share a layoutId with the detail view so opening a card animates
 *    smoothly into a portfolio-style fullscreen view (and back)
 *  - Fully respect prefers-reduced-motion
 */

const Board = styled.div`
  position: relative;
  width: 100%;
  min-height: clamp(700px, 110vh, 1000px);
  height: clamp(700px, 110vh, 1000px);
  background: ${({ theme }) => theme.colors.cream};
  overflow: hidden;
`;

const Inner = styled.div`
  position: relative;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  height: 100%;
  padding: 3rem 2rem 5rem;
  @media (max-width: 768px) { padding: 2rem 1rem 3rem; }
`;

const sizeMap = {
  sm: { w: 0.13, h: 0.18 },
  md: { w: 0.17, h: 0.21 },
  lg: { w: 0.22, h: 0.25 },
};

const CardShell = styled(motion.button)`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height};
  background: white;
  padding: 0;
  border: 0;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(11, 16, 24, 0.18);
  overflow: hidden;
  transform-origin: center;
  will-change: transform, box-shadow;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.orange};
    outline-offset: 4px;
  }
`;

const CardMedia = styled(motion.div)`
  position: absolute;
  inset: 0;
  & img { object-fit: cover; }
`;

const Detail = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 250;
  background: rgba(11, 16, 24, 0.85);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  padding: 1.5rem;
`;

const DetailCard = styled(motion.div)`
  background: white;
  color: ${({ theme }) => theme.colors.navy};
  border-radius: 8px;
  max-width: 720px;
  width: 100%;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);

  @media (min-width: 700px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DetailImage = styled(motion.div)`
  position: relative;
  aspect-ratio: 4 / 5;
  background: ${({ theme }) => theme.colors.skyBlueLight};
  & img { object-fit: cover; }

  @media (min-width: 700px) {
    aspect-ratio: auto;
    min-height: 380px;
  }
`;

const DetailBody = styled(motion.div)`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  & h3 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.5rem;
    margin: 0;
  }

  & .cat {
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.orange};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }

  & p {
    margin: 0;
    line-height: 1.55;
    color: ${({ theme }) => theme.colors.grey};
  }
`;

const Close = styled.button`
  align-self: flex-end;
  background: transparent;
  border: 0;
  color: ${({ theme }) => theme.colors.navy};
  font-size: 1.5rem;
  cursor: pointer;
  margin-top: auto;
`;

const positionFor = (card, idx) => {
  const size = sizeMap[card.size] || sizeMap.md;
  const col = Math.max(1, Math.min(12, card.col || ((idx % 6) + 1)));
  const row = Math.max(1, Math.min(6, card.row || (Math.floor(idx / 6) + 1)));
  const left = ((col - 1) / 12) * 100;
  const top = ((row - 1) / 6) * 100;
  return {
    top: `${top}%`,
    left: `${left}%`,
    width: `${size.w * 100}%`,
    height: `${size.h * 100}%`,
    rotate: card.rotate ?? 0,
  };
};

/**
 * Single card. Pulled into its own component so each card can own its
 * idle-float animation and mouse-parallax tilt independently.
 */
function FloatingCard({ card, index, position, mouse, onOpen, reduceMotion }) {
  // Each card gets a slightly different idle motion so they don't all bob in sync
  const seed = index * 7;
  const driftX = (seed % 5) - 2;          // -2..2 px
  const driftY = ((seed * 3) % 7) - 3;    // -3..3 px
  const driftRot = ((seed * 11) % 5) - 2; // -2..2 deg around base rotation
  const duration = 4 + ((index * 13) % 5); // 4..8s

  // Mouse parallax — different multiplier per card so they don't all move identically
  const parallaxStrength = 0.6 + ((index % 3) * 0.4); // 0.6..1.4
  const parallaxX = reduceMotion ? 0 : mouse.x * parallaxStrength * 14;
  const parallaxY = reduceMotion ? 0 : mouse.y * parallaxStrength * 14;

  const idle = reduceMotion
    ? {}
    : {
        x: [parallaxX - driftX, parallaxX + driftX, parallaxX - driftX],
        y: [parallaxY - driftY, parallaxY + driftY, parallaxY - driftY],
        rotate: [
          position.rotate + driftRot,
          position.rotate - driftRot,
          position.rotate + driftRot,
        ],
      };

  return (
    <CardShell
      layoutId={`card-${card.title || index}`}
      $top={position.top}
      $left={position.left}
      $width={position.width}
      $height={position.height}
      initial={{ opacity: 0, scale: 0.6, rotate: position.rotate }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: position.rotate,
        ...idle,
      }}
      transition={{
        opacity: { delay: index * 0.04, duration: 0.6 },
        scale: { delay: index * 0.04, type: "spring", stiffness: 90, damping: 14 },
        rotate: reduceMotion
          ? { delay: index * 0.04, duration: 0.5 }
          : { duration, repeat: Infinity, ease: "easeInOut" },
        x: reduceMotion
          ? { duration: 0.4 }
          : { duration, repeat: Infinity, ease: "easeInOut" },
        y: reduceMotion
          ? { duration: 0.4 }
          : { duration, repeat: Infinity, ease: "easeInOut" },
      }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.35 } }}
      whileHover={{
        scale: 1.08,
        rotate: 0,
        zIndex: 5,
        boxShadow: "0 20px 40px rgba(11,16,24,0.28)",
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onOpen(card)}
      aria-label={card.title}
    >
      <CardMedia layoutId={`card-media-${card.title || index}`}>
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="20vw"
          style={{ objectFit: "cover" }}
        />
      </CardMedia>
    </CardShell>
  );
}

export default function FloatingCards({ cards, activeCategory }) {
  const [open, setOpen] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const boardRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const visibleCards = useMemo(() => {
    if (!cards) return [];
    if (activeCategory === "all") return cards;
    return cards.filter((c) => c.category === activeCategory);
  }, [cards, activeCategory]);

  const handleMouseMove = (e) => {
    if (reduceMotion || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    // Normalised -1..1 from board centre
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ x, y });
  };

  const handleMouseLeave = () => setMouse({ x: 0, y: 0 });

  return (
    <>
      <Board ref={boardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <Inner>
          <AnimatePresence mode="popLayout">
            {visibleCards.map((card, i) => {
              const pos = positionFor(card, i);
              return (
                <FloatingCard
                  key={(card.title || "card") + i}
                  card={card}
                  index={i}
                  position={pos}
                  mouse={mouse}
                  onOpen={setOpen}
                  reduceMotion={reduceMotion}
                />
              );
            })}
          </AnimatePresence>
        </Inner>
      </Board>

      <AnimatePresence>
        {open && (
          <Detail
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
          >
            <DetailCard
              layoutId={`card-${open.title}`}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DetailImage layoutId={`card-media-${open.title}`}>
                <Image
                  src={open.image}
                  alt={open.title}
                  fill
                  sizes="(max-width: 700px) 100vw, 360px"
                  style={{ objectFit: "cover" }}
                />
              </DetailImage>
              <DetailBody
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.35 } }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
              >
                <span className="cat">{open.category}</span>
                <h3>{open.title}</h3>
                <p>{open.story || "More on this story coming soon."}</p>
                <Close type="button" onClick={() => setOpen(null)} aria-label="Close">×</Close>
              </DetailBody>
            </DetailCard>
          </Detail>
        )}
      </AnimatePresence>
    </>
  );
}
