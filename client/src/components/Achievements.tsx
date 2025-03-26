import { useEffect, useState } from "react";
import { Medal, Trophy, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserProfile, getLeaderboard } from "@/api/user";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";

export function Achievements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profileData = await getUserProfile();
        setProfile(profileData);

        const leaderboardData = await getLeaderboard();
        setLeaderboard(leaderboardData);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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

  // Get achievements with updated level achievement
  const getUpdatedAchievements = () => {
    if (!profile) return [];

    const achievements = [...profile.achievements || []];

    // Check if we need to add or update level achievements
    const levelAchievementIndex = achievements.findIndex(
      a => a.title.includes("Level Up") || a.description.includes("reached level")
    );

    // If there's a level achievement, make sure it's up to date
    if (levelAchievementIndex !== -1) {
      // Update the existing level achievement to match current level
      achievements[levelAchievementIndex] = {
        ...achievements[levelAchievementIndex],
        title: "Level Up",
        description: `You reached level ${profile.level}!`,
        date: new Date() // Update date to ensure it appears at the top when sorted
      };
    } else if (profile.level > 1) {
      // Add a new level achievement if one doesn't exist
      achievements.push({
        _id: `level-${profile.level}-${Date.now()}`, // Generate a temporary ID
        title: "Level Up",
        description: `You reached level ${profile.level}!`,
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Level {profile?.level}</span>
                    <span>{profile?.xp} XP</span>
                  </div>
                  <Progress value={calculateLevelProgress()} />
                </div>
                <div className="grid gap-4">
                  {getUpdatedAchievements().map((achievement: any) => (
                    <div
                      key={achievement._id}
                      className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                    >
                      <Medal className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((leaderboardUser) => (
                  <div
                    key={leaderboardUser.id}
                    className={`flex items-center justify-between p-3 rounded-lg
                      ${user && leaderboardUser.id === user._id ? 'bg-primary/20' : 'bg-muted'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{leaderboardUser.rank}</span>
                      <div>
                        <h4 className="font-semibold">{leaderboardUser.username}</h4>
                        <p className="text-sm text-muted-foreground">
                          Level {leaderboardUser.level}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">{leaderboardUser.xp} XP</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}