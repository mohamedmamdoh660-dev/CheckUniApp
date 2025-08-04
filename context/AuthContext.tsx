"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Session, WeakPassword } from "@supabase/supabase-js";
import { authService, AuthSignupData } from "@/modules/auth";

import { usersService } from "@/modules/users";
import { User } from "@/types/types";
import Cookies from "js-cookie";
import { Settings, settingsService } from "@/modules/settings";
import Loader from "@/components/loader";

type AuthContextType = {
  user: User | null;
  userProfile: User | null;
  session: Session | null;
  loading: boolean;
  settings: Settings | null;
  signUp: (
    data: AuthSignupData
  ) => Promise<{ user: User | null; session: Session | null } | { user: User }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User; session: Session; weakPassword?: WeakPassword }>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setUserProfile: (userProfile: any | null) => void;
  setSettings: (settings: Settings | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth protection configuration
const DEFAULT_AUTH_ROUTE = "/auth/login";
const DEFAULT_PROTECTED_ROUTE = "/";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Define public routes that don't require authentication
  const PUBLIC_ROUTES = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/accept-invite",
  ];

  // Define routes that authenticated users should be redirected from (e.g., login page)
  const AUTH_ROUTES = ["/auth/login", "/auth/sign-up"];

  // Function to get user data from Supabase and user_profile table
  const fetchUserData = async () => {
    try {
      // Get current session
      const userStr = Cookies.get("auth.user");

      if (userStr) {
        const userResponse = JSON.parse(userStr);

        const userRec = userResponse.user.user_profileCollection.edges[0].node;
        checkRouteAccess(window.location.pathname, userRec);

        setUser(userResponse.user);
        setSession(userResponse.session);

        // Fetch user profile data from user_profile table
        const userData = await usersService.getUserById(userRec.id);
        if (userData) {
          setUserProfile(userData);
        }

        // Fetch settings data
        const settingsData = await settingsService.getSettingsById();
        if (settingsData) {
          setSettings(settingsData);
        }
      } else {
        if (userStr) {
          signOut();
        }
        setUser(null);
        setUserProfile(null);
        setSettings(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      setUserProfile(null);
      setSettings(null);
    }
    setLoading(false);
  };

  // Handle auth state and routing
  useEffect(() => {
    fetchUserData();
  }, []);

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = async () => {
      try {
        const fetchedSettings = await settingsService.getSettingsById();
        setSettings(fetchedSettings);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    window.addEventListener("settings-update", handleSettingsUpdate);
    return () => {
      window.removeEventListener("settings-update", handleSettingsUpdate);
    };
  }, []);

  const checkRouteAccess = (path: string, userData: User | null) => {
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );

    // Case 1: Unauthenticated user trying to access protected route
    if (!userData && !isPublicRoute) {
      // Redirect to login
      window.location.href = "/auth/login";
    }

    // Case 2: Authenticated user trying to access auth routes (login, signup)
    if (userData && AUTH_ROUTES.some((route) => path.startsWith(route))) {
      window.location.href = "/";
    }
  };

  const signUp = async (data: AuthSignupData) => {
    const result = await authService.signUp(data);
    if ("session" in result && result.session) {
      setSession(result.session);
      setUser(result.user);

      // Fetch user profile after signup
      if (result.user) {
        try {
          const userData = await usersService.getUserById(result.user.id);
          setUserProfile(userData);

          // Fetch settings after signup
          const settingsData = await settingsService.getSettingsById();
          setSettings(settingsData);
        } catch (error) {
          console.error("Error fetching user profile after signup:", error);
        }
      }
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);

      // Fetch user profile after sign in
      if (result.user) {
        try {
          const userData = await usersService.getUserById(result.user.id);
          setUserProfile(userData);

          // Fetch settings after sign in
          const settingsData = await settingsService.getSettingsById();
          setSettings(settingsData);
        } catch (error) {
          console.error("Error fetching user profile after sign in:", error);
        }
      }

      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
      setSession(null);
      setSettings(null);
      window.location.href = "/auth/login";
    } catch (error) {
      setLoading(false);
      console.error("Sign out error:", error);
      throw error;
    }
  };

  // Show loading state or nothing while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    settings,
    signUp,
    setUserProfile,
    signIn,
    signOut,
    setUser,
    setSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext) as AuthContextType;
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
