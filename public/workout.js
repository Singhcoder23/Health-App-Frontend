function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener('DOMContentLoaded', async () => {
  const sessionURL = getQueryParam('session');
  const detailsSection = document.getElementById('workoutDetails');

  if (!sessionURL) {
    detailsSection.innerHTML = "<p class='error'>No session specified to load.</p>";
    return;
  }

  detailsSection.innerHTML = "<h2>Loading workout...</h2>";

  try {
    const response = await fetch(sessionURL);
    if (!response.ok) throw new Error(`Network error: ${response.status}`);

    const sessionData = await response.json();

    let html = `<h2>${sessionData.title || 'Untitled Workout'}</h2>`;

    if (sessionData.tags) {
      const tags = Array.isArray(sessionData.tags)
        ? sessionData.tags.join(', ')
        : sessionData.tags;
      html += `<p><strong>Tags:</strong> ${tags}</p>`;
    }

    if (sessionData.description) {
      html += `<p>${sessionData.description}</p>`;
    } else if (sessionData.content) {
      html += `<p>${sessionData.content}</p>`;
    }

    if (sessionData.steps && Array.isArray(sessionData.steps) && sessionData.steps.length > 0) {
      html += `<h3>Workout Steps:</h3><ol>`;
      sessionData.steps.forEach(step => {
        html += `<li>${step}</li>`;
      });
      html += `</ol>`;
    } else if (sessionData.exercises && Array.isArray(sessionData.exercises) && sessionData.exercises.length > 0) {
      html += `<h3>Workout Exercises:</h3><ol>`;
      sessionData.exercises.forEach(exercise => {
        html += `<li>${exercise}</li>`;
      });
      html += `</ol>`;
    } else {
      html += `<p>No detailed steps available for this session.</p>`;
    }

    detailsSection.innerHTML = html;
  } catch (error) {
    detailsSection.innerHTML = `<p class='error'>Error loading workout: ${error.message}</p>`;
  }
});
