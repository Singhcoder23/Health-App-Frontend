import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleLogin({ email, password }) {
    setError(null);
    try {
      const res = await fetch(process.env.REACT_APP_API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return <AuthForm mode="login" onSubmit={handleLogin} error={error} />;
}
