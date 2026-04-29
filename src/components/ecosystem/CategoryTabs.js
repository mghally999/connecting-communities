"use client";

import styled, { css } from "styled-components";

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem auto 0;
`;

const Pill = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.navy};
  padding: 0.35rem;
  border-radius: 999px;
  gap: 0.25rem;
`;

const Tab = styled.button`
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: 0.85rem;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast};
  ${({ $active, theme }) =>
    $active &&
    css`
      background: ${theme.colors.orange};
      color: white;
    `}
  &:hover { color: white; }
`;

export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <Wrap>
      <Pill role="tablist" aria-label="Ecosystem categories">
        <Tab $active={active === "all"} onClick={() => onChange("all")} role="tab" aria-selected={active === "all"}>All</Tab>
        {categories?.map((c) => (
          <Tab
            key={c.id}
            $active={active === c.id}
            onClick={() => onChange(c.id)}
            role="tab"
            aria-selected={active === c.id}
          >
            {c.label}
          </Tab>
        ))}
      </Pill>
    </Wrap>
  );
}
