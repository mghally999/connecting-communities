"use client";

import Link from "next/link";
import { memo } from "react";
import styled from "styled-components";
import Logo from "./Logo";

const Wrap = styled.footer`
  background: ${({ theme }) => theme.colors.cream};
  color: ${({ theme }) => theme.colors.navy};
  border-top: 1px solid ${({ theme }) => theme.colors.greyBg};
`;
const Inner = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 3rem 2.5rem 2rem;
  display: grid;
  gap: 2rem;
  align-items: start;
  grid-template-columns: 1fr 2fr;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 2.5rem 1.5rem 1.5rem;
  }
`;
const Cols = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  justify-content: end;
  @media (max-width: 640px) { grid-template-columns: 1fr 1fr; }
`;
const Col = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  a {
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.navy};
    text-transform: uppercase;
    transition: color ${({ theme }) => theme.transitions.fast};
    &:hover { color: ${({ theme }) => theme.colors.orange}; }
  }
`;
const Bar = styled.div`
  background: ${({ theme }) => theme.colors.orange};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.72rem;
  text-align: center;
  padding: 0.5rem 1rem;
  letter-spacing: 0.02em;
`;

function Footer({ settings }) {
  const cols = settings?.footerColumns || [];
  return (
    <Wrap>
      <Inner>
        <div><Logo /></div>
        <Cols>
          {cols.map((c, i) => (
            <Col key={i}>
              {c.links?.map((l) => (
                <li key={l.label + l.href}>
                  <Link href={l.href || "#"}>{l.label}</Link>
                </li>
              ))}
            </Col>
          ))}
        </Cols>
      </Inner>
      <Bar>{settings?.copyright}</Bar>
    </Wrap>
  );
}

export default memo(Footer);
