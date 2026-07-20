import React from "react";

export default function QuestionPalette({
  questions,
  current,
  answers,
  flagged,
  visited,
  onJump,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-panel border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display text-lg text-[#F4EFE0]">
            Question Palette
          </h3>
          <button
            onClick={onClose}
            className="text-[#8A9490] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2 mb-5">
          {questions.map((_, idx) => {
            const isAnswered = answers[idx] !== undefined;
            const isFlagged = flagged.has(idx);
            const isVisited = visited.has(idx);
            const isCurrent = idx === current;

            let classes = "bg-ink border-[#262E2C] text-[#6B7873]"; // not visited
            if (isVisited && !isAnswered) classes = "bg-ink border-gold text-gold";
            if (isAnswered) classes = "bg-mint/20 border-mint text-[#C9E3D3]";
            if (isFlagged) classes = "bg-rose/20 border-rose text-[#F0C4BE]";

            return (
              <button
                key={idx}
                onClick={() => onJump(idx)}
                className={`relative aspect-square rounded-lg text-xs font-mono flex items-center justify-center border transition-colors ${classes} ${
                  isCurrent ? "ring-2 ring-gold" : ""
                }`}
              >
                {idx + 1}
                {isFlagged && (
                  <span className="absolute -top-1.5 -right-1.5 text-[10px]">
                    🚩
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-[#8A9490] font-mono mb-6">
          <Legend swatch="bg-mint/30 border-mint" label="Answered" />
          <Legend swatch="bg-ink border-gold" label="Visited" />
          <Legend swatch="bg-ink border-[#262E2C]" label="Not visited" />
          <Legend swatch="bg-rose/30 border-rose" label="Flagged" />
        </div>

        <button
          onClick={onSubmit}
          className="w-full bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 hover:opacity-90 transition-opacity"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded border ${swatch}`} />
      {label}
    </span>
  );
}
