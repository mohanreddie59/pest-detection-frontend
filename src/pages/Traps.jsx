import { useState } from "react";
import { trapsApi } from "../api/endpoints";
import { useFetch, PageHeader, State, Badge, Modal } from "../components/ui";

const empty = { name: "", location: "", deviceId: "", status: "ACTIVE" };

export default function Traps() {
  const { data, error, loading, reload } = useFetch(trapsApi.list);
  const [editing, setEditing] = useState(null); // null | {…trap} | "new"
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState("");

  const open = (trap) => {
    setEditing(trap || "new");
    setForm(trap ? { ...empty, ...trap } : empty);
    setFormError("");
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing === "new") await trapsApi.create(form);
      else await trapsApi.update(editing.id, form);
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const remove = async (t) => {
    if (!confirm(`Delete trap "${t.name}"?`)) return;
    try { await trapsApi.remove(t.id); reload(); } catch (err) { alert(err.message); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const list = Array.isArray(data) ? data : data?.content || [];

  return (
    <>
      <PageHeader title="Smart Traps" subtitle="Registered trap devices"
        action={<button className="btn" onClick={() => open()}>+ Add trap</button>} />
      <State loading={loading} error={error} empty={!loading && !error && list.length === 0} />
      {list.length > 0 && (
        <div className="card">
          <table>
            <thead><tr><th>Name</th><th>Device ID</th><th>Location</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.deviceId || "—"}</td>
                  <td>{t.location || "—"}</td>
                  <td><Badge tone={(t.status || "").toUpperCase() === "ACTIVE" ? "good" : "warn"}>{t.status || "—"}</Badge></td>
                  <td className="actions">
                    <button className="btn ghost small" onClick={() => open(t)}>Edit</button>
                    <button className="btn danger small" onClick={() => remove(t)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add smart trap" : "Edit smart trap"} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={save}>
            <label>Name<input value={form.name} onChange={set("name")} required /></label>
            <div className="row">
              <label>Device ID<input value={form.deviceId} onChange={set("deviceId")} /></label>
              <label>Status
                <select value={form.status} onChange={set("status")}>
                  <option>ACTIVE</option><option>INACTIVE</option><option>MAINTENANCE</option>
                </select>
              </label>
            </div>
            <label>Location<input value={form.location} onChange={set("location")} /></label>
            {formError && <div style={{ color: "var(--red)" }}>{formError}</div>}
            <button className="btn">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
