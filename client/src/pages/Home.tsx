import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Star, Zap } from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { getUserProfile } from "@/api/user";
import { getQuizzes } from "@/api/quiz";
import { useAuth } from "@/contexts/AuthContext";
// Import QuizSymbols component
import QuizSymbols from "@/components/QuizSymbols";

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
            >
              {/* Add QuizSymbols component here */}
              <QuizSymbols quizType={quiz.type} />
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