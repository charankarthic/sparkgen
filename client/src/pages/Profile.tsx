import { useEffect, useState } from "react";
import { User, Trophy, Star, BarChart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/Button";
import { getUserProfile, deleteUserAccount } from "@/api/user";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data);
      setLoading(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) return;

    try {
      setIsDeleting(true);
      await deleteUserAccount(user._id);

      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });

      // Log the user out and redirect to home page
      logout();
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Calculate level progress
  const calculateLevelProgress = () => {
    if (!profile) return 0;

    // Simplified calculation - in a real app you might want to use the same formula as the backend
    const currentLevelXp = Math.pow(profile.level - 1, 2) * 100;
    const nextLevelXp = Math.pow(profile.level, 2) * 100;
    const xpRange = nextLevelXp - currentLevelXp;
    const userXpInLevel = profile.xp - currentLevelXp;

    return Math.min(Math.round((userXpInLevel / xpRange) * 100), 100);
  };

  // Get appropriate achievements based on level and progress
  const getRelevantAchievements = () => {
    if (!profile) return [];

    const achievements = [...profile.achievements || []];

    // Check if we need to add or update level achievements
    const levelAchievementIndex = achievements.findIndex(
      a => a.title.includes("Reached Level")
    );

    // If there's a level achievement, make sure it's up to date
    if (levelAchievementIndex !== -1) {
      // Update the existing level achievement to match current level
      achievements[levelAchievementIndex] = {
        ...achievements[levelAchievementIndex],
        title: `Reached Level ${profile.level}`,
        description: `Congratulations on reaching level ${profile.level}!`,
        date: new Date() // Update date to ensure it appears at the top when sorted
      };
    } else if (profile.level > 1) {
      // Add a new level achievement if one doesn't exist
      achievements.push({
        _id: `level-${profile.level}-${Date.now()}`, // Generate a temporary ID
        title: `Reached Level ${profile.level}`,
        description: `Congratulations on reaching level ${profile.level}!`,
        date: new Date()
      });
    }

    // Sort achievements by date, newest first
    return achievements.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>
                {loading
                  ? "Loading profile..."
                  : profile?.displayName
                  ? `${profile.displayName}'s Profile`
                  : "Profile Overview"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your learning journey stats
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Level</span>
              </div>
              <p className="text-2xl font-bold">{profile?.level || 0}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">XP Points</span>
              </div>
              <p className="text-2xl font-bold">{profile?.xp || 0}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Quizzes Completed</span>
              </div>
              <p className="text-2xl font-bold">{profile?.stats?.quizzesCompleted || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Current Level Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {calculateLevelProgress()}%
                  </span>
                </div>
                <Progress value={calculateLevelProgress()} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Average Score</span>
                  <span className="text-sm text-muted-foreground">
                    {profile?.stats?.averageScore || 0}%
                  </span>
                </div>
                <Progress value={profile?.stats?.averageScore || 0} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : getRelevantAchievements().length > 0 ? (
                getRelevantAchievements().slice(0, 3).map((achievement) => (
                  <div
                    key={achievement._id}
                    className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                  >
                    <Trophy className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No achievements yet. Complete quizzes to earn badges!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Section */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Permanently delete your account and all your data. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={loading || isDeleting}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}