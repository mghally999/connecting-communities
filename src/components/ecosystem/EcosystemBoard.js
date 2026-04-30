"use client";

import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import Image from "next/image";
import CategoryTabs from "./CategoryTabs";
import FloatingCards from "./FloatingCards";

/**
 * EcosystemBoard
 *
 * Composes the floating gallery, the category filter pills, and an
 * immersive story modal. Clicking a card opens the story to ~85% of the
 * viewport per the client's request that "the story should take up the
 * majority of the page".
 */

const Modal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(11, 16, 24, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 4vh 4vw;
  animation: fadein 320ms cubic-bezier(0.22, 1, 0.36, 1);
  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

const Sheet = styled.div`
  position: relative;
  width: min(1280px, 100%);
  height: min(92vh, 900px);
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background: ${({ theme }) => theme.colors.cream};
  overflow: hidden;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.4);
  animation: pop 380ms cubic-bezier(0.22, 1, 0.36, 1);
  @keyframes pop {
    from { transform: scale(0.96); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: 40vh 1fr;
    height: 92vh;
  }
`;

const Pic = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.skyBlueLight};
  & img { object-fit: cover; }
`;

const Body = styled.div`
  padding: clamp(1.6rem, 4vw, 3.5rem);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
`;

const Eyebrow = styled.div`
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.orange};
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`;

const Lede = styled.p`
  font-size: clamp(1rem, 1.2vw, 1.15rem);
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`;

const BodyText = styled.p`
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`;

const Close = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 5;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(11, 16, 24, 0.55);
  color: white;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 200ms;
  &:hover { background: rgba(11, 16, 24, 0.85); }
`;

export default function EcosystemBoard({ data }) {
  const [active, setActive] = useState("all");
  const [open, setOpen] = useState(null);

  const close = useCallback(() => setOpen(null), []);

  // ESC closes the modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <FloatingCards
        cards={data.cards}
        activeCategory={active}
        onSelect={setOpen}
      />
      <CategoryTabs
        categories={data.categories}
        active={active}
        onChange={setActive}
      />

      {open && (
        <Modal onClick={close}>
          <Sheet onClick={(e) => e.stopPropagation()}>
            <Close
              type="button"
              onClick={close}
              aria-label="Close story"
            >
              ×
            </Close>
            <Pic>
              <Image
                src={open.image}
                alt={open.title}
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                priority
              />
            </Pic>
            <Body>
              <Eyebrow>{open.eyebrow || open.category}</Eyebrow>
              <Title>{open.title}</Title>
              {open.story?.intro && <Lede>{open.story.intro}</Lede>}
              {open.story?.body && <BodyText>{open.story.body}</BodyText>}
            </Body>
          </Sheet>
        </Modal>
      )}
    </>
  );
}
