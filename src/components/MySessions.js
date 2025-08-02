import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function MySessionsComponent() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithAuth("/my-sessions")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch sessions");
        return res.json();
      })
      .then(data => setSessions(data))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h1>My Sessions</h1>
      {sessions.length === 0 ? (
        <p>No sessions yet.</p>
      ) : (
        <ul>
          {sessions.map(session => (
            <li
              key={session._id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/editor/${session._id}`)}
            >
              {session.title || "Untitled Session"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
