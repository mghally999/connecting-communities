"use client";

import Image from "next/image";
import styled from "styled-components";

const Box = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.skyBlueLight} 0%,
    ${({ theme }) => theme.colors.cream} 100%
  );
`;

const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.navy};
  opacity: 0.45;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(
      45deg,
      transparent 0 14px,
      rgba(11,16,24,0.04) 14px 15px
    );
`;

/**
 * Wraps next/image with a fall-through placeholder if no src is provided.
 * Always uses fill mode so the parent controls the dimensions.
 */
export default function SmartImage({
  src,
  alt = "",
  priority = false,
  fallbackLabel = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  style,
}) {
  if (!src) {
    return (
      <Box style={style}>
        <Placeholder>{fallbackLabel || alt}</Placeholder>
      </Box>
    );
  }

  return (
    <Box style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: "cover", objectPosition: "center" }}
      />
    </Box>
  );
}
