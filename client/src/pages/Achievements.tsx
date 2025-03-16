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
          description: error.message || "Failed to load achievements data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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
                  <Progress value={65} />
                </div>
                <div className="grid gap-4">
                  {profile?.achievements?.map((achievement: any) => (
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