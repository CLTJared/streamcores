export type TwitchAuthContextType = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, refresh?: string) => void;
  logout: () => void;
};