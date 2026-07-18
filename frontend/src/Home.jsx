import React, { useState } from "react";
import UploadBox from "../components/UploadBox";
import Quiz from "../components/Quiz";
import Result from "../components/Result";

export default function Home() {
  const [stage, setStage] = useState("upload"); // upload | quiz | result
  const [quizData, setQuizData] = useState(null);
  const [result, setResult] = useState(null);

  const handleQuizReady = (quiz) => {
    setQuizData(quiz);
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
    <div className="min-h-screen py-16 px-4">
      {stage === "upload" && <UploadBox onQuizReady={handleQuizReady} />}
      {stage === "quiz" && quizData && (
        <Quiz quizData={quizData} onFinished={handleFinished} />
      )}
      {stage === "result" && result && (
        <Result result={result} onRestart={handleRestart} />
      )}
    </div>
  );
}
