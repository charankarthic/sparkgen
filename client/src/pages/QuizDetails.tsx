import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizQuestions, submitQuiz } from "@/api/quiz";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import { Button } from "@/components/Button";
import { useToast } from "@/hooks/useToast";
import { Trophy, Award } from "lucide-react";

export function QuizDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([]);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        setLoading(true);
        if (id) {
          console.log(`Fetching quiz details for ID: ${id}`);
          const data = await getQuizQuestions(id);
          console.log(`Quiz data received:`, data);
          setQuestions(data.questions || []);
          console.log(`Questions after setting:`, data.questions ? data.questions.length : 0);
          setQuizTitle(data.title || "Quiz");
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load quiz questions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [id, toast]);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { questionId, answer };
        return updated;
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Check if all questions are answered
      if (answers.length < questions.length) {
        toast({
          title: "Incomplete Quiz",
          description: "Please answer all questions before submitting.",
          variant: "destructive",
        });
        return;
      }

      if (id) {
        const result = await submitQuiz({
          quizId: id,
          answers,
        });
        setResults(result);

        toast({
          title: "Quiz Submitted",
          description: `You scored ${result.correct} out of ${result.total} (${result.score}%)`,
        });

        // Show achievement toast if earned
        if (result.achievements && result.achievements.length > 0) {
          result.achievements.forEach((achievement: any) => {
            toast({
              title: "Achievement Unlocked!",
              description: `${achievement.title} - ${achievement.description}`,
              variant: "default",
            });
          });
        }

        // Show XP earned toast
        if (result.earnedXP > 0) {
          toast({
            title: "XP Earned",
            description: `You earned ${result.earnedXP} XP!`,
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Loading Quiz</h1>
        <Card>
          <CardContent className="flex flex-col items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p>Generating quiz questions... This might take a few moments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (results) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Quiz Results</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Score: {results.score}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You answered {results.correct} out of {results.total} questions correctly.
            </p>
            {results.earnedXP > 0 && (
              <div className="p-4 bg-primary/10 rounded-lg mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  XP Earned
                </h3>
                <p>You earned {results.earnedXP} XP!</p>
                {results.newLevel > 0 && (
                  <p className="mt-2">You are now level {results.newLevel}!</p>
                )}
              </div>
            )}

            {results.achievements && results.achievements.length > 0 && (
              <div className="p-4 bg-primary/10 rounded-lg mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements Unlocked
                </h3>
                <ul className="list-disc list-inside mt-2">
                  {results.achievements.map((achievement: any, index: number) => (
                    <li key={index}>
                      <span className="font-medium">{achievement.title}</span> - {achievement.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={() => navigate("/games")}>Back to Games</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Quiz</h1>
        <Card>
          <CardContent>
            <p className="mb-4">No questions found for this quiz.</p>
            <Button onClick={() => navigate("/games")}>Back to Games</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = answers.find((a) => a.questionId === question._id)?.answer;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{quizTitle}</h1>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <div className="w-full bg-muted rounded-full h-2.5 mt-2">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {question.options.map((option: string, index: number) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer === option
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleSelectAnswer(question._id, option)}
              >
                {option}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentQuestion < questions.length - 1 ? "Next" : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}