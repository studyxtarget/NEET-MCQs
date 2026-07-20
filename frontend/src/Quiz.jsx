import React, { useEffect, useRef, useState } from "react";
import { submitQuiz } from "./api";

export default function Quiz({ quizData, onFinished }) {
  const { doc_id: docId, questions, settings = {} } = quizData;
  const {
    timerEnabled = false,
    totalSeconds = null, // whole-quiz budget, e.g. 15 questions -> 900s
    negativeMarking = false,
    correctMarks = 4,
    negativeMarks = 1,
  } = settings;

  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState({}); // question_index -> selected_index | "skipped"
  const [timings, setTimings] = useState({}); // question_index -> seconds spent
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(totalSeconds);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const questionStartRef = useRef(Date.now());
  const finishQuizRef = useRef(() => {});

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const hasAnswered = picked[current] !== undefined;

  // Reset the per-question clock whenever the question changes (used for
  // the per-question time stats shown in the result screen).
  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [current]);

  // Overall elapsed timer (always runs, used for the "Total Time Taken" stat
  // when no exam timer is configured).
  useEffect(() => {
    const id = setInterval(() => setElapsedTotal((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Whole-quiz countdown -- e.g. 15 questions in 15 minutes. Auto-submits
  // whatever is answered so far (unanswered questions count as skipped)
  // the moment it hits zero.
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

  const recordAnswer = (value) => {
    const spent = Math.round((Date.now() - questionStartRef.current) / 1000);
    setTimings((prev) => ({ ...prev, [current]: spent }));
    setPicked((prev) => ({ ...prev, [current]: value }));
  };

  const handlePick = (idx) => {
    if (hasAnswered) return;
    recordAnswer(idx);
  };

  const handleSkip = () => {
    if (hasAnswered) return;
    recordAnswer("skipped");
  };

  const finishQuiz = async () => {
    const result = computeResult(questions, picked, timings, {
      negativeMarking,
      correctMarks,
      negativeMarks,
    });
    // Fire-and-forget: also tell the backend, for future login/history
    // features. The result the user sees never depends on this succeeding.
    submitQuiz({
      docId,
      answers: Object.entries(picked)
        .filter(([, v]) => v !== "skipped")
        .map(([qIdx, selIdx]) => ({
          question_index: Number(qIdx),
          selected_index: selIdx,
        })),
    }).catch(() => {});
    onFinished(result);
  };
  finishQuizRef.current = finishQuiz;

  const handleNext = () => {
    if (!isLast) {
      setCurrent((c) => c + 1);
      return;
    }
    finishQuiz();
  };

  const marksLabel =
    negativeMarking && (correctMarks || negativeMarks)
      ? `+${correctMarks}/−${negativeMarks}`
      : null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4 gap-4">
        <span className="font-mono text-xs text-[#9FC9BE] whitespace-nowrap">
          Q{current + 1}/{questions.length}
        </span>
        <div className="flex-1 h-1.5 bg-[#1B3A33] rounded overflow-hidden">
          <div
            className="h-full bg-gold transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span
          className={`font-mono text-xs whitespace-nowrap ${
            timerEnabled && totalSecondsLeft <= 60 ? "text-rose" : "text-[#9FC9BE]"
          }`}
        >
          {timerEnabled
            ? formatClock(Math.max(totalSecondsLeft, 0))
            : formatClock(elapsedTotal)}
        </span>
      </div>

      <div className="bg-panel border border-border rounded-xl p-6">
        <div className="flex justify-between items-center mb-2">
          {q.source_year && (
            <span className="font-mono text-xs text-[#5C8579]">
              {q.source_year}
            </span>
          )}
          {marksLabel && (
            <span className="font-mono text-xs text-gold ml-auto">
              {marksLabel}
            </span>
          )}
        </div>
        <p className="text-[#EDEDE3] text-base leading-relaxed whitespace-pre-line mb-5">
          {q.question}
        </p>

        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.correct_index;
            const isPicked = idx === picked[current];
            let classes =
              "border-[#254B42] bg-ink text-[#D8D8CC] hover:border-gold";
            if (hasAnswered) {
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
                {hasAnswered && isCorrect && <span>✓</span>}
                {hasAnswered && isPicked && !isCorrect && <span>✕</span>}
              </div>
            );
          })}
        </div>

        {picked[current] === "skipped" && (
          <div className="mt-4 text-xs text-[#9FC9BE] bg-ink/40 rounded p-3">
            Skipped — correct answer was{" "}
            <span className="text-mint">
              {String.fromCharCode(97 + q.correct_index)}
            </span>
            . {q.explanation}
          </div>
        )}
        {hasAnswered && picked[current] !== "skipped" && q.explanation && (
          <div className="mt-4 text-xs text-[#9FC9BE] bg-ink/40 rounded p-3">
            {q.explanation}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {!hasAnswered && (
            <button
              onClick={handleSkip}
              className="flex-1 border border-border text-[#9FC9BE] font-mono text-sm tracking-wide rounded py-3 hover:border-gold transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!hasAnswered}
            className="flex-1 bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {isLast ? "Finish Quiz" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Computes the full result locally from data the frontend already has
 * (questions include correct_index + topic). This means results never
 * depend on the backend being reachable.
 */
function computeResult(questions, picked, timings, marksConfig) {
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

    const answer = picked[idx];
    const timeSpent = timings[idx] || 0;

    if (answer === undefined || answer === "skipped") {
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
