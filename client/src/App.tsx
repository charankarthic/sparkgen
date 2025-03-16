import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Home } from "./pages/Home"
import { Games } from "./pages/Games"
import { Achievements } from "./pages/Achievements"
import { Profile } from "./pages/Profile"
import { Menu } from "./pages/Menu"
import { QuizDetails } from "./pages/QuizDetails"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { ChatBot } from "./components/ChatBot"
import { DisplayNamePrompt } from "./components/DisplayNamePrompt"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Home />} />
              <Route path="games" element={<Games />} />
              <Route path="games/:id" element={<QuizDetails />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="profile" element={<Profile />} />
              <Route path="menu" element={<Menu />} />
            </Route>
          </Routes>
          <DisplayNamePrompt />
          <ChatBot />
          <Toaster />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App