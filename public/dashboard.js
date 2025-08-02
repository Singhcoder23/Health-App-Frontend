document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  };

  // Cached elements
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

  // Escape HTML
  function escapeHtml(txt) {
    if (!txt) return '';
    const d = document.createElement('div');
    d.textContent = txt; return d.innerHTML;
  }

  // List published sessions
  async function loadPublishedSessions() {
    try {
      const res = await fetch('http://localhost:5000/api/sessions');
      if (!res.ok) throw new Error();
      const sessions = await res.json();
      publishedSessionsList.innerHTML = (sessions.length === 0)
        ? '<p>No published sessions found.</p>'
        : sessions.map(s => `
            <div class="session-item published">
              <div class="session-info">
                <h3>${escapeHtml(s.title || 'Untitled')}</h3>
                <p class="tags">Tags: ${(s.tags || []).map(escapeHtml).join(', ') || '<em>None</em>'}</p>
                ${s.json_file_url ? `<p><a href="${escapeHtml(s.json_file_url)}" target="_blank" rel="noopener">Session JSON</a></p>` : ''}
                ${s.content ? `<p>${escapeHtml(s.content)}</p>` : ''}
              </div>
            </div>
          `).join('');
    } catch {
      publishedSessionsList.innerHTML = `<p class="error">Error loading published sessions.</p>`;
    }
  }

  // List user's sessions
  async function loadMySessions() {
    try {
      const res = await fetch('http://localhost:5000/api/my-sessions', {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!res.ok) throw new Error();
      const sessions = await res.json();
      mySessionList.innerHTML = (sessions.length === 0)
        ? '<p>You have no sessions.</p>'
        : sessions.map(s => `
          <div class="session-item ${s.status}">
            <div class="session-info">
              <h3>${escapeHtml(s.title || '(No Title)')}</h3>
              <p class="tags">Tags: ${(s.tags || []).map(escapeHtml).join(', ') || '<em>None</em>'}</p>
              <p>Status: <strong>${escapeHtml(s.status)}</strong></p>
            </div>
            <div class="session-actions">
              <button onclick="editSession('${s._id}')">Edit</button>
              ${s.status === 'draft' ? `<button class="publish" onclick="publishSession('${s._id}')">Publish</button>` : ''}
            </div>
          </div>
        `).join('');
    } catch {
      mySessionList.innerHTML = `<p class="error">Error loading your sessions.</p>`;
    }
  }

  // Editor logic
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
      const res = await fetch(`http://localhost:5000/api/my-sessions/${id}`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      if (!res.ok) throw new Error();
      const s = await res.json();
      inputId.value = s._id || '';
      inputTitle.value = s.title || '';
      inputTags.value = (s.tags || []).join(', ');
      inputJsonUrl.value = s.json_file_url || '';
      inputContent.value = s.content || '';
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
      ? 'http://localhost:5000/api/my-sessions/publish'
      : 'http://localhost:5000/api/my-sessions/save-draft';

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

  // Auto-save after 5s of inactivity in any field
  let autoSaveTimer = null;
  [
    inputTitle, inputTags, inputJsonUrl, inputContent
  ].forEach(input =>
    input.addEventListener('input', () => {
      editorStatus.textContent = 'Editing...';
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        if (sessionEditorSection.style.display !== 'none') saveOrPublish('save-draft');
      }, 5000);
    })
  );

  // Initial load
  loadPublishedSessions();
  loadMySessions();
});
