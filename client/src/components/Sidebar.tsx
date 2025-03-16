import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Trophy,
  GamepadIcon,
  User,
  MenuIcon,
} from "lucide-react";
import { Button } from "./ui/button";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: GamepadIcon, label: "Games", path: "/games" },
  { icon: Trophy, label: "Achievements", path: "/achievements" },
  { icon: User, label: "Profile", path: "/profile" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="relative h-full border-r bg-card/50 backdrop-blur-sm">
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 hover:bg-accent"
        >
          <MenuIcon className="h-6 w-6" />
          {!isCollapsed && <span className="text-sm">Menu</span>}
        </Button>
      </div>
      <nav className="space-y-4 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-4 rounded-lg px-4 py-3 text-base transition-all hover:bg-accent",
                location.pathname === item.path
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-6 w-6", isCollapsed && "w-7 h-7")} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}