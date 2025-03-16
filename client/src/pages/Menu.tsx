import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, GamepadIcon, Trophy, User } from "lucide-react";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: GamepadIcon, label: "Games", path: "/games" },
  { icon: Trophy, label: "Achievements", path: "/achievements" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function Menu() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Menu</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.path}
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Go to {item.label}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}