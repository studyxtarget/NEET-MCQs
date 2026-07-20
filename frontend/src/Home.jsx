import React, { useState } from "react";
import UploadBox from "./UploadBox";
import Instructions from "./Instructions";
import Quiz from "./Quiz";
import Result from "./Result";

export default function Home() {
  const [stage, setStage] = useState("upload"); // upload | instructions | quiz | result
  const [quizData, setQuizData] = useState(null);
  const [result, setResult] = useState(null);

  const handleQuizReady = (quiz) => {
    setQuizData(quiz);
    setStage("instructions");
  };

  const handleStart = () => {
    setStage("quiz");
  };

  const handleFinished = (res) => {
    setResult(res);
    setStage("result");
  };

  const handleRestart = () => {
    setQuizData(null);
    setResult(null);
    setStage("upload");
  };

  return (
    <div className={stage === "quiz" ? "" : "min-h-screen py-16 px-4"}>
      {stage === "upload" && <UploadBox onQuizReady={handleQuizReady} />}
      {stage === "instructions" && quizData && (
        <Instructions quizData={quizData} onStart={handleStart} />
      )}
      {stage === "quiz" && quizData && (
        <Quiz
          quizData={quizData}
          onFinished={handleFinished}
          onExit={handleRestart}
        />
      )}
      {stage === "result" && result && (
        <Result result={result} onRestart={handleRestart} />
      )}
    </div>
  );
}
