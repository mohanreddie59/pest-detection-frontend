import { useState } from "react";
import { detectionsApi, trapsApi } from "../api/endpoints";
import { useFetch, PageHeader, State, Badge, Modal, fmt } from "../components/ui";

const asList = (x) => (Array.isArray(x) ? x : x?.content || []);

export default function Detections() {
  const { data, error, loading, reload } = useFetch(async () => ({
    detections: asList(await detectionsApi.list()),
    traps: asList(await trapsApi.list()),
  }));
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ trapId: "", pestType: "", count: 1, confidence: 0.9 });
  const [formError, setFormError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await detectionsApi.create({
        trapId: Number(form.trapId),
        pestType: form.pestType,
        count: Number(form.count),
        confidence: Number(form.confidence),
      });
      setShow(false);
      reload();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const remove = async (d) => {
    if (!confirm("Delete this detection?")) return;
    try { await detectionsApi.remove(d.id); reload(); } catch (err) { alert(err.message); }
  };

  const list = data?.detections || [];
  const trapName = (d) => d.trapName || d.trap?.name || d.trapId || "—";

  return (
    <>
      <PageHeader title="Detections" subtitle="Pests identified by your traps"
        action={<button className="btn" onClick={() => { setShow(true); setFormError(""); }}>+ Log detection</button>} />
      <State loading={loading} error={error} empty={!loading && !error && list.length === 0} />
      {list.length > 0 && (
        <div className="card">
          <table>
            <thead><tr><th>When</th><th>Trap</th><th>Pest</th><th>Count</th><th>Confidence</th><th></th></tr></thead>
            <tbody>
              {[...list].reverse().map((d) => (
                <tr key={d.id}>
                  <td>{fmt(d.detectedAt || d.timestamp || d.createdAt)}</td>
                  <td>{trapName(d)}</td>
                  <td>{d.pestType || d.pestName}</td>
                  <td>{d.count ?? 1}</td>
                  <td>
                    {d.confidence != null && (
                      <Badge tone={d.confidence >= 0.8 ? "good" : "warn"}>{Math.round(d.confidence * 100)}%</Badge>
                    )}
                  </td>
                  <td><button className="btn danger small" onClick={() => remove(d)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {show && (
        <Modal title="Log detection" onClose={() => setShow(false)}>
          <form className="form" onSubmit={submit}>
            <label>Trap
              <select value={form.trapId} onChange={set("trapId")} required>
                <option value="">Select trap…</option>
                {(data?.traps || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label>Pest type<input value={form.pestType} onChange={set("pestType")} required placeholder="e.g. Aphid" /></label>
            <div className="row">
              <label>Count<input type="number" min="1" value={form.count} onChange={set("count")} /></label>
              <label>Confidence (0–1)<input type="number" step="0.01" min="0" max="1" value={form.confidence} onChange={set("confidence")} /></label>
            </div>
            {formError && <div style={{ color: "var(--red)" }}>{formError}</div>}
            <button className="btn">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
