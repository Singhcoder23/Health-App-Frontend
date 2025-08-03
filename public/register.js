const API_BASE = "https://health-app-backend-8pci.onrender.com";

document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const msg = document.getElementById("registerMessage");
  msg.textContent = "";
  msg.style.color = "red"; 

  const email = e.target.email.value.trim();
  const password = e.target.password.value;
  const confirm = e.target.confirmPassword.value;

  if (password !== confirm) {
    msg.textContent = "Passwords do not match.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.message || "Registration failed.";
      return;
    }

    msg.style.color = "green";
    msg.textContent = "Registration successful! Redirecting to login...";
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (err) {
    msg.textContent = "Error connecting to server.";
  }
});
