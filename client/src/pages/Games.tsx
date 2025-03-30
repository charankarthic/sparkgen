import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Book, Code, Beaker, Shuffle, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { getQuizzes } from "@/api/quiz";
import { QuizSymbols } from "@/components/QuizSymbols";
import { ShiningEffect } from "@/components/ShiningEffect";

const QUIZ_ICONS = {
  math: Brain,
  general: Book,
  coding: Code,
  science: Beaker,
  word: Shuffle,
  grammar: GraduationCap,
};

const QUIZ_SYMBOLS = {
  math: ["∑", "π", "√", "÷"],
  general: ["?", "!", "✓", "✗"],
  coding: ["{ }", "</>", "[]", "()"],
  science: ["⚛", "🧪", "🔬", "🧬"],
  word: ["A", "Z", "Aa", "Zz"],
  grammar: [".", ",", "?", "!"],
};

const SYMBOL_COLORS = {
  math: ["text-blue-500", "text-green-500", "text-red-500", "text-yellow-500"],
  general: ["text-purple-500", "text-pink-500", "text-indigo-500", "text-violet-500"],
  coding: ["text-emerald-500", "text-teal-500", "text-cyan-500", "text-sky-500"],
  science: ["text-amber-500", "text-orange-500", "text-lime-500", "text-yellow-500"],
  word: ["text-rose-500", "text-fuchsia-500", "text-red-500", "text-pink-500"],
  grammar: ["text-blue-500", "text-indigo-500", "text-violet-500", "text-purple-500"],
};

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

  return (
    <div className="space-y-6 relative">
      <h1 className="text-3xl font-bold">Games</h1>

      {/* Background symbols */}
      <QuizSymbols />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => {
          const type = quiz.type as keyof typeof QUIZ_ICONS;
          const Icon = QUIZ_ICONS[type] || Book;
          const hasBeenPlayed = playedQuizzes.has(quiz._id);
          const symbols = QUIZ_SYMBOLS[type] || QUIZ_SYMBOLS.general;
          const colors = SYMBOL_COLORS[type] || SYMBOL_COLORS.general;

          return (
            <div key={quiz._id} className="quiz-card-wrapper group">
              {/* Animated symbols that appear on hover */}
              <div className={`card-symbol card-symbol-1 ${colors[0]}`}>{symbols[0]}</div>
              <div className={`card-symbol card-symbol-2 ${colors[1]}`}>{symbols[1]}</div>
              <div className={`card-symbol card-symbol-3 ${colors[2]}`}>{symbols[2]}</div>
              <div className={`card-symbol card-symbol-4 ${colors[3]}`}>{symbols[3]}</div>

              <Card className="hover:shadow-lg transition-shadow relative overflow-hidden">
                <ShiningEffect />
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getGradientByType(type)}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{quiz.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{quiz.description}</p>
                  <Button
                    className="w-full relative overflow-hidden"
                    onClick={() => handleStartGame(quiz._id)}
                  >
                    <span className="relative z-10">
                      {hasBeenPlayed ? "Play Again" : "Start Game"}
                    </span>
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

function getGradientByType(type: string): string {
  const gradients = {
    math: "from-blue-500 to-indigo-600",
    general: "from-purple-500 to-pink-600",
    coding: "from-teal-500 to-emerald-600",
    science: "from-amber-500 to-orange-600",
    word: "from-rose-500 to-red-600",
    grammar: "from-blue-500 to-violet-600",
  };

  return gradients[type as keyof typeof gradients] || "from-gray-500 to-gray-600";
}