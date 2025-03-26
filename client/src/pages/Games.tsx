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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Games</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => {
          const Icon = QUIZ_ICONS[quiz.type as keyof typeof QUIZ_ICONS] || Book;
          const hasBeenPlayed = playedQuizzes.has(quiz._id);

          return (
            <Card key={quiz._id} className="hover:shadow-lg transition-shadow">
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
                  className="w-full"
                  onClick={() => handleStartGame(quiz._id)}
                >
                  {hasBeenPlayed ? "Play Again" : "Start Game"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}