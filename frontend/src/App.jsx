import React from "react";
import Home from "./Home";

export default function App() {
  return (
    <div className="min-h-screen bg-ink text-[#F4EFE0]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-ink/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-xl">
              🧠
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[3px] uppercase text-gold">
                AI Powered
              </div>

              <h1 className="font-display text-2xl text-[#F4EFE0]">
                NEET AI Quiz
              </h1>

              <p className="text-xs text-[#6E9B8D]">
                Smart MCQ Generator & Practice Platform
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-panel border border-border text-[11px] text-[#9FC9BE] font-mono">
              PYQ
            </span>

            <span className="px-3 py-1 rounded-full bg-panel border border-border text-[11px] text-[#9FC9BE] font-mono">
              AI MCQs
            </span>

            <span className="px-3 py-1 rounded-full bg-panel border border-border text-[11px] text-[#9FC9BE] font-mono">
              Analytics
            </span>
          </div>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Home />
      </main>
    </div>
  );
}
