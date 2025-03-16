import { useEffect, useState } from "react";
import { User, Trophy, Star, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserProfile } from "@/api/user";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { setNeedsDisplayName } = useAuth();

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
        description: error.message || "Failed to load profile",
      });
      setLoading(false);
    }
  };

  const handleProfileNameUpdate = (newName: string) => {
    if (profile) {
      setProfile({
        ...profile,
        displayName: newName
      });
    }
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
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
                <Progress value={65} />
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
              {profile?.achievements?.length > 0 ? (
                profile.achievements.slice(0, 3).map((achievement: any) => (
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
    </div>
  );
}