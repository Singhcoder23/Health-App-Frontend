document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const messageDiv = document.getElementById('message');
  messageDiv.textContent = '';
  messageDiv.style.color = 'red';

  const email = e.target.email.value.trim();
  const password = e.target.password.value;

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
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

    // Store JWT token for use in authenticated calls
    localStorage.setItem('token', data.token);

    messageDiv.style.color = 'green';
    messageDiv.textContent = 'Login successful! Redirecting...';

    // Redirect to dashboard page after 1 second
    setTimeout(() => {
      window.location.href = '/dashboard.html'; // Adjust path as needed
    }, 1000);
  } catch (err) {
    messageDiv.textContent = 'Error connecting to server. Please try again later.';
    console.error('Login fetch error:', err);
  }
});
