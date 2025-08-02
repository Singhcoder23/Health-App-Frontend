import React, { useState } from "react";

export default function AuthForm({ mode = "login", onSubmit, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handle(e) {
    e.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <form onSubmit={handle} style={{ maxWidth: 300, margin: "2rem auto" }}>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <label>
          Email:
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            autoComplete="username"
          />
        </label>
      </div>
      <div style={{ marginTop: 10 }}>
        <label>
          Password:
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>
      </div>
      <button type="submit" style={{ marginTop: 20 }}>
        {mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
}
