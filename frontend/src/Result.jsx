import React from "react";

export default function Result({ result, onRestart }) {
  const { score, total, percentage, weak_topics } = result;

  return (
    <div className="max-w-lg mx-auto bg-panel border border-border rounded-xl p-8 text-center">
      <div className="text-xs tracking-[3px] text-gold mb-2">RESULT</div>
      <h2 className="font-display text-4xl text-[#F4EFE0] mb-1">
        {score}/{total}
      </h2>
      <p className="text-sm text-[#9FC9BE] mb-8">{percentage}% correct</p>

      {weak_topics?.length > 0 && (
        <div className="text-left mb-8">
          <div className="text-xs tracking-[2px] text-[#6E9B8D] mb-3">
            TOPIC BREAKDOWN
          </div>
          <div className="space-y-2">
            {weak_topics.map((t) => {
              const color =
                t.accuracy < 50
                  ? "text-rose"
                  : t.accuracy < 75
                  ? "text-gold"
                  : "text-mint";
              return (
                <div
                  key={t.topic}
                  className="flex justify-between items-center bg-ink/40 rounded px-4 py-2 text-sm"
                >
                  <span className="text-[#D8D8CC]">{t.topic}</span>
                  <span className={`font-mono ${color}`}>
                    {t.correct}/{t.total} · {t.accuracy}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={onRestart}
        className="w-full bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 hover:opacity-90 transition-opacity"
      >
        Try Another PDF
      </button>
    </div>
  );
}
