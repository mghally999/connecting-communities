"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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

const Card = styled(motion.button)`
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
  &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.orange}; outline-offset: 4px; }
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
  @media (min-width: 700px) { grid-template-columns: 1fr 1fr; }
`;

const DetailImage = styled.div`
  position: relative;
  aspect-ratio: 4 / 5;
  background: ${({ theme }) => theme.colors.skyBlueLight};
  @media (min-width: 700px) { aspect-ratio: auto; min-height: 380px; }
`;

const DetailBody = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  & h3 { font-family: ${({ theme }) => theme.fonts.heading}; font-size: 1.5rem; margin: 0; }
  & .cat {
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.orange};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }
  & p { margin: 0; line-height: 1.55; color: ${({ theme }) => theme.colors.grey}; }
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: ({ rotate, delay }) => ({
    opacity: 1,
    scale: 1,
    rotate,
    transition: { delay: delay * 0.04, duration: 0.7, type: "spring", stiffness: 80, damping: 14 },
  }),
  hover: { scale: 1.06, rotate: 0, zIndex: 5, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.35 } },
};

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

export default function FloatingCards({ cards, activeCategory }) {
  const [open, setOpen] = useState(null);
  const visibleCards = useMemo(() => {
    if (!cards) return [];
    if (activeCategory === "all") return cards;
    return cards.filter((c) => c.category === activeCategory);
  }, [cards, activeCategory]);

  return (
    <>
      <Board>
        <Inner>
          <AnimatePresence mode="popLayout">
            {visibleCards.map((card, i) => {
              const pos = positionFor(card, i);
              return (
                <Card
                  key={(card.title || "card") + i}
                  layout
                  variants={cardVariants}
                  custom={{ rotate: pos.rotate, delay: i }}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  $top={pos.top}
                  $left={pos.left}
                  $width={pos.width}
                  $height={pos.height}
                  onClick={() => setOpen(card)}
                  aria-label={card.title}
                >
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="20vw"
                    style={{ objectFit: "cover" }}
                  />
                </Card>
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
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
          >
            <DetailCard
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DetailImage>
                <Image
                  src={open.image}
                  alt={open.title}
                  fill
                  sizes="(max-width: 700px) 100vw, 360px"
                  style={{ objectFit: "cover" }}
                />
              </DetailImage>
              <DetailBody>
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
