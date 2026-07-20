import React from "react";

export default function Instructions({ quizData, onStart }) {
  const { questions, mode, settings = {} } = quizData;
  const {
    timerEnabled = false,
    totalSeconds = null,
    negativeMarking = false,
    correctMarks = 4,
    negativeMarks = 1,
  } = settings;

  const totalMinutes = totalSeconds ? Math.round(totalSeconds / 60) : null;

  return (
    <div className="max-w-lg mx-auto bg-panel border border-border rounded-xl p-8">
      <div className="text-xs tracking-[3px] text-gold mb-2">STEP 2</div>
      <h2 className="font-display text-2xl text-[#F4EFE0] mb-6">
        Before you start
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <InfoCard label="Questions" value={questions.length} />
        <InfoCard
          label="Duration"
          value={timerEnabled ? `${totalMinutes} min` : "No limit"}
        />
        <InfoCard
          label="Marking"
          value={
            negativeMarking ? `+${correctMarks} / −${negativeMarks}` : `+${correctMarks} only`
          }
        />
        <InfoCard
          label="Source"
          value={mode === "extract_existing" ? "PYQ bank" : "AI-generated"}
        />
      </div>

      <div className="text-xs tracking-[2px] text-[#6E9B8D] mb-3">
        INSTRUCTIONS
      </div>
      <ul className="space-y-2 text-sm text-[#D8D8CC] mb-8">
        <li className="flex gap-2">
          <span className="text-gold">·</span>
          Each question has exactly one correct option.
        </li>
        <li className="flex gap-2">
          <span className="text-gold">·</span>
          Tapping an option locks it in — you'll see the right answer and a
          short explanation right after.
        </li>
        <li className="flex gap-2">
          <span className="text-gold">·</span>
          Use "Skip" if you don't want to attempt a question.
        </li>
        {negativeMarking && (
          <li className="flex gap-2">
            <span className="text-gold">·</span>
            Wrong answers deduct {negativeMarks} mark
            {negativeMarks === 1 ? "" : "s"}. Skipped questions score zero —
            no penalty.
          </li>
        )}
        {timerEnabled && (
          <li className="flex gap-2">
            <span className="text-gold">·</span>
            You have {totalMinutes} minute{totalMinutes === 1 ? "" : "s"} for
            the whole quiz. It auto-submits when time runs out, so pace
            yourself.
          </li>
        )}
      </ul>

      <button
        onClick={onStart}
        className="w-full bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 hover:opacity-90 transition-opacity"
      >
        Start Exam
      </button>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-ink/40 border border-border rounded-lg px-4 py-3">
      <div className="font-mono text-[10px] tracking-wide text-[#6E9B8D] mb-1">
        {label.toUpperCase()}
      </div>
      <div className="text-[#F4EFE0] text-sm font-medium">{value}</div>
    </div>
  );
}
