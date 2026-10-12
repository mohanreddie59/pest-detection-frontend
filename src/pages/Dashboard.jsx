import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { detectionsApi, trapsApi, alertsApi, sensorsApi } from "../api/endpoints";
import { useFetch, PageHeader, StatCard, State, Badge, fmt } from "../components/ui";

const asList = (x) => (Array.isArray(x) ? x : x?.content || []);

export default function Dashboard() {
  const { data, error, loading } = useFetch(async () => {
    const [traps, detections, alerts, sensors] = await Promise.all([
      trapsApi.list(), detectionsApi.list(), alertsApi.list(), sensorsApi.list(),
    ]);
    return { traps: asList(traps), detections: asList(detections), alerts: asList(alerts), sensors: asList(sensors) };
  });

  const view = useMemo(() => {
    if (!data) return null;
    const perDay = {};
    const perPest = {};
    data.detections.forEach((d) => {
      const day = (d.detectedAt || d.timestamp || d.createdAt || "").slice(0, 10);
      if (day) perDay[day] = (perDay[day] || 0) + 1;
      const pest = d.pestType || d.pestName || "Unknown";
      perPest[pest] = (perPest[pest] || 0) + 1;
    });
    const trend = Object.entries(perDay).sort().map(([day, count]) => ({ day: day.slice(5), count }));
    const byPest = Object.entries(perPest).map(([pest, count]) => ({ pest, count }));
    const openAlerts = data.alerts.filter((a) => !a.resolved);
    const latestSensors = [...data.sensors].slice(-30).map((s, i) => ({
      i,
      temperature: s.temperature,
      humidity: s.humidity,
    }));
    return { trend, byPest, openAlerts, latestSensors };
  }, [data]);

  if (loading || error) return <><PageHeader title="Dashboard" /><State loading={loading} error={error} /></>;

  const activeTraps = data.traps.filter((t) => (t.status || "").toUpperCase() === "ACTIVE").length;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live overview of your smart traps" />
      <div className="grid stats">
        <StatCard label="Smart traps" value={data.traps.length} />
        <StatCard label="Active traps" value={activeTraps} tone="good" />
        <StatCard label="Total detections" value={data.detections.length} />
        <StatCard label="Open alerts" value={view.openAlerts.length} tone={view.openAlerts.length ? "danger" : "good"} />
      </div>

      <div className="grid two">
        <div className="card">
          <h2>Detections over time</h2>
          <div style={{ height: 240, marginTop: 10 }}>
            <ResponsiveContainer>
              <LineChart data={view.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e7df" />
                <XAxis dataKey="day" /><YAxis allowDecimals={false} /><Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2f7d4f" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2>Detections by pest</h2>
          <div style={{ height: 240, marginTop: 10 }}>
            <ResponsiveContainer>
              <BarChart data={view.byPest}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e7df" />
                <XAxis dataKey="pest" /><YAxis allowDecimals={false} /><Tooltip />
                <Bar dataKey="count" fill="#2f7d4f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2>Temperature &amp; humidity (latest readings)</h2>
          <div style={{ height: 240, marginTop: 10 }}>
            <ResponsiveContainer>
              <LineChart data={view.latestSensors}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e7df" />
                <XAxis dataKey="i" hide /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="temperature" stroke="#c0392b" dot={false} />
                <Line type="monotone" dataKey="humidity" stroke="#2b6cb0" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2>Open alerts</h2>
          {view.openAlerts.length === 0 ? (
            <p className="muted">No open alerts 🎉</p>
          ) : (
            <table>
              <tbody>
                {view.openAlerts.slice(0, 6).map((a) => (
                  <tr key={a.id}>
                    <td><Badge tone="bad">{a.severity || "ALERT"}</Badge></td>
                    <td>{a.message}</td>
                    <td className="muted">{fmt(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
