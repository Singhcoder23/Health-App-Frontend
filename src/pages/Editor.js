import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api/api";
import SessionEditor from "../components/SessionEditor";

export default function Editor() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchWithAuth("/my-sessions/" + id)
        .then(res => {
          if (!res.ok) throw new Error("Failed to load session");
          return res.json();
        })
        .then(data => setSession(data))
        .catch(() => alert("Error fetching session"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h1>{id ? "Edit Session" : "New Session"}</h1>
      <SessionEditor
        session={session || {}}
        onSave={() => navigate("/my-sessions")}
      />
    </div>
  );
}
