const API_BASE = "https://health-app-backend-8pci.onrender.com/api";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const msg = document.getElementById("loginMessage");
  msg.textContent = "";
  msg.style.color = ""; // Reset color

  const email = e.target.email.value.trim();
  const password = e.target.password.value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.style.color = "red";
      msg.textContent = data.message || "Login failed. Check credentials.";
      return;
    }

    localStorage.setItem("token", data.token);
    msg.style.color = "green";
    msg.textContent = "Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);

  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Error connecting to server.";
    console.error("Login error:", err);
  }
});
