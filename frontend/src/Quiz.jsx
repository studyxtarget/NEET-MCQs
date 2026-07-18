import React, { useState } from "react";
import { submitQuiz } from "./api";

export default function Quiz({ quizData, onFinished }) {
  const { doc_id: docId, questions } = quizData;
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState({}); // question_index -> selected_index
  const [submitting, setSubmitting] = useState(false);

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const hasPicked = picked[current] !== undefined;

  const handlePick = (idx) => {
    if (hasPicked) return;
    setPicked((prev) => ({ ...prev, [current]: idx }));
  };

  const handleNext = async () => {
    if (!isLast) {
      setCurrent((c) => c + 1);
      return;
    }
    // last question -> submit everything
    setSubmitting(true);
    const answers = Object.entries(picked).map(([qIdx, selIdx]) => ({
      question_index: Number(qIdx),
      selected_index: selIdx,
    }));
    try {
      const result = await submitQuiz({ docId, answers });
      onFinished(result);
    } catch (err) {
      alert(`Could not submit quiz: ${err.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="font-mono text-xs text-[#9FC9BE]">
          Question {current + 1}/{questions.length}
        </span>
        <div className="flex-1 mx-4 h-1.5 bg-[#1B3A33] rounded overflow-hidden">
          <div
            className="h-full bg-gold transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-panel border border-border rounded-xl p-6">
        {q.source_year && (
          <div className="font-mono text-xs text-[#5C8579] mb-2">
            {q.source_year}
          </div>
        )}
        <p className="text-[#EDEDE3] text-base leading-relaxed whitespace-pre-line mb-5">
          {q.question}
        </p>

        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.correct_index;
            const isPicked = idx === picked[current];
            let classes =
              "border-[#254B42] bg-ink text-[#D8D8CC] hover:border-gold";
            if (hasPicked) {
              if (isCorrect) classes = "border-mint bg-mint/10 text-[#B9E8CE]";
              else if (isPicked) classes = "border-rose bg-rose/10 text-[#F0B5AE]";
              else classes = "border-[#1E3A33] text-[#5C7269]";
            }
            return (
              <div
                key={idx}
                onClick={() => handlePick(idx)}
                className={`border rounded-lg px-4 py-3 text-sm cursor-pointer transition-colors flex items-center gap-3 ${classes}`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] flex-shrink-0">
                  {String.fromCharCode(97 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
                {hasPicked && isCorrect && <span>✓</span>}
                {hasPicked && isPicked && !isCorrect && <span>✕</span>}
              </div>
            );
          })}
        </div>

        {hasPicked && q.explanation && (
          <div className="mt-4 text-xs text-[#9FC9BE] bg-ink/40 rounded p-3">
            {q.explanation}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!hasPicked || submitting}
          className="w-full bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 mt-6 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {submitting ? "Submitting…" : isLast ? "Finish Quiz" : "Next"}
        </button>
      </div>
    </div>
  );
}
