import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Book, Code, Beaker, Shuffle, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { getQuizzes } from "@/api/quiz";

const QUIZ_ICONS = {
  math: Brain,
  general: Book,
  coding: Code,
  science: Beaker,
  word: Shuffle,
  grammar: GraduationCap,
};

// Define symbols for each quiz type
const QUIZ_SYMBOLS = {
  math: ["➕", "➖", "✖️", "➗", "π", "∑", "√", "∞"],
  general: ["🌍", "📚", "🔍", "💡", "🏛️", "🧩", "🎓"],
  coding: ["</>", "{ }", "[]", "==", "&&", "||", "#", "function()"],
  science: ["⚗️", "🧪", "🔬", "🧬", "⚛️", "🧲", "📊"],
  word: ["🔤", "📝", "🔡", "📄", "📔", "🖋️", "✏️"],
  grammar: [".", "?", "!", ",", ":", ";", "\"\"", "()"],
};

// Colors for the symbols
const SYMBOL_COLORS = [
  "text-blue-500",
  "text-green-500",
  "text-yellow-500",
  "text-red-500",
  "text-indigo-500",
  "text-orange-500",
  "text-teal-500",
  "text-pink-500",
];

export function Games() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const navigate = useNavigate();
  // Track which quizzes have been played
  const [playedQuizzes, setPlayedQuizzes] = useState<Set<string>>(new Set());

  useEffect(() => {
    getQuizzes().then(setQuizzes);

    // Load played quizzes from localStorage
    const storedPlayedQuizzes = localStorage.getItem('playedQuizzes');
    if (storedPlayedQuizzes) {
      setPlayedQuizzes(new Set(JSON.parse(storedPlayedQuizzes)));
    }
  }, []);

  const handleStartGame = (quizId: string) => {
    // Check if this quiz has been played before
    const hasBeenPlayed = playedQuizzes.has(quizId);

    // If quiz has been played, include regenerate=true parameter
    if (hasBeenPlayed) {
      navigate(`/games/${quizId}?regenerate=true`);
    } else {
      navigate(`/games/${quizId}`);
    }
  };

  // Function to generate animated symbols
  const renderSymbols = (quizType: string, count: number = 6) => {
    const symbols = QUIZ_SYMBOLS[quizType as keyof typeof QUIZ_SYMBOLS] || QUIZ_SYMBOLS.general;
    const animationClasses = ["animate-float", "animate-pulse-slow", "animate-bounce"];

    return Array.from({ length: count }).map((_, index) => {
      const symbol = symbols[index % symbols.length];
      const color = SYMBOL_COLORS[index % SYMBOL_COLORS.length];
      const animation = animationClasses[index % animationClasses.length];

      // Position each symbol randomly around the card
      const style = {
        position: 'absolute' as const,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 1 + 0.8}rem`,
        opacity: Math.random() * 0.5 + 0.3,
        transform: `rotate(${Math.random() * 360}deg)`,
        zIndex: 0,
      };

      return (
        <span
          key={`${quizType}-symbol-${index}`}
          className={`${color} ${animation}`}
          style={style}
        >
          {symbol}
        </span>
      );
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Games</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => {
          const Icon = QUIZ_ICONS[quiz.type as keyof typeof QUIZ_ICONS] || Book;
          const hasBeenPlayed = playedQuizzes.has(quiz._id);

          return (
            <div key={quiz._id} className="relative">
              {/* Animated symbols */}
              {renderSymbols(quiz.type)}

              <Card className="hover:shadow-lg transition-shadow relative z-10">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{quiz.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{quiz.description}</p>
                  <Button
                    className="w-full button-hover"
                    onClick={() => handleStartGame(quiz._id)}
                  >
                    {hasBeenPlayed ? "Play Again" : "Start Game"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}