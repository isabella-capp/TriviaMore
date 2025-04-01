"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import QuestionCard from "./QuestionCard";
import QuizScore from "./QuizScore";
import QuizReview from "./QuizReview";
import QuizQuestion from "@/types/QuizQuestion";
import QuizSection from "@/types/QuizSection";
import Link from "next/link";

type QuizProps = {
  questions: QuizQuestion[];
  section: QuizSection;
  quizClassId: string;
};

export default function Quiz({ questions, section, quizClassId }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[][]>(questions.map(() => []));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((currentQuestionIndex / questions.length) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, questions.length]);

  const handleSelectAnswer = (answerIndex: number) => {
    if (!isSubmitted) {
      setAnswers((prevAnswers) => {
        const newAnswers = [...prevAnswers];
        const currentAnswers = newAnswers[currentQuestionIndex];

        // Toggle selection
        if (currentAnswers.includes(answerIndex)) {
          newAnswers[currentQuestionIndex] = currentAnswers.filter((a) => a !== answerIndex);
        } else {
          newAnswers[currentQuestionIndex] = [...currentAnswers, answerIndex];
        }
        return newAnswers;
      });
    }
  };

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);

    // Calculate score
    const totalScore = questions.reduce((acc, question, index) => {
      const userAnswers = answers[index];
      const correctAnswers = question.answer;

      const correctGuesses = userAnswers.filter((answer) => correctAnswers.includes(answer)).length;
      const incorrectGuesses = userAnswers.filter((answer) => !correctAnswers.includes(answer)).length;

      const totalCorrectAnswers = correctAnswers.length;
      const score = Math.max(0, correctGuesses / totalCorrectAnswers - incorrectGuesses / totalCorrectAnswers);

      return acc + Math.round(score * 100) / 100; // Round to 2 decimal places
    }, 0);

    setScore(totalScore);
  }, [questions, answers]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentQuestionIndex, questions.length, handleSubmit]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "ArrowLeft" && currentQuestionIndex > 0) {
        handlePreviousQuestion();
      } else if (event.key === "ArrowRight" && currentQuestionIndex < questions.length - 1) {
        handleNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentQuestionIndex, handlePreviousQuestion, handleNextQuestion, questions.length]);

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <main className="w-full md:w-[700px] lg:w-[850px] py-12 mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground flex justify-center items-center">
        <span className="flex items-center gap-2">{section.icon}{section.sectionName}</span>
      </h1>
      <div className="relative">
        {!isSubmitted && <Progress value={progress} className="h-1 mb-8" />}
        <div className="min-h-[400px]"> {/* Prevent layout shift */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSubmitted ? "results" : currentQuestionIndex}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {!isSubmitted ? (
                <div className="space-y-8">
                  <QuestionCard
                    question={currentQuestion}
                    selectedAnswers={answers[currentQuestionIndex]}
                    onSelectAnswer={handleSelectAnswer}
                    isSubmitted={isSubmitted}
                    random={section.id === "random"}
                    showCorrectAnswer={false}
                  />
                  <div className="flex justify-between items-center pt-4">
                    <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} variant="ghost">
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <span className="text-sm font-medium">{currentQuestionIndex + 1} / {questions.length}</span>
                    <Button
                      onClick={handleNextQuestion}
                      variant="ghost"
                    >
                      {currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 flex flex-col items-center">
                  <QuizScore correctAnswers={score ?? 0} totalQuestions={questions.length} />
                  <QuizReview questions={questions} userAnswers={answers} section={section} />

                  <Button size={'lg'}>
                    <Link href={`/${quizClassId}`}>Choose Another Section</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}