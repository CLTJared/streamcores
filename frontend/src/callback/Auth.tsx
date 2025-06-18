import { useEffect } from "react";
import { useTwitchAuth } from "../context/TwitchAuthContext";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const { login } = useTwitchAuth();
  const navigate = useNavigate();

useEffect(() => {
  console.log("✅ Auth callback mounted");
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    fetch("http://localhost:3001/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token && data.refresh_token && data.expires_in) {
          login(data.access_token, data.refresh_token, data.expires_in);
          navigate("/");
        } else {
          // Optionally handle error or missing tokens
          console.error("Missing tokens from backend response:", data);
        }
      })
      .catch(err => {
        console.error("Error fetching tokens:", err);
      });
    }
  }, [login, navigate]);

  return <div>Processing Twitch login...</div>;
};

export default Auth;