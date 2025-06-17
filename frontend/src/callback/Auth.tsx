import { useEffect } from "react";
import { useTwitchAuth } from "../context/TwitchAuthContext";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const { login } = useTwitchAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Send code to your backend to exchange for access + refresh tokens
      fetch("http://localhost:3001/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            login(data.access_token, data.refresh_token);
            navigate("/");
          }
        });
    }
  }, [login, navigate]);

  return <div>Processing Twitch login...</div>;
};

export default Auth;