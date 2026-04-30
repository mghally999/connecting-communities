"use client";

import styled from "styled-components";

/**
 * The brand stair grid from the WhatsApp reference + Brand Guidelines.
 *
 * Layout: a soft grey grid of rounded-square cells; the lower-right portion
 * has THREE L-shaped orange pieces forming a staggered staircase.
 *
 * Each L = a vertical stroke + a horizontal stroke meeting at a rounded
 * inner corner, tracing the OUTSIDE of a 2×2 cell block.
 *
 *   L-shape (per cell-block):
 *
 *     ┌─┐    ← top right corner of the L (vertical stroke goes down)
 *     │ │
 *     │ │
 *     │ └──  ← curves at the inner corner, then horizontal goes right
 *
 * The grid is 9 columns × 7 rows of rounded squares with breathing gap.
 * The L-pieces sit on the right half: stairs climb up-right with one
 * cell-step per piece.
 */

const Wrap = styled.div`
  width: 100%;
  max-width: 520px;
  aspect-ratio: 9 / 7;
`;

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
  & .cell {
    fill: none;
    stroke: #E7EAEC;
    stroke-width: 4;
    rx: 8;
  }
  & .accent {
    stroke: ${({ theme }) => theme.colors.orange};
    stroke-width: 14;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }
`;

const COLS = 9;
const ROWS = 7;
const CELL = 100;       // cell size in viewBox units
const GAP = 12;         // gap between cells (visual breathing)
const RADIUS = 12;      // rounded corner radius for each cell

const VB_W = COLS * CELL;
const VB_H = ROWS * CELL;

/**
 * Build an L-shape path for a 2x2 cell block whose top-left is (cx, cy).
 * Strokes trace the inside edges: down the left side of the right column,
 * curving around the inner bottom-right, then across the bottom of the
 * bottom row.
 *
 *     col1 col2
 *  r1  .   ▓      <- vertical stroke is the left edge of col2
 *  r2  ▓▓▓▓       <- horizontal stroke is the top edge of r2
 *
 * Coordinates within the block:
 *   left_of_col2_x = cx + CELL
 *   top_of_r1_y    = cy
 *   bottom_of_r1_y = cy + CELL
 *   right_of_col2_x= cx + 2*CELL
 *   top_of_r2_y    = cy + CELL
 *   bottom_of_r2_y = cy + 2*CELL
 *
 * The L follows: start at top-of-vertical → down to the inner corner →
 * right to the end of the horizontal.  We add an arc at the inner corner
 * for the rounded join.
 */
function lPath(cx, cy) {
  const x1 = cx + CELL;            // vertical stroke x
  const y0 = cy + 6;               // top of vertical (start)
  const yMid = cy + CELL;          // junction y
  const xEnd = cx + 2 * CELL - 6;  // right end of horizontal
  const r = 18;                    // arc radius at the junction
  return [
    `M ${x1} ${y0}`,
    `L ${x1} ${yMid - r}`,
    `Q ${x1} ${yMid} ${x1 + r} ${yMid}`,
    `L ${xEnd} ${yMid}`,
  ].join(" ");
}

export default function StairGraphic() {
  // Grid cells
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * CELL + GAP / 2;
      const y = r * CELL + GAP / 2;
      cells.push({
        x, y,
        w: CELL - GAP,
        h: CELL - GAP,
        key: `${r}-${c}`,
      });
    }
  }

  /* Three staggered L-pieces forming the brand stair, anchored to the
   * lower-right quadrant of the grid (matches the WhatsApp reference).
   * Each L spans a 2×2 cell footprint; subsequent Ls move (-2 cols, -1 row)
   * relative to the previous so the inner corner sits one cell up + two
   * cells back from the prior corner. */
  const ls = [
    { col: 5, row: 4 },   // bottom-left L
    { col: 6, row: 3 },   // middle L (shifted up + right one cell)
    { col: 7, row: 2 },   // top-right L
  ];

  return (
    <Wrap aria-hidden="true">
      <Svg viewBox={`0 0 ${VB_W} ${VB_H}`}>
        {cells.map((c) => (
          <rect
            key={c.key}
            className="cell"
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            rx={RADIUS}
            ry={RADIUS}
          />
        ))}
        {ls.map((l, i) => (
          <path
            key={`l-${i}`}
            className="accent"
            d={lPath(l.col * CELL, l.row * CELL)}
          />
        ))}
      </Svg>
    </Wrap>
  );
}
