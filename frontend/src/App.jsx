import React from "react";
import Home from "./Home";

export default function App() {
  return (
    <div className="bg-ink min-h-screen">
      <header className="border-b border-border px-5 py-3 flex items-center justify-between">
        <h1 className="font-display text-base text-[#F4EFE0] tracking-tight">
          NEET AI Quiz
        </h1>
        <span className="font-mono text-[9px] tracking-[2px] text-gold">
          AI-POWERED
        </span>
      </header>
      <Home />
    </div>
  );
}
