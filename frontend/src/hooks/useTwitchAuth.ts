import { useContext } from "react";
import { type AuthContextType } from "@/models/Auth";
import { TwitchAuthContext } from "@/context/TwitchAuthContext"

export const useTwitchAuth = (): AuthContextType => {
  const context = useContext(TwitchAuthContext);
  if (!context) throw new Error("useTwitchAuth must be used within a TwitchAuthProvider");
  return context;
};