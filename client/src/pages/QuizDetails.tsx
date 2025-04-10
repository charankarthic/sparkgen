import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getQuizQuestions, submitQuiz } from "@/api/quiz";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import { Button } from "@/components/Button";
import { useToast } from "@/hooks/useToast";
import { Trophy, Award, Check, X } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/useWindowSize";

// Add a CSS class to disable transitions
const noTransitionClass = "!transition-none !transform-none !animate-none";

export function QuizDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([]);
  const [results, setResults] = useState<any>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  // Add new state for score calculation phase
  const [calculatingScore, setCalculatingScore] = useState(false);
  const [isPerfectScore, setIsPerfectScore] = useState(false);

  // Get window size for confetti
  const { width, height } = useWindowSize();

  // Add a ref to track if the request has been made
  const fetchInProgress = useRef(false);
  // Add a ref to store the fetch promise
  const fetchPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    // Check if we should regenerate questions (from URL query parameter)
    const searchParams = new URLSearchParams(location.search);
    const shouldRegenerate = searchParams.get('regenerate') === 'true';

    // Call the fetch function with regenerate parameter from URL if present
    fetchQuiz(shouldRegenerate);

    // Cleanup function to reset the refs if the component unmounts during a fetch
    return () => {
      fetchInProgress.current = false;
      fetchPromiseRef.current = null;
    };
  }, [id, location.search, toast]);

  // Define an async function to fetch quiz data with regenerate parameter and retries
  async function fetchQuiz(regenerate = false, retryCount = 0) {
    if (!id) return;

    // If we already have a fetch promise, return it
    if (fetchPromiseRef.current) {
      console.log("Reusing existing fetch promise");
      return fetchPromiseRef.current;
    }

    // If a fetch is already in progress, don't start another one
    if (fetchInProgress.current) {
      console.log("Fetch already in progress, skipping duplicate request");
      return;
    }

    // Set loading state at the beginning - this will stay true during all retries
    if (retryCount === 0) {
      setLoading(true);
    }

    fetchInProgress.current = true;

    try {
      console.log(`Fetching quiz details for ID: ${id}, regenerate: ${regenerate}, retry: ${retryCount}`);

      // Store the promise in the ref
      fetchPromiseRef.current = getQuizQuestions(id, regenerate);

      // Await the promise
      const data = await fetchPromiseRef.current;

      console.log(`Quiz data received:`, data);
      setQuestions(data.questions || []);
      console.log(`Questions after setting:`, data.questions ? data.questions.length : 0);
      setQuizTitle(data.title || "Quiz");

      // Success - set loading to false
      setLoading(false);
      return data;
    } catch (error) {
      console.error("Error fetching quiz:", error);

      // Check if we haven't reached max retries (3 attempts total)
      if (retryCount < 2) {  // This allows for a total of 3 attempts (0, 1, 2)
        // Clear the fetch promise ref so we can retry
        fetchPromiseRef.current = null;
        fetchInProgress.current = false;

        // Show a toast notification about retrying, but keep loading state true
        toast({
          title: "Quiz generation taking longer than expected",
          description: `Retrying attempt ${retryCount + 1} of 3...`,
          variant: "default",
        });

        // Wait a moment before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Retry with incremented retry count - don't change loading state yet
        return fetchQuiz(regenerate, retryCount + 1);
      }

      // We've reached max retries (3 attempts), now show error toast and use mock data
      toast({
        title: "Quiz Generation Failed",
        description: "Failed to load quiz questions after multiple attempts. Showing sample questions instead.",
        variant: "destructive",
      });

      // Fall back to mock data after 3 failed attempts
      const mockQuestions = generateMockQuestions(id || "unknown");
      setQuestions(mockQuestions);

      // If we already have a title from a previous attempt, keep it; otherwise use a generic one
      if (!quizTitle) {
        const quizTypes = {
          "67ecf11d5b90687f1edb5875": "General Knowledge",
          "67ecf11d5b90687f1edb5876": "Math",
          "67ecf11d5b90687f1edb5877": "Science",
          "67ecf11d5b90687f1edb5878": "Coding",
          "67ecf11d5b90687f1edb5879": "Word Scramble",
          "67ecf11d5b90687f1edb587a": "Grammar"
        };

        const safeId = id as keyof typeof quizTypes;
        setQuizTitle(quizTypes[safeId] || "Sample Quiz");
      }

      // Finally set loading to false after all retries and mock data generation
      setLoading(false);
    } finally {
      // Only reset fetchInProgress at the final attempt
      if (retryCount >= 2) {
        fetchInProgress.current = false;
      }

      // Clear the promise ref after a short delay to prevent immediate refetching
      // but only for the final attempt
      if (retryCount >= 2) {
        setTimeout(() => {
          fetchPromiseRef.current = null;
        }, 1000);
      }
    }
  }

  // Helper function to generate mock questions when all attempts fail
  function generateMockQuestions(quizId: string) {
    // Basic mock questions as fallback
    return [
      {
        _id: `mock_${quizId}_1`,
        question: "What is the main purpose of JavaScript?",
        options: [
          "To create dynamic content in web pages",
          "To style web pages",
          "To define the structure of web pages",
          "To create databases"
        ],
        answer: "To create dynamic content in web pages"
      },
      {
        _id: `mock_${quizId}_2`,
        question: "Which of these is a JavaScript framework?",
        options: ["HTML5", "CSS3", "React", "SQL"],
        answer: "React"
      },
      {
        _id: `mock_${quizId}_3`,
        question: "What does API stand for?",
        options: [
          "Application Programming Interface",
          "Application Process Integration",
          "Automated Programming Interface",
          "Application Protocol Interface"
        ],
        answer: "Application Programming Interface"
      },
      {
        _id: `mock_${quizId}_4`,
        question: "Which is NOT a data type in JavaScript?",
        options: ["String", "Boolean", "Float", "Symbol"],
        answer: "Float"
      },
      {
        _id: `mock_${quizId}_5`,
        question: "What is the primary function of a database?",
        options: [
          "To store and organize data",
          "To create user interfaces",
          "To style web applications",
          "To handle server requests"
        ],
        answer: "To store and organize data"
      }
    ];
  }

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
        // Show the calculating score screen
        setCalculatingScore(true);

        const result = await submitQuiz({
          quizId: id,
          answers,
        });

        // Check for perfect score immediately to start celebrations
        if (result.score === 100) {
          setIsPerfectScore(true);
          setShowConfetti(true);

          // Add a delay to show the celebration screen before showing results
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Now show the final results
        setResults(result);
        setCalculatingScore(false);

        // Save the answered questions with correct answers for display
        if (result.questionsWithAnswers) {
          setAnsweredQuestions(result.questionsWithAnswers);
        }

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

        // Mark this quiz as played in localStorage
        const storedPlayedQuizzes = localStorage.getItem('playedQuizzes');
        const playedQuizzes = storedPlayedQuizzes ? JSON.parse(storedPlayedQuizzes) : [];

        // Only add if not already in the array
        if (!playedQuizzes.includes(id)) {
          playedQuizzes.push(id);
          localStorage.setItem('playedQuizzes', JSON.stringify(playedQuizzes));
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setCalculatingScore(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Loading Quiz</h1>
        <Card className={noTransitionClass}>
          <CardContent className="flex flex-col items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-center mb-2">Generating quiz questions... This might take a few moments.</p>
            <p className="text-sm text-muted-foreground text-center">
              Our AI is working hard to create personalized questions for you.
              <br />Complex quizzes may take up to 30 seconds to generate.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add a new state for calculating score with celebration animations
  if (calculatingScore) {
    return (
      <div className="space-y-6">
        {/* Show confetti for perfect scores during calculation */}
        {isPerfectScore && (
          <Confetti
            width={width}
            height={height}
            recycle={true}
            numberOfPieces={500}
            gravity={0.2}
            colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4']}
          />
        )}

        <h1 className="text-3xl font-bold">Calculating Results</h1>

        <Card className={noTransitionClass}>
          <CardContent className="flex flex-col items-center py-10">
            {isPerfectScore ? (
              <>
                {/* Perfect score celebration */}
                <div className="text-4xl font-bold text-center mb-4 animate-pulse">
                  🎉 PERFECT SCORE! 🎉
                </div>

                <div className="flex justify-center gap-4 mb-6">
                  {['🏆', '💯', '🌟', '✨', '🎊'].map((emoji, i) => (
                    <span
                      key={i}
                      className="text-3xl"
                      style={{
                        animation: 'bounce 1s ease infinite',
                        animationDelay: `${i * 0.2}s`
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>

                <div className="text-xl font-medium text-center mb-8">
                  Amazing job! You've answered everything correctly!
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Preparing your results...
                </div>
              </>
            ) : (
              <>
                {/* Regular score calculation */}
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-center mb-2">Calculating your score...</p>
                <p className="text-sm text-muted-foreground text-center">
                  We're tallying your results and preparing your feedback.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (results) {
    return (
      <div className="space-y-6">
        {/* Confetti component that shows only for perfect scores */}
        {showConfetti && (
          <Confetti
            width={width}
            height={height}
            recycle={true}
            numberOfPieces={500}
            gravity={0.2}
            colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4']}
          />
        )}

        <h1 className="text-3xl font-bold">Quiz Results</h1>

        {/* Add a special banner for perfect score */}
        {results.score === 100 && (
          <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white p-4 rounded-lg shadow-lg animate-pulse mb-4">
            <h2 className="text-2xl font-bold text-center">PERFECT SCORE! 🎉</h2>
            <p className="text-center">Amazing job! You've answered all questions correctly!</p>
          </div>
        )}

        <Card className={noTransitionClass}>
          <CardHeader>
            <CardTitle>Your Score: {results.score}%</CardTitle>
            {results.score === 100 && (
              <CardDescription className="font-bold text-lg">
                Incredible! A perfect score!
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You answered {results.correct} out of {results.total} questions correctly.
            </p>
            {results.earnedXP > 0 && (
              <div className={`p-4 bg-primary/10 rounded-lg mb-4 ${noTransitionClass}`}>
                <h3 className="font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  XP Earned
                </h3>
                <p>You earned {results.earnedXP} XP!</p>
                {results.leveledUp && (
                  <p className="mt-2">You are now level {results.newLevel}!</p>
                )}
              </div>
            )}

            {results.achievements && results.achievements.length > 0 && (
              <div className={`p-4 bg-primary/10 rounded-lg mb-4 ${noTransitionClass}`}>
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

            {/* Display the questions with correct answers */}
            <div className="mt-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Quiz Review</h3>
              {answeredQuestions.map((q, index) => (
                <div key={q._id} className={`mb-6 p-4 border rounded-lg ${noTransitionClass}`}>
                  <h4 className="font-semibold mb-2">
                    Question {index + 1}: {q.question}
                  </h4>
                  <div className="space-y-2">
                    {q.options.map((option: string, optIndex: number) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg flex justify-between items-center ${noTransitionClass} ${
                          option === q.correctAnswer
                            ? "bg-green-100 dark:bg-green-900/30 border-green-300"
                            : option === q.userAnswer && option !== q.correctAnswer
                            ? "bg-red-100 dark:bg-red-900/30 border-red-300"
                            : "bg-muted/30"
                        }`}
                      >
                        <span>{option}</span>
                        {option === q.correctAnswer && (
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                        {option === q.userAnswer && option !== q.correctAnswer && (
                          <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-4 mt-6">
              <Button onClick={() => {
                setResults(null);
                setAnswers([]);
                setCurrentQuestion(0);
                setLoading(true); // Add this line to show loading state

                // Clear the fetch promise ref to ensure a new request is made
                fetchPromiseRef.current = null;

                // Force regenerate questions
                fetchQuiz(true).then(() => {
                  setLoading(false);
                }).catch(error => {
                  console.error("Error regenerating quiz:", error);
                  setLoading(false);
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to regenerate quiz questions. Please try again.",
                    variant: "destructive",
                  });
                });
              }}>
                Play Again
              </Button>
              <Button onClick={() => navigate("/games")}>Back to Games</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Quiz</h1>
        <Card className={noTransitionClass}>
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
        <div className={`w-full bg-muted rounded-full h-2.5 mt-2 ${noTransitionClass}`}>
          <div
            className={`bg-primary h-2.5 rounded-full ${noTransitionClass}`}
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <Card className={noTransitionClass}>
        <CardHeader>
          <CardTitle>{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {question.options.map((option: string, index: number) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer ${noTransitionClass} ${
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