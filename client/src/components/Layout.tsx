import { useState } from "react";
import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { cn } from "@/lib/utils"
import { Footer } from "./Footer"

export function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col">
      <Header />
      <div className="flex flex-1 pt-16">
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleSidebarToggle} />
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl animate-fade-in flex flex-col min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}