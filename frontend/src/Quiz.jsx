import React, { useEffect, useRef, useState } from "react";
import { submitQuiz } from "./api";
import QuestionPalette from "./QuestionPalette";

export default function Quiz({ quizData, onFinished, onExit }) {
  const { doc_id: docId, questions, settings = {} } = quizData;
  const {
    timerEnabled = false,
    totalSeconds = null,
    negativeMarking = false,
    correctMarks = 4,
    negativeMarks = 1,
  } = settings;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // idx -> selected option index
  const [flagged, setFlagged] = useState(() => new Set());
  const [bookmarked, setBookmarked] = useState(() => new Set());
  const [visited, setVisited] = useState(() => new Set([0]));
  const [timings, setTimings] = useState({}); // idx -> accumulated seconds
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(totalSeconds);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [exitConfirm, setExitConfirm] = useState(false);
  const [submitConfirm, setSubmitConfirm] = useState(false);

  const questionStartRef = useRef(Date.now());
  const finishQuizRef = useRef(() => {});

  const q = questions[current];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const isLast = current === totalQ - 1;

  // Overall elapsed timer -- used for the "no limit" clock display.
  useEffect(() => {
    const id = setInterval(() => setElapsedTotal((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Whole-quiz countdown. Auto-submits everything answered so far the
  // moment it hits zero.
  useEffect(() => {
    if (!timerEnabled || totalSecondsLeft === null) return;
    if (totalSecondsLeft <= 0) {
      if (!autoSubmitted) {
        setAutoSubmitted(true);
        finishQuizRef.current();
      }
      return;
    }
    const id = setTimeout(() => setTotalSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [totalSecondsLeft, timerEnabled, autoSubmitted]);

  const flushTime = (idx) => {
    const spent = Math.round((Date.now() - questionStartRef.current) / 1000);
    setTimings((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + spent }));
    questionStartRef.current = Date.now();
  };

  const goTo = (idx) => {
    if (idx === current || idx < 0 || idx >= totalQ) return;
    flushTime(current);
    setCurrent(idx);
    setVisited((prev) => new Set(prev).add(idx));
    setPaletteOpen(false);
  };

  const selectOption = (idx) => {
    setAnswers((prev) => ({ ...prev, [current]: idx }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(current) ? next.delete(current) : next.add(current);
      return next;
    });
  };

  const toggleBookmark = () => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(current) ? next.delete(current) : next.add(current);
      return next;
    });
  };

  const finishQuiz = () => {
    flushTime(current);
    const result = computeResult(questions, answers, timings, {
      negativeMarking,
      correctMarks,
      negativeMarks,
    });
    submitQuiz({
      docId,
      answers: Object.entries(answers).map(([qi, si]) => ({
        question_index: Number(qi),
        selected_index: si,
      })),
    }).catch(() => {});
    onFinished(result);
  };
  finishQuizRef.current = finishQuiz;

  const handleSubmitClick = () => {
    if (answeredCount < totalQ) {
      setSubmitConfirm(true);
      return;
    }
    finishQuiz();
  };

  const marksLabel = negativeMarking
    ? `+${correctMarks}/−${negativeMarks}`
    : `+${correctMarks}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 bg-ink/95 backdrop-blur border-b border-border px-4 py-2.5 z-20">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setExitConfirm(true)}
            className="text-[#8A9490] text-lg leading-none px-1"
          >
            ✕
          </button>
          <span className="font-mono text-xs text-[#8A9490]">
            {current + 1} / {totalQ}
          </span>
          <div className="flex items-center gap-3">
            <span
              className={`font-mono text-xs ${
                timerEnabled && totalSecondsLeft <= 60
                  ? "text-rose"
                  : "text-[#8A9490]"
              }`}
            >
              {timerEnabled
                ? formatClock(Math.max(totalSecondsLeft, 0))
                : formatClock(elapsedTotal)}
            </span>
            <button
              onClick={() => setPaletteOpen(true)}
              className="text-[#8A9490] text-base leading-none"
            >
              ☰
            </button>
          </div>
        </div>
        <div className="h-1 bg-[#1B211F] rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all"
            style={{ width: `${((current + 1) / totalQ) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-5 py-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          {q.source_year ? (
            <span className="font-mono text-[11px] text-[#6B7873]">
              {q.source_year}
            </span>
          ) : (
            <span />
          )}
          <span className="font-mono text-[11px] text-gold">{marksLabel}</span>
        </div>

        <p className="text-[#F0F2F0] text-[17px] leading-relaxed mb-6 whitespace-pre-line">
          {q.question}
        </p>

        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            const isSelected = answers[current] === idx;
            return (
              <div
                key={idx}
                onClick={() => selectOption(idx)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-gold/12 border border-gold"
                    : "bg-card border border-transparent hover:border-border"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 font-medium ${
                    isSelected
                      ? "bg-gold text-ink"
                      : "border border-[#3A423F] text-[#8A9490]"
                  }`}
                >
                  {String.fromCharCode(97 + idx)}
                </span>
                <span className="text-[#E4E7E4] text-[15px]">{opt}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={toggleFlag}
            className={`flex items-center gap-1.5 text-xs font-medium ${
              flagged.has(current) ? "text-rose" : "text-[#6B7873]"
            }`}
          >
            🚩 {flagged.has(current) ? "Flagged" : "Flag for review"}
          </button>
          <button
            onClick={toggleBookmark}
            className={`flex items-center gap-1.5 text-xs font-medium ${
              bookmarked.has(current) ? "text-gold" : "text-[#6B7873]"
            }`}
          >
            {bookmarked.has(current) ? "★" : "☆"} Bookmark
          </button>
        </div>
      </div>

      {/* Sticky bottom actions */}
      <div className="sticky bottom-0 bg-ink/95 backdrop-blur border-t border-border px-4 py-3 flex gap-3">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="flex-1 border border-border text-[#B8C0BC] text-sm font-medium rounded-lg py-3 disabled:opacity-30"
        >
          Previous
        </button>
        {isLast ? (
          <button
            onClick={handleSubmitClick}
            className="flex-1 bg-gold text-ink text-sm font-semibold rounded-lg py-3"
          >
            Submit
          </button>
        ) : (
          <button
            onClick={() => goTo(current + 1)}
            className="flex-1 bg-gold text-ink text-sm font-semibold rounded-lg py-3"
          >
            Next
          </button>
        )}
      </div>

      {paletteOpen && (
        <QuestionPalette
          questions={questions}
          current={current}
          answers={answers}
          flagged={flagged}
          visited={visited}
          onJump={goTo}
          onClose={() => setPaletteOpen(false)}
          onSubmit={() => {
            setPaletteOpen(false);
            handleSubmitClick();
          }}
        />
      )}

      {exitConfirm && (
        <ConfirmModal
          title="Exit the exam?"
          message="Your progress on this attempt will be lost."
          confirmLabel="Exit"
          onConfirm={onExit}
          onCancel={() => setExitConfirm(false)}
        />
      )}

      {submitConfirm && (
        <ConfirmModal
          title="Submit with unanswered questions?"
          message={`You've answered ${answeredCount} of ${totalQ}. Unanswered questions score zero.`}
          confirmLabel="Submit anyway"
          onConfirm={finishQuiz}
          onCancel={() => setSubmitConfirm(false)}
        />
      )}
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6"
      onClick={onCancel}
    >
      <div
        className="bg-panel border border-border rounded-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg text-[#F0F2F0] mb-2">{title}</h3>
        <p className="text-sm text-[#8A9490] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-border text-[#B8C0BC] text-sm rounded-lg py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gold text-ink text-sm font-semibold rounded-lg py-2.5"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatClock(totalSecondsValue) {
  const m = Math.floor(totalSecondsValue / 60);
  const s = totalSecondsValue % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Computes the full result locally (questions already carry correct_index
 * + topic from generation), so results never depend on the backend.
 */
function computeResult(questions, answers, timings, marksConfig) {
  const { negativeMarking, correctMarks, negativeMarks } = marksConfig;

  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let totalMarks = 0;
  let correctTimeSum = 0;
  let wrongTimeSum = 0;
  let skippedTimeSum = 0;

  const topicStats = {};

  questions.forEach((q, idx) => {
    const topic = q.topic || "General";
    topicStats[topic] = topicStats[topic] || {
      correct: 0,
      wrong: 0,
      skipped: 0,
      score: 0,
    };

    const answer = answers[idx];
    const timeSpent = timings[idx] || 0;

    if (answer === undefined) {
      skippedCount += 1;
      skippedTimeSum += timeSpent;
      topicStats[topic].skipped += 1;
      return;
    }

    if (answer === q.correct_index) {
      correctCount += 1;
      correctTimeSum += timeSpent;
      totalMarks += correctMarks;
      topicStats[topic].correct += 1;
      topicStats[topic].score += correctMarks;
    } else {
      wrongCount += 1;
      wrongTimeSum += timeSpent;
      const penalty = negativeMarking ? negativeMarks : 0;
      totalMarks -= penalty;
      topicStats[topic].wrong += 1;
      topicStats[topic].score -= penalty;
    }
  });

  const totalTimeSec = Object.values(timings).reduce((a, b) => a + b, 0);

  const topicBreakdown = Object.entries(topicStats)
    .map(([topic, s]) => ({ topic, ...s }))
    .sort((a, b) => a.score - b.score); // weakest first

  return {
    totalMarks,
    maxMarks: questions.length * correctMarks,
    correctCount,
    wrongCount,
    skippedCount,
    totalQuestions: questions.length,
    marksConfig,
    topicBreakdown,
    timeSummary: {
      avgCorrectSec: correctCount ? Math.round(correctTimeSum / correctCount) : 0,
      avgWrongSec: wrongCount ? Math.round(wrongTimeSum / wrongCount) : 0,
      avgSkippedSec: skippedCount ? Math.round(skippedTimeSum / skippedCount) : 0,
      totalTimeSec,
    },
  };
}
