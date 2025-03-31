import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Star, Zap, Brain, Book, Code, Beaker, Shuffle, GraduationCap } from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { getUserProfile } from "@/api/user";
import { getQuizzes } from "@/api/quiz";
import { useAuth } from "@/contexts/AuthContext";

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

export function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      getUserProfile().then(setProfile);
      getQuizzes().then(setQuizzes);
    }
  }, [isAuthenticated]);

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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6 animate-fade-in">
        <h1 className="text-4xl font-bold text-center animate-float">Welcome to Sparkgen</h1>
        <p className="text-xl text-muted-foreground text-center max-w-2xl">
          An AI-powered gamified learning platform where you can test your knowledge, earn achievements, and learn with the help of AI.
        </p>
        <Button onClick={() => navigate("/login")} size="lg" className="animate-pulse-slow">
          Get Started
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="animate-slide-in" style={{ animationDelay: '0ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">XP Points</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.xp}</div>
          </CardContent>
        </Card>
        <Card className="animate-slide-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Star className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.level}</div>
          </CardContent>
        </Card>
        <Card className="animate-slide-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.achievements?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold animate-fade-in">Available Quizzes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz, index) => (
            <div
              key={quiz._id}
              className="relative"
              style={{ position: 'relative', height: '100%', minHeight: '300px', width: '100%' }}
            >
              {/* Animated symbols */}
              {renderSymbols(quiz.type)}

              <Card
                className="animate-fade-in relative z-10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{quiz.description}</p>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => navigate(`/games/${quiz._id}`)}
                  >
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}