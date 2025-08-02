import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleRegister({ email, password }) {
    setError(null);
    try {
      const res = await fetch(process.env.REACT_APP_API_URL + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  }

  return <AuthForm mode="register" onSubmit={handleRegister} error={error} />;
}
