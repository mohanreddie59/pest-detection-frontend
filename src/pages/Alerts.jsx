import { alertsApi } from "../api/endpoints";
import { useFetch, PageHeader, State, Badge, fmt } from "../components/ui";

const tone = (s = "") => ({ HIGH: "bad", CRITICAL: "bad", MEDIUM: "warn", LOW: "info" }[s.toUpperCase()] || "neutral");

export default function Alerts() {
  const { data, error, loading, reload } = useFetch(alertsApi.list);
  const list = Array.isArray(data) ? data : data?.content || [];

  const act = (fn) => async (a) => {
    try { await fn(a.id); reload(); } catch (err) { alert(err.message); }
  };
  const resolve = act(alertsApi.resolve);
  const markRead = act(alertsApi.markRead);
  const remove = async (a) => {
    if (!confirm("Delete this alert?")) return;
    act(alertsApi.remove)(a);
  };

  return (
    <>
      <PageHeader title="Alerts" subtitle="Infestation and device warnings" />
      <State loading={loading} error={error} empty={!loading && !error && list.length === 0} />
      {list.length > 0 && (
        <div className="card">
          <table>
            <thead><tr><th>Severity</th><th>Message</th><th>Trap</th><th>When</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {[...list].reverse().map((a) => (
                <tr key={a.id} style={a.read ? { opacity: 0.7 } : undefined}>
                  <td><Badge tone={tone(a.severity)}>{a.severity || "INFO"}</Badge></td>
                  <td>{a.message}</td>
                  <td>{a.trapName || a.trap?.name || a.trapId || "—"}</td>
                  <td className="muted">{fmt(a.createdAt)}</td>
                  <td><Badge tone={a.resolved ? "good" : "warn"}>{a.resolved ? "Resolved" : "Open"}</Badge></td>
                  <td className="actions">
                    {!a.read && <button className="btn ghost small" onClick={() => markRead(a)}>Mark read</button>}
                    {!a.resolved && <button className="btn small" onClick={() => resolve(a)}>Resolve</button>}
                    <button className="btn danger small" onClick={() => remove(a)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
