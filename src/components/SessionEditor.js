import React, { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import { fetchWithAuth } from "../api/api";
import { toast } from "react-toastify";

export default function SessionEditor({ session = {}, onSave }) {
  const [form, setForm] = useState({
    _id: session._id || null,
    title: session.title || "",
    tags: session.tags ? session.tags.join(", ") : "",
    json_file_url: session.json_file_url || "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const saveDraftDebounced = useRef(
    debounce(async (data) => {
      try {
        setIsSaving(true);
        const res = await fetchWithAuth("/my-sessions/save-draft", {
          method: "POST",
          body: JSON.stringify({
            _id: data._id,
            title: data.title,
            tags: data.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            json_file_url: data.json_file_url,
          }),
        });
        if (!res.ok) {
          toast.error("Auto-save failed");
          setIsSaving(false);
          return;
        }
        const updated = await res.json();
        setForm((prev) => ({ ...prev, _id: updated._id }));
        toast.success("Draft auto-saved");
      } catch {
        toast.error("Auto-save failed");
      } finally {
        setIsSaving(false);
      }
    }, 5000)
  ).current;

  useEffect(() => {
    if (form.title.trim() || form.json_file_url.trim()) {
      saveDraftDebounced(form);
    }
    return () => saveDraftDebounced.cancel();
  }, [form, saveDraftDebounced]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetchWithAuth("/my-sessions/save-draft", {
        method: "POST",
        body: JSON.stringify({
          _id: form._id,
          title: form.title,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          json_file_url: form.json_file_url,
        }),
      });
      if (!res.ok) {
        toast.error("Save draft failed");
        return;
      }
      const updated = await res.json();
      setForm((prev) => ({ ...prev, _id: updated._id }));
      toast.success("Draft saved");
    } catch {
      toast.error("Error saving draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form._id) {
      toast.error("Save draft before publishing.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetchWithAuth("/my-sessions/publish", {
        method: "POST",
        body: JSON.stringify({ _id: form._id }),
      });
      if (!res.ok) {
        toast.error("Publish failed");
        return;
      }
      toast.success("Session published!");
      if (typeof onSave === "function") onSave();
    } catch {
      toast.error("Error publishing session");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <div>
        <label>
          Title:
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Session title"
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
        </label>
      </div>
      <div>
        <label>
          Tags (comma separated):
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="tag1, tag2"
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
        </label>
      </div>
      <div>
        <label>
          JSON File URL:
          <input
            name="json_file_url"
            value={form.json_file_url}
            onChange={handleChange}
            placeholder="https://example.com/archive.json"
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
        </label>
      </div>
      <div>
        <button onClick={handleSaveDraft} disabled={isSaving} style={{ marginRight: 10 }}>
          {isSaving ? "Saving..." : "Save Draft"}
        </button>
        <button onClick={handlePublish} disabled={isSaving}>
          Publish
        </button>
      </div>
    </div>
  );
}
