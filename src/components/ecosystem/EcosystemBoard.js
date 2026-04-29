"use client";

import { useState } from "react";
import CategoryTabs from "./CategoryTabs";
import FloatingCards from "./FloatingCards";

export default function EcosystemBoard({ data }) {
  const [active, setActive] = useState("all");
  return (
    <>
      <FloatingCards cards={data.cards} activeCategory={active} />
      <div style={{ position: "relative", marginTop: "-380px", zIndex: 5 }}>
        <CategoryTabs categories={data.categories} active={active} onChange={setActive} />
      </div>
      <div style={{ height: "60px" }} />
    </>
  );
}
