async function getFreshAccessToken() {
  try {
    const res = await fetch("http://localhost:3001/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!data.access_token) throw new Error("No access token in response");
    return data.access_token;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
}

module.exports = { getFreshAccessToken };