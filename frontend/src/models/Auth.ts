export type TwitchAuthContextType = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, refresh?: string) => void;
  logout: () => void;
};

export type AuthContextType = {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  logout: () => void;
};