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
  const [picked, setPicked] = useState({}); 
  const [timings, setTimings] = useState({}); 
  const [visited, setVisited] = useState({ 0: true }); 
  const [marked, setMarked] = useState({}); 
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(totalSeconds);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const questionStartRef = useRef(Date.now());
  const finishQuizRef = useRef(() => {});

  const q = questions[current];
  const isLast = current === questions.length - 1;

  useEffect(() => {
    setVisited((prev) => ({ ...prev, [current]: true }));
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
    }
    const id = setTimeout(() => setTotalSecondsLeft((s) => s - 1), 1000);    return () => clearTimeout(id);
  }, [totalSecondsLeft, timerEnabled, autoSubmitted]);

  // Pick Answer (Preserves first attempt timing)
  const handlePick = (idx) => {
    if (submitted) return;
    const isAlreadyAnswered = picked[current] !== undefined;
    
    if (!isAlreadyAnswered) {
      const spent = Math.round((Date.now() - questionStartRef.current) / 1000);
      setTimings((prev) => ({ ...prev, [current]: spent }));
    }
    setPicked((prev) => ({ ...prev, [current]: idx }));
  };

  // Skip Question
  const handleSkip = () => {
    if (submitted) return;
    const isAlreadyAnswered = picked[current] !== undefined;
    
    if (!isAlreadyAnswered) {
      const spent = Math.round((Date.now() - questionStartRef.current) / 1000);
      setTimings((prev) => ({ ...prev, [current]: spent }));
    }
    setPicked((prev) => ({ ...prev, [current]: "skipped" }));
  };

  // Mark for Review
  const handleMarkReview = () => {
    if (submitted) return;
    setMarked((prev) => ({ ...prev, [current]: !prev[current] }));
  };

  // NEW: Clear Response (Removes answer, keeps visited/marked state)
  const handleClearResponse = () => {
    if (submitted) return;
    setPicked((prev) => {
      const next = { ...prev };
      delete next[current]; // Completely removes the answer
      return next;
    });
    // visited and marked states remain untouched. 
    // Palette will automatically fall back to Yellow (Visited) or Purple (Marked).
  };

  const handleFinishQuiz = async () => {
    const result = computeResult(questions, picked, timings, {
      negativeMarking,
      correctMarks,
      negativeMarks,    });
    setFinalResult(result);
    setSubmitted(true); 

    submitQuiz({
      docId,
      answers: Object.entries(picked)
        .filter(([, v]) => v !== "skipped")
        .map(([qIdx, selIdx]) => ({
          question_index: Number(qIdx),
          selected_index: selIdx,
        })),
    }).catch(() => {});
  };

  const handleViewResults = () => {
    if (finalResult) {
      onFinished(finalResult);
    }
  };

  finishQuizRef.current = handleFinishQuiz;

  const handleNext = () => {
    if (!isLast && !submitted) {
      setCurrent((c) => c + 1);
    } else if (!submitted) {
      handleFinishQuiz(); 
    } else {
      handleViewResults(); 
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
          />        </div>
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

      {/* Question Palette */}
      <div className="mb-6 grid grid-cols-8 sm:grid-cols-10 gap-2">
        {questions.map((_, idx) => {
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
              paletteClass = "bg-purple-500/20 border-purple-500 text-purple-400"; 
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
              onClick={() => setCurrent(idx)} 
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
            
            let classes = "border-[#254B42] bg-ink text-[#D8D8CC] hover:border-gold";
            
            if (submitted) {
              if (isCorrect) classes = "border-mint bg-mint/10 text-[#B9E8CE]";
              else if (isPicked) classes = "border-rose bg-rose/10 text-[#F0B5AE]";
              else classes = "border-[#1E3A33] text-[#5C7269]";
            } else {
              if (isPicked) classes = "border-gold bg-gold/10 text-gold";
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
            );          })}
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
            ) : null}
            {q.explanation}
          </div>
        )}

        {/* Action Buttons (Responsive Grid/Flex) */}
        <div className="flex flex-wrap gap-3 mt-6">
          {!submitted && (
            <>
              <button
                onClick={handleMarkReview}
                className={`flex-1 min-w-[100px] border font-mono text-sm tracking-wide rounded py-3 transition-colors ${
                  marked[current]
                    ? "border-purple-500 bg-purple-500/10 text-purple-400"
                    : "border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                }`}
              >
                {marked[current] ? "Unmark" : "Review"}
              </button>
              
              <button
                onClick={handleClearResponse}
                disabled={picked[current] === undefined}
                className="flex-1 min-w-[100px] border border-rose/50 text-rose font-mono text-sm tracking-wide rounded py-3 hover:bg-rose/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 min-w-[100px] border border-border text-[#9FC9BE] font-mono text-sm tracking-wide rounded py-3 hover:border-gold transition-colors"
              >
                Skip
              </button>
            </>
          )}
          
          <button
            onClick={handleNext}
            className="flex-1 min-w-[120px] bg-gold text-ink font-mono text-sm tracking-wide rounded py-3 hover:opacity-90 transition-opacity"
          >
            {!submitted 
              ? (isLast ? "Finish Quiz" : "Next") 
              : (isLast ? "View Results" : "Next")}
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
      skipped: 0,
      score: 0,
    };

    const answer = picked[idx];    const timeSpent = timings[idx] || 0;

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
  };
                }
