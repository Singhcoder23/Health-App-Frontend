document.getElementById('registerForm').addEventListener('submit', async function (e) {
  const API_BASE = "https://health-app-backend-52md.onrender.com/api";  

  e.preventDefault();

  const messageDiv = document.getElementById('message');
  messageDiv.textContent = '';
  messageDiv.style.color = 'red';

  const email = e.target.email.value.trim();
  const password = e.target.password.value;

  try {
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors) {
        messageDiv.textContent = data.errors.map(err => err.msg).join(', ');
      } else if (data.message) {
        messageDiv.textContent = data.message;
      } else {
        messageDiv.textContent = 'Registration failed. Please try again.';
      }
      return;
    }

    messageDiv.style.color = 'green';
    messageDiv.textContent = 'Registration successful! Redirecting to login...';

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } catch (err) {
    messageDiv.textContent = 'Could not connect to server. Please try again later.';
    console.error('Fetch error:', err);
  }
});
