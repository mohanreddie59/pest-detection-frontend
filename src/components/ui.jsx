import { useEffect, useState, useCallback } from "react";

export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fn());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { data, error, loading, reload: load };
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, tone }) {
  return (
    <div className={`card stat ${tone || ""}`}>
      <div className="muted">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export function State({ loading, error, empty }) {
  if (loading) return <div className="card muted">Loading…</div>;
  if (error) return <div className="card error">{error}</div>;
  if (empty) return <div className="card muted">Nothing here yet.</div>;
  return null;
}

export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="page-head">
          <h2>{title}</h2>
          <button className="btn ghost" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");
