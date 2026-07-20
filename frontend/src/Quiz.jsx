import React, { useEffect, useRef, useState } from "react";
import { submitQuiz } from "./api";

export default function Quiz({ quizData, onFinished }) {
  const { doc_id: docId, questions, settings = {} } = quizData;
  const {
    timerEnabled = false,
    totalSeconds = null,
    negativeMarking = false,
    correctMarks = 4,
    negativeMarks = 1,
  } = settings;

  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState({}); // question_index -> selected_index
  const [timings, setTimings] = useState({}); // question_index -> seconds spent
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(totalSeconds);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  
  // NEW: Submission state to lock answers
  const [submitted, setSubmitted] = useState(false);

  const questionStartRef = useRef(Date.now());
  const finishQuizRef = useRef(() => {});

  const q = questions[current];
  const isLast = current === questions.length - 1;
  
  // Ab hasAnswered sirf UI display ke liye hai, lock karne ke liye nahi
  const hasAnswered = picked[current] !== undefined;

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [current]);

  useEffect(() => {
    const id = setInterval(() => setElapsedTotal((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!timerEnabled || totalSecondsLeft === null) return;
    if (totalSecondsLeft <= 0) {
      if (!autoSubmitted) {
        setAutoSubmitted(true);
        finishQuizRef.current();
      }
      return;
    }    const id = setTimeout(() => setTotalSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [totalSecondsLeft, timerEnabled, autoSubmitted]);

  const recordAnswer = (value) => {
    const spent = Math.round((Date.now() - questionStartRef.current) / 1000);
    setTimings((prev) => ({ ...prev, [current]: spent }));
    setPicked((prev) => ({ ...prev, [current]: value }));
  };

  // UPDATED: Allow changing answer until submitted
  const handlePick = (idx) => {
    if (submitted) return; // Lock after submission
    recordAnswer(idx);
  };

  const handleSkip = () => {
    if (submitted) return; // Lock after submission
    recordAnswer("skipped");
  };

  const finishQuiz = async () => {
    const result = computeResult(questions, picked, timings, {
      negativeMarking,
      correctMarks,
      negativeMarks,
    });

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

  // UPDATED: Wrapper to set submitted state before finishing
  const handleFinishQuiz = () => {
    setSubmitted(true);
    finishQuiz();
  };

  finishQuizRef.current = handleFinishQuiz;

  const handleNext = () => {    if (!isLast) {
      setCurrent((c) => c + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const marksLabel =
    negativeMarking && (correctMarks || negativeMarks)
      ? `+${correctMarks}/−${negativeMarks}`
      : null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header: Progress & Timer */}
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

      {/* NEW: Question Palette */}
      <div className="mb-6 grid grid-cols-8 sm:grid-cols-10 gap-2">
        {questions.map((_, idx) => {
          let paletteClass = "bg-ink border-border text-[#5C7269]"; // Default unvisited
          
          if (submitted) {
            if (picked[idx] === undefined) {
              paletteClass = "bg-ink border-border text-[#5C7269]"; // Gray (unanswered)
            } else if (picked[idx] === questions[idx].correct_index) {
              paletteClass = "bg-mint/20 border-mint text-mint"; // Green (correct)
            } else {
              paletteClass = "bg-rose/20 border-rose text-rose"; // Red (wrong)
            }
          } else {            if (picked[idx] !== undefined) {
              paletteClass = "bg-gold/20 border-gold text-gold"; // Gold (answered)
            }
            if (idx === current) {
              paletteClass += " ring-1 ring-gold"; // Highlight current
            }
          }

          return (
            <button
              key={idx}
              onClick={() => !submitted && setCurrent(idx)}
              disabled={submitted}
              className={`h-8 w-8 rounded-md border text-xs font-mono flex items-center justify-center transition-colors ${paletteClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
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

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.correct_index;
            const isPicked = idx === picked[current];
            
            // UPDATED: Option coloring logic based on submission state
            let classes = "border-[#254B42] bg-ink text-[#D8D8CC] hover:border-gold";
            
            if (submitted) {              if (isCorrect) {
                classes = "border-mint bg-mint/10 text-[#B9E8CE]"; // Green for correct
              } else if (isPicked) {
                classes = "border-rose bg-rose/10 text-[#F0B5AE]"; // Red for wrong pick
              } else {
                classes = "border-[#1E3A33] text-[#5C7269]"; // Dim others
              }
            } else {
              if (isPicked) {
                classes = "border-gold bg-gold/10 text-gold"; // Gold for selected before submit
              }
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
                {submitted && isCorrect && <span>✓</span>}
                {submitted && isPicked && !isCorrect && <span>✕</span>}
              </div>
            );
          })}
        </div>

        {/* Explanation Box */}
        {submitted && (
          <div className="mt-4 text-xs text-[#9FC9BE] bg-ink/40 rounded p-3 border border-border">
            {picked[current] === "skipped" || picked[current] === undefined ? (
              <>
                Not answered — correct answer was{" "}
                <span className="text-mint font-semibold">
                  {String.fromCharCode(97 + q.correct_index)}
                </span>
                .{" "}
              </>
            ) : picked[current] !== q.correct_index ? (
              <>
                Incorrect — correct answer was{" "}
                <span className="text-mint font-semibold">
                  {String.fromCharCode(97 + q.correct_index)}
                </span>
                .{" "}
              </>
            ) : null}            {q.explanation}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {!submitted && (
            <button
              onClick={handleSkip}
              className="flex-1 border border-border text-[#9FC9BE] font-mono text-sm tracking-wide rounded py-3 hover:border-gold transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            // Removed disabled={!hasAnswered} so user can navigate freely before submit
            className="flex-1 bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 hover:opacity-90 transition-opacity"
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
      skipped: 0,      score: 0,
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
    .sort((a, b) => a.score - b.score);

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
  };}
