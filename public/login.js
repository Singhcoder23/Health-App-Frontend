const API_BASE = "https://health-app-backend-52md.onrender.com/api";  

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const messageDiv = document.getElementById('message');
  messageDiv.textContent = '';
  messageDiv.style.color = 'red';

  const email = e.target.email.value.trim();
  const password = e.target.password.value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      messageDiv.textContent = errorData.message || 'Login failed. Please try again.';
      return;
    }

    const data = await response.json();

    
    localStorage.setItem('token', data.token);

    messageDiv.style.color = 'green';
    messageDiv.textContent = 'Login successful! Redirecting...';

    
    setTimeout(() => {
      window.location.href = '/dashboard.html'; 
    }, 1000);
  } catch (err) {
    messageDiv.textContent = 'Error connecting to server. Please try again later.';
    console.error('Login fetch error:', err);
  }
});
