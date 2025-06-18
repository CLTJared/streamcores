const express = require("express");
const axios = require("axios");
const { saveToken, getToken } = require("./utils/tokenStore");
const router = express.Router();

router.post("/token", async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).json({ error: "Missing authorization code" });

  try {
    const resp = await axios.post("https://id.twitch.tv/oauth2/token", null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.TWITCH_REDIRECT_URI,
      },
    });

    // DO NOT save tokens on the backend — return them to the client
    res.json({
      access_token: resp.data.access_token,
      refresh_token: resp.data.refresh_token,
      expires_in: resp.data.expires_in,
      scope: resp.data.scope,
      token_type: resp.data.token_type,
    });
  } catch (e) {
    console.error("OAuth token error:", e.response?.data || e.message);
    res.status(500).json({ error: "OAuth failed" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: "No refresh token" });

  try {
    const resp = await axios.post("https://id.twitch.tv/oauth2/token", null, {
      params: {
        grant_type: "refresh_token",
        refresh_token,
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
      },
    });
    saveToken(resp.data.access_token, resp.data.refresh_token, resp.data.expires_in);
    res.json(resp.data);
  } catch (e) {
    console.error("Refresh token error:", e.response?.data || e.message);
    res.status(500).json({ error: "Refresh failed" });
  }
});

module.exports = router;