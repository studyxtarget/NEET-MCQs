import React from "react";

export default function QuestionPalette({
  questions,
  current,
  picked,
  submitted,
  marked,
  visited,
  onJump,
  onClose,
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
            className="text-[#9FC9BE] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 mb-6">
          {questions.map((q, idx) => {
            let paletteClass = "bg-ink border-border text-[#5C7269]";

            if (submitted) {
              if (picked[idx] === undefined) {
                paletteClass = "bg-ink border-border text-[#5C7269]";
              } else if (picked[idx] === questions[idx].correct_index) {
                paletteClass = "bg-mint/20 border-mint text-mint";
              } else {
                paletteClass = "bg-rose/20 border-rose text-rose";
              }
            } else {
              if (marked[idx]) {
                paletteClass =
                  "bg-purple-500/20 border-purple-500 text-purple-400";
              } else if (picked[idx] !== undefined && picked[idx] !== "skipped") {
                paletteClass = "bg-mint/20 border-mint text-mint";
              } else if (visited[idx]) {
                paletteClass = "bg-gold/20 border-gold text-gold";
              }

              if (idx === current) {
                paletteClass += " ring-2 ring-gold";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => onJump(idx)}
                className={`h-8 w-8 rounded-md border text-xs font-mono flex items-center justify-center transition-colors ${paletteClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-[#9FC9BE] font-mono">
          <Legend swatch="bg-mint/20 border-mint" label="Answered" />
          <Legend swatch="bg-gold/20 border-gold" label="Visited" />
          <Legend swatch="bg-ink border-border" label="Not visited" />
          <Legend
            swatch="bg-purple-500/20 border-purple-500"
            label="Marked for review"
          />
          {submitted && (
            <Legend swatch="bg-rose/20 border-rose" label="Wrong" />
          )}
        </div>
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
