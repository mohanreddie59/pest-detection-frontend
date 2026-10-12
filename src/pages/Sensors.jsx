import { useState } from "react";
import { sensorsApi, trapsApi } from "../api/endpoints";
import { useFetch, PageHeader, State, Modal, fmt } from "../components/ui";

const asList = (x) => (Array.isArray(x) ? x : x?.content || []);

export default function Sensors() {
  const { data, error, loading, reload } = useFetch(async () => ({
    readings: asList(await sensorsApi.list()),
    traps: asList(await trapsApi.list()),
  }));
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ trapId: "", temperature: "", humidity: "" });
  const [formError, setFormError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await sensorsApi.create({
        trapId: Number(form.trapId),
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
      });
      setShow(false);
      reload();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const list = data?.readings || [];

  return (
    <>
      <PageHeader title="Sensor Readings" subtitle="Environmental data reported by traps"
        action={<button className="btn" onClick={() => { setShow(true); setFormError(""); }}>+ Add reading</button>} />
      <State loading={loading} error={error} empty={!loading && !error && list.length === 0} />
      {list.length > 0 && (
        <div className="card">
          <table>
            <thead><tr><th>When</th><th>Trap</th><th>Temperature (°C)</th><th>Humidity (%)</th></tr></thead>
            <tbody>
              {[...list].reverse().map((s) => (
                <tr key={s.id}>
                  <td>{fmt(s.recordedAt || s.timestamp || s.createdAt)}</td>
                  <td>{s.trapName || s.trap?.name || s.trapId}</td>
                  <td>{s.temperature}</td>
                  <td>{s.humidity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {show && (
        <Modal title="Add sensor reading" onClose={() => setShow(false)}>
          <form className="form" onSubmit={submit}>
            <label>Trap
              <select value={form.trapId} onChange={set("trapId")} required>
                <option value="">Select trap…</option>
                {(data?.traps || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <div className="row">
              <label>Temperature (°C)<input type="number" step="0.1" value={form.temperature} onChange={set("temperature")} required /></label>
              <label>Humidity (%)<input type="number" step="0.1" value={form.humidity} onChange={set("humidity")} required /></label>
            </div>
            {formError && <div style={{ color: "var(--red)" }}>{formError}</div>}
            <button className="btn">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
