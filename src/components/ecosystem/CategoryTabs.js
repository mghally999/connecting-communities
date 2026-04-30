"use client";

import styled from "styled-components";

const Bar = styled.div`
  position: sticky;
  bottom: 1.25rem;
  z-index: 10;
  display: flex;
  justify-content: center;
  pointer-events: none;
  margin-top: 1rem;
`;

const Pills = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0.4rem;
  border: 1px solid rgba(11, 16, 24, 0.08);
  border-radius: 999px;
  box-shadow: 0 12px 32px rgba(11, 16, 24, 0.10);
  pointer-events: auto;
  flex-wrap: wrap;
  justify-content: center;
  max-width: calc(100vw - 2rem);
`;

const Pill = styled.button`
  border: 0;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.navy : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? "white" : theme.colors.navy};
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    background ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};
  &:hover { background: ${({ theme }) => theme.colors.creamGrey}; color: ${({ theme }) => theme.colors.navy}; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.orange};
    outline-offset: 2px;
  }
`;

export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <Bar>
      <Pills role="tablist" aria-label="Filter stories">
        <Pill
          type="button"
          $active={active === "all"}
          onClick={() => onChange("all")}
        >
          All
        </Pill>
        {categories.map((c) => (
          <Pill
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            $active={active === c.id}
            onClick={() => onChange(c.id)}
          >
            {c.label}
          </Pill>
        ))}
      </Pills>
    </Bar>
  );
}
