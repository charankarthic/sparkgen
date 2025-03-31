import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Star, Zap } from "lucide-react";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { getUserProfile } from "@/api/user";
import { getQuizzes } from "@/api/quiz";
import { useAuth } from "@/contexts/AuthContext";

// Import appropriate quiz-related icons
import { Calculator, Book, Code, Flask, ScanText, FileText } from "lucide-react";

export function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  // Function to get the appropriate icon based on quiz type
  const getQuizIcon = (quizType: string) => {
    switch (quizType?.toLowerCase()) {
      case 'math':
        return <Calculator className="h-5 w-5 text-blue-500" />;
      case 'escape room':
      case 'general knowledge':
        return <Book className="h-5 w-5 text-amber-500" />;
      case 'coding':
        return <Code className="h-5 w-5 text-green-500" />;
      case 'science':
        return <Flask className="h-5 w-5 text-purple-500" />;
      case 'word scramble':
        return <ScanText className="h-5 w-5 text-rose-500" />;
      case 'grammar':
        return <FileText className="h-5 w-5 text-teal-500" />;
      default:
        return <Book className="h-5 w-5 text-gray-500" />;
    }
  };

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
              <Card
                className="animate-fade-in relative z-10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2">
                    {getQuizIcon(quiz.type)}
                    {quiz.title}
                  </CardTitle>
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