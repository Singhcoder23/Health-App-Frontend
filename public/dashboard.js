document.addEventListener('DOMContentLoaded', () => {
const API_BASE = "https://health-app-backend-8pci.onrender.com";

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  
  document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  };

  const publishedSessionsList = document.getElementById('publishedSessionsList');
  const mySessionList = document.getElementById('mySessionList');
  const sessionEditorSection = document.getElementById('sessionEditorSection');
  const sessionForm = document.getElementById('sessionForm');
  const editorHeader = document.getElementById('editorHeader');
  const editorStatus = document.getElementById('editorStatus');
  const inputId = document.getElementById('_id');
  const inputTitle = document.getElementById('title');
  const inputTags = document.getElementById('tags');
  const inputJsonUrl = document.getElementById('json_file_url');
  const inputContent = document.getElementById('content');
  const newSessionBtn = document.getElementById('newSessionBtn');
  const saveDraftBtn = document.getElementById('saveDraftBtn');
  const publishBtn = document.getElementById('publishBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  const DEMO_SESSIONS = [
    {
      title: "Morning Flow Yoga 🌅",
      tags: ["yoga", "flow", "stretch"],
      json_file_url: "morning-flow.json",
      content: "Start your day with energy and balance with this guided yoga flow."
    },
    {
      title: "Mindful Meditation Pause",
      tags: ["meditation", "mindfulness", "breathe"],
      json_file_url: "mindful-pause.json",
      content: "Recharge your focus and mental calm with a 10-minute meditation."
    },
    {
      title: "Lunch Break Breathing Reset",
      tags: ["breathing", "stress relief", "afternoon"],
      json_file_url: "lunch-break-reset.json",
      content: "Feel renewed mid-day with a short breathing technique session."
    }
  ];

  function escapeHtml(txt) {
    if (!txt) return '';
    const d = document.createElement('div');
    d.textContent = txt;
    return d.innerHTML;
  }

  async function loadPublishedSessions() {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (!res.ok) throw new Error();
      const sessions = await res.json();

      if (!Array.isArray(sessions) || sessions.length === 0) {
        populatePublished(DEMO_SESSIONS, '(Demo)');
        return;
      }
      populatePublished(sessions, '');
    } catch {
      populatePublished(DEMO_SESSIONS, '(Demo)');
    }
  }

  function populatePublished(sessions, mark = '') {
    publishedSessionsList.innerHTML = sessions.map(session => `
      <div class="session-item published">
        <div class="session-info">
          <h3>${escapeHtml(session.title || 'Untitled')} <span style="font-size:0.7em;color:#aaa;">${mark}</span></h3>
          <p class="tags">Tags: ${(session.tags || []).map(escapeHtml).join(', ') || '<em>None</em>'}</p>
          ${session.json_file_url 
            ? `<p><a href="workout.html?session=${encodeURIComponent(session.json_file_url)}" class="workout-link" target="_blank" rel="noopener">Do Workout</a></p>` 
            : ''}
          ${session.content ? `<p>${escapeHtml(session.content)}</p>` : ''}
        </div>
      </div>
    `).join('');
  }

  async function loadMySessions() {
    try {
      const res = await fetch(`${API_BASE}/my-sessions`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Failed to load your sessions');
      const sessions = await res.json();

      mySessionList.innerHTML = (sessions.length === 0)
        ? '<p>You have no sessions.</p>'
        : sessions.map(session => `
          <div class="session-item ${session.status}">
            <div class="session-info">
              <h3>${escapeHtml(session.title || '(No Title)')}</h3>
              <p class="tags">Tags: ${(session.tags || []).map(escapeHtml).join(', ') || '<em>None</em>'}</p>
              <p>Status: <strong>${escapeHtml(session.status)}</strong></p>
            </div>
            <div class="session-actions">
              <button onclick="editSession('${session._id}')">Edit</button>
              ${session.status === 'draft' ? `<button class="publish" onclick="publishSession('${session._id}')">Publish</button>` : ''}
              ${session.json_file_url ? `<a href="workout.html?session=${encodeURIComponent(session.json_file_url)}" target="_blank" rel="noopener" class="workout-link">Do Workout</a>` : ''}
            </div>
          </div>
        `).join('');
    } catch {
      mySessionList.innerHTML = `<p class="error">Error loading your sessions.</p>`;
    }
  }


  window.editSession = id => openEditor(id);
  window.publishSession = id => { inputId.value = id; saveOrPublish('publish'); };

  newSessionBtn.onclick = () => openEditor();
  cancelBtn.onclick = () => closeEditor();
  saveDraftBtn.onclick = () => saveOrPublish('save-draft');
  publishBtn.onclick = () => saveOrPublish('publish');

  async function openEditor(id) {
    editorStatus.textContent = '';
    editorHeader.textContent = id ? 'Edit Session' : 'New Session';
    sessionEditorSection.style.display = 'block';

    if (!id) {
      inputId.value = inputTitle.value = inputTags.value = inputJsonUrl.value = inputContent.value = '';
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/my-sessions/${id}`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!res.ok) throw new Error();
      const session = await res.json();

      inputId.value = session._id || '';
      inputTitle.value = session.title || '';
      inputTags.value = (session.tags || []).join(', ');
      inputJsonUrl.value = session.json_file_url || '';
      inputContent.value = session.content || '';
    } catch {
      alert('Error loading session for editing.');
      closeEditor();
    }
  }

  function closeEditor() {
    sessionEditorSection.style.display = 'none';
    editorStatus.textContent = '';
    sessionForm.reset();
  }

  async function saveOrPublish(action) {
    const id = inputId.value || undefined;
    const title = inputTitle.value.trim();
    const tags = inputTags.value.split(',').map(t => t.trim()).filter(Boolean);
    const json_file_url = inputJsonUrl.value.trim();
    const content = inputContent.value.trim();

    if (action === 'publish' && (!title || !json_file_url)) {
      editorStatus.textContent = 'Title and JSON File URL are required to publish.';
      return;
    }

    const url = action === 'publish'
      ? `${API_BASE}/my-sessions/publish`
      : `${API_BASE}/my-sessions/save-draft`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ _id: id, title, tags, json_file_url, content }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        editorStatus.textContent = errData.message || "Failed to save session. Please try again.";
        return;
      }

      await res.json();
      editorStatus.textContent = action === 'publish' ? 'Session Published!' : 'Draft Saved!';
      await loadMySessions();

      if (action === 'publish') closeEditor();
    } catch {
      editorStatus.textContent = "Failed to save session. Please try again later.";
    }
  }

  let autoSaveTimer = null;
  [inputTitle, inputTags, inputJsonUrl, inputContent].forEach(input =>
    input.addEventListener('input', () => {
      editorStatus.textContent = 'Editing...';
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        if (sessionEditorSection.style.display !== 'none') saveOrPublish('save-draft');
      }, 5000);
    })
  );

  loadPublishedSessions();
  loadMySessions();
});
