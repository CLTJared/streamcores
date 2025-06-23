import { createContext } from "react";
import { type AuthContextType } from "@/models/Auth";

export const TwitchAuthContext = createContext<AuthContextType | undefined>(undefined);