import { useState, useEffect, type ReactNode, useCallback, useRef } from "react";
import { TwitchAuthContext} from "@/context/TwitchAuthContext";

export const TwitchAuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("twitch_access_token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("twitch_refresh_token"));
  const [tokenExpiry, setTokenExpiry] = useState<number>(() => {
  const expiryStr = localStorage.getItem("twitch_token_expiry");
    return expiryStr ? parseInt(expiryStr, 10) : 0;
  });

  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const REFRESH_MARGIN = 60; // seconds before expiry to refresh

  const isAuthenticated = !!accessToken;

  const clearAuth = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setTokenExpiry(0);
    localStorage.removeItem("twitch_access_token");
    localStorage.removeItem("twitch_refresh_token");
    localStorage.removeItem("twitch_token_expiry");
    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
      refreshTimeout.current = null;
    }
  };

  // Call your backend to refresh the access token using the refresh token
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      clearAuth();
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await res.json();

      if (data.access_token && data.refresh_token && data.expires_in) {
        login(data.access_token, data.refresh_token, data.expires_in);
      } else {
        // Refresh failed, logout
        clearAuth();
      }
    } catch (e) {
      console.error("Failed to refresh token", e);
      clearAuth();
    }
  }, [refreshToken]);

  // login handler saves tokens, schedules refresh
  const login = (accessToken: string, refreshToken?: string, expiresIn?: number) => {
    console.log("⚡ login() called with:", { accessToken, refreshToken, expiresIn });
    
    setAccessToken(accessToken);
    setRefreshToken(refreshToken ?? null);
    // Convert expiresIn (seconds from now) into an absolute timestamp in ms
    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      setTokenExpiry(expiresAt);
      localStorage.setItem("twitch_token_expiry", expiresAt.toString());
    }
    if (refreshToken) localStorage.setItem("twitch_refresh_token", refreshToken);
    localStorage.setItem("twitch_access_token", accessToken);
  };

  // logout clears all tokens
  const logout = useCallback(() => {
    clearAuth();
  }, []);

  // Schedule token refresh before expiry
  useEffect(() => {
    if (!accessToken || !tokenExpiry) return;

    const now = Date.now() // milliseconds
    const expiresIn = tokenExpiry - now;
    console.log(`Token expires in ${Math.floor(expiresIn / 1000)}s, scheduling refresh...`);

    if (expiresIn <= REFRESH_MARGIN * 1000) {
      // Token expired or close to expiry - refresh now
      refreshAccessToken();
    } else {
      // Schedule refresh a bit before expiry
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      refreshTimeout.current = setTimeout(() => {
        refreshAccessToken();
      }, expiresIn - REFRESH_MARGIN * 1000);
    }

    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    };
  }, [accessToken, tokenExpiry, refreshAccessToken]);

  return (
    <TwitchAuthContext.Provider value={{ accessToken, isAuthenticated, login, logout }}>
      {children}
    </TwitchAuthContext.Provider>
  );
};