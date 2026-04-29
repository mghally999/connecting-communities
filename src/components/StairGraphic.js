"use client";

import styled from "styled-components";

/**
 * The orange stair-step grid graphic from the figma. Reproduced as
 * pure SVG: a 6×4 light grid with bold orange segments tracing a
 * staircase from bottom-left to top-right. Per the latest Figma the
 * staircase runs to the right edge — not to top-right — with the
 * accent only along the lower-right portion.
 */
const Wrap = styled.div`
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1.5 / 1;
`;

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
  & .grid-line {
    stroke: #DEE3E7;
    stroke-width: 1.5;
    fill: none;
  }
  & .accent {
    stroke: ${({ theme }) => theme.colors.orange};
    stroke-width: 6;
    stroke-linecap: square;
    stroke-linejoin: miter;
    fill: none;
  }
`;

export default function StairGraphic() {
  const COLS = 6;
  const ROWS = 4;
  const W = 480;
  const H = 320;
  const cw = W / COLS;
  const rh = H / ROWS;

  // Bottom-left → up to right edge, ending mid-height
  const path = [
    "M", cw,        H,
    "L", cw,        H - rh * 0.4,
    "L", cw * 1.6,  H - rh * 0.4,
    "L", cw * 1.6,  H - rh * 1.2,
    "L", cw * 2.4,  H - rh * 1.2,
    "L", cw * 2.4,  H - rh * 2.0,
    "L", cw * 3.4,  H - rh * 2.0,
    "L", cw * 3.4,  H - rh * 2.8,
    "L", cw * 4.4,  H - rh * 2.8,
    "L", cw * 4.4,  H - rh * 3.6,
    "L", W,         H - rh * 3.6,
  ].join(" ");

  const verticals = Array.from({ length: COLS + 1 }, (_, i) => i * cw);
  const horizontals = Array.from({ length: ROWS + 1 }, (_, i) => i * rh);

  return (
    <Wrap aria-hidden="true">
      <Svg viewBox={`0 0 ${W} ${H}`}>
        {verticals.map((x) => (
          <line key={"v" + x} className="grid-line" x1={x} y1={0} x2={x} y2={H} />
        ))}
        {horizontals.map((y) => (
          <line key={"h" + y} className="grid-line" x1={0} y1={y} x2={W} y2={y} />
        ))}
        <path className="accent" d={path} />
      </Svg>
    </Wrap>
  );
}
