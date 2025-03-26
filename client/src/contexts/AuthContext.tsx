import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { login as apiLogin, register as apiRegister } from "@/api/auth";
import { jwtDecode } from "jwt-decode";
import { getUserProfile, updateUserDisplayName } from "@/api/user";
import { toast } from "@/components/ui/use-toast";

type AuthContextType = {
  isAuthenticated: boolean;
  userId: string | null;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  needsDisplayName: boolean;
  setNeedsDisplayName: (value: boolean) => void;
  updateDisplayName: (displayName: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("accessToken");
  });

  const [userId, setUserId] = useState<string | null>(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.sub || null;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  });

  const [user, setUser] = useState<any | null>(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const [needsDisplayName, setNeedsDisplayName] = useState<boolean>(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && userId) {
      // Check if user has a display name
      getUserProfile()
        .then((profile) => {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
          if (!profile.displayName) {
            setNeedsDisplayName(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
        });
    }
  }, [userId]);

  const updateUserContext = (userData: any) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      if (response?.refreshToken || response?.accessToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("accessToken", response.accessToken);
        setIsAuthenticated(true);

        // Extract user ID from token
        try {
          const decoded: any = jwtDecode(response.accessToken);
          setUserId(decoded.sub || null);

          // Check if user has a display name after login
          getUserProfile()
            .then((profile) => {
              updateUserContext(profile);
              if (!profile.displayName) {
                setNeedsDisplayName(true);
              }
            })
            .catch((error) => {
              console.error("Error fetching user profile:", error);
            });
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUserId(null);
      setUser(null);
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await apiRegister(email, password);
      if (response?.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
        setIsAuthenticated(true);

        // Extract user ID from token
        try {
          const decoded: any = jwtDecode(response.accessToken);
          setUserId(decoded.sub || null);

          // Fetch user profile after registration
          getUserProfile()
            .then((profile) => {
              updateUserContext(profile);
              setNeedsDisplayName(true); // New users will always need to set display name
            })
            .catch((error) => {
              console.error("Error fetching user profile after registration:", error);
            });
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserId(null);
    setUser(null);
    setNeedsDisplayName(false);
    window.location.reload();
  };

  const updateDisplayName = async (displayName: string) => {
    try {
      if (userId) {
        const response = await updateUserDisplayName(userId, displayName);

        // Update the user in the context and local storage
        const updatedUser = { ...user, displayName: response.displayName };
        updateUserContext(updatedUser);

        // No longer needs display name
        setNeedsDisplayName(false);
        console.log("Successfully updated display name to:", displayName);
      } else {
        throw new Error("User ID not found");
      }
    } catch (error) {
      console.error("Error updating display name:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        user,
        login,
        register,
        logout,
        needsDisplayName,
        setNeedsDisplayName,
        updateDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}