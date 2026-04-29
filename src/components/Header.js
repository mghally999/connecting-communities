"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useState, useEffect } from "react";
import styled, { css } from "styled-components";

import Logo from "./Logo";

/**
 * Sticky header. The white background fades from fully opaque (1.0)
 * down to ~0.78 as the user scrolls past the first 200px, giving the
 * impression that the page content shows softly through.
 */
const Bar = styled.header`
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  height: ${({ theme }) => theme.layout.headerHeight};
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, ${({ $alpha }) => $alpha});
  backdrop-filter: blur(${({ $alpha }) => ($alpha < 0.95 ? "10px" : "0")});
  -webkit-backdrop-filter: blur(${({ $alpha }) => ($alpha < 0.95 ? "10px" : "0")});
  transition: background 240ms ease, box-shadow 240ms ease;
  ${({ $scrolled, theme }) =>
    $scrolled &&
    css`
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
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
  color: ${({ theme }) => theme.colors.navy};
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
  border: 1px solid ${({ theme }) => theme.colors.greyBg};
  background: transparent;
  color: ${({ theme }) => theme.colors.navy};
  @media (min-width: 1025px) { display: none; }
`;

const MobileSheet = styled.div`
  position: fixed;
  inset: 72px 0 0 0;
  background: ${({ theme }) => theme.colors.white};
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
  color: ${({ theme }) => theme.colors.navy};
  border-bottom: 1px solid ${({ theme }) => theme.colors.greyBg};
  padding-bottom: 0.6rem;
  &:hover { color: ${({ theme }) => theme.colors.orange}; }
`;

function Header({ navLinks }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [alpha, setAlpha] = useState(1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      // fade from 1 → 0.78 over the first 250px
      const a = Math.max(0.78, 1 - y / 1200);
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
      return pathname.startsWith(href);
    },
    [pathname]
  );

  return (
    <>
      <Bar $scrolled={scrolled} $alpha={alpha}>
        <Inner>
          <Link href="/" aria-label="Home"><Logo /></Link>

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
