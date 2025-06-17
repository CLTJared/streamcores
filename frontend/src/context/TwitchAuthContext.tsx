import React, { createContext, useState, useEffect, useContext } from "react";
import { type TwitchAuthContextType } from "../models/Auth";

const AuthContext = createContext<TwitchAuthContextType | undefined>(undefined);

export const TwitchAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const storedAccess = localStorage.getItem("twitch_access_token");
    const storedRefresh = localStorage.getItem("twitch_refresh_token");

    if (storedAccess) setAccessToken(storedAccess);
    if (storedRefresh) setRefreshToken(storedRefresh);
  }, []);

  const login = (token: string, refresh?: string) => {
    setAccessToken(token);
    if (refresh) {
      setRefreshToken(refresh);
      localStorage.setItem("twitch_refresh_token", refresh);
    }

    localStorage.setItem("twitch_access_token", token);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("twitch_access_token");
    localStorage.removeItem("twitch_refresh_token");
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useTwitchAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useTwitchAuth must be used inside a TwitchAuthProvider");
  return context;
};