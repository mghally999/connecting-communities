"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useState, useEffect } from "react";
import styled, { css } from "styled-components";

import Logo from "./Logo";

/**
 * Sticky header. The navy backdrop has a slight blur and a subtle
 * underline shadow once the user scrolls past the first 12 px. Alpha
 * is fixed; the previous fade-to-translucent behaviour was dropped
 * because Hana asked for a more solid/darker navigation that reads
 * the same against every page background.
 */
const Bar = styled.header`
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  height: ${({ theme }) => theme.layout.headerHeight};
  display: flex;
  align-items: center;
  background: rgba(33, 56, 79, ${({ $alpha }) => $alpha});
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: background 240ms ease, box-shadow 240ms ease;
  ${({ $scrolled, theme }) =>
    $scrolled &&
    css`
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);
    `}
  @media (max-width: 768px) {
    height: 72px;
  }
`;

const Inner = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 0 2.5rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 2rem;
  @media (max-width: 1024px) {
    padding: 0 1.5rem;
    grid-template-columns: auto auto;
    justify-content: space-between;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 2.5rem;
  @media (max-width: 1024px) { display: none; }
`;

const NavItem = styled(Link)`
  position: relative;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  color: rgba(255, 255, 255, 0.92);
  padding: 0.4rem 0;
  white-space: nowrap;
  transition: color ${({ theme }) => theme.transitions.fast};
  ${({ $active, theme }) =>
    $active &&
    css`
      color: ${theme.colors.orange};
      text-decoration: underline;
      text-underline-offset: 6px;
      text-decoration-thickness: 1.5px;
    `}
  &:hover { color: ${({ theme }) => theme.colors.orange}; }
`;

const MobileBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: ${({ theme }) => theme.colors.white};
  @media (min-width: 1025px) { display: none; }
`;

const MobileSheet = styled.div`
  position: fixed;
  inset: 72px 0 0 0;
  background: ${({ theme }) => theme.colors.navy};
  z-index: ${({ theme }) => theme.zIndex.sticky};
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transform: translateY(${({ $open }) => ($open ? "0" : "-110%")});
  transition: transform ${({ theme }) => theme.transitions.base};
  @media (min-width: 1025px) { display: none; }
`;

const MobileItem = styled(Link)`
  font-size: 1.5rem;
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 0.6rem;
  &:hover { color: ${({ theme }) => theme.colors.orange}; }
`;

function Header({ navLinks }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [alpha, setAlpha] = useState(1);
  const [open, setOpen] = useState(false);

  /* The /talent experience is a self-contained world (its own brand,
   * its own foam wordmark, its own colour shifts). Bail out before
   * rendering so neither the Bar nor the 92-px spacer ends up in the
   * DOM there. */
  if (pathname === "/talent" || pathname?.startsWith("/talent/")) return null;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      // subtle solidifying: 0.88 at top → 1.0 once scrolled
      const a = Math.min(1, 0.88 + y / 600);
      setAlpha(a);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = useCallback(
    (href) => {
      if (href === "/") return pathname === "/";
      /* Exact match, or a true sub-path (with trailing slash) — never
       * a prefix match, otherwise /our-model would also light up the
       * /our-model-2 link and vice versa. */
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  return (
    <>
      <Bar $scrolled={scrolled} $alpha={alpha}>
        <Inner>
          <Link href="/" aria-label="Home"><Logo variant="light" /></Link>

          <Nav>
            {navLinks.map((l) => (
              <NavItem
                key={l.href + l.label}
                href={l.href}
                $active={isActive(l.href)}
                prefetch
              >
                {l.label}
              </NavItem>
            ))}
          </Nav>

          <MobileBtn
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              )}
            </svg>
          </MobileBtn>
        </Inner>
      </Bar>

      <MobileSheet $open={open} aria-hidden={!open}>
        {navLinks.map((l) => (
          <MobileItem key={"m-" + l.href} href={l.href}>{l.label}</MobileItem>
        ))}
      </MobileSheet>

      {/* Spacer so content doesn't jump under the fixed header */}
      <div style={{ height: "92px" }} className="header-spacer" />
    </>
  );
}

export default memo(Header);
