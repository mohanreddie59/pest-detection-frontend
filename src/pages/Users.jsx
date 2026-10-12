import { useState } from "react";
import { usersApi } from "../api/endpoints";
import { useFetch, PageHeader, State, Badge, Modal } from "../components/ui";

export default function Users() {
  const { data, error, loading, reload } = useFetch(usersApi.list);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState("");
  const list = Array.isArray(data) ? data : data?.content || [];
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const open = (u) => { setEditing(u); setForm({ ...u }); setFormError(""); };

  const save = async (e) => {
    e.preventDefault();
    try {
      await usersApi.update(editing.id, form);
      setEditing(null);
      reload();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const remove = async (u) => {
    if (!confirm(`Delete user "${u.username}"?`)) return;
    try { await usersApi.remove(u.id); reload(); } catch (err) { alert(err.message); }
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Accounts with access to the system" />
      <State loading={loading} error={error} empty={!loading && !error && list.length === 0} />
      {list.length > 0 && (
        <div className="card">
          <table>
            <thead><tr><th>Username</th><th>Email</th><th>Role</th><th></th></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>{u.username || u.name}</td>
                  <td>{u.email || "—"}</td>
                  <td><Badge tone="info">{u.role || "USER"}</Badge></td>
                  <td className="actions">
                    <button className="btn ghost small" onClick={() => open(u)}>Edit</button>
                    <button className="btn danger small" onClick={() => remove(u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title="Edit user" onClose={() => setEditing(null)}>
          <form className="form" onSubmit={save}>
            <label>Username<input value={form.username || ""} onChange={set("username")} required /></label>
            <label>Email<input type="email" value={form.email || ""} onChange={set("email")} /></label>
            <label>Role
              <select value={form.role || "USER"} onChange={set("role")}>
                <option>USER</option><option>ADMIN</option>
              </select>
            </label>
            {formError && <div style={{ color: "var(--red)" }}>{formError}</div>}
            <button className="btn">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
