import React from "react";
import Home from "./Home";

export default function App() {
  return (
    <div className="bg-ink min-h-screen">
      <header className="border-b border-border px-6 py-5">
        <div className="max-w-lg mx-auto">
          <div className="font-mono text-[11px] tracking-[3px] text-gold mb-1">
            AI-POWERED
          </div>
          <h1 className="font-display text-2xl text-[#F4EFE0]">
            NEET AI Quiz
          </h1>
        </div>
      </header>
      <Home />
    </div>
  );
}
