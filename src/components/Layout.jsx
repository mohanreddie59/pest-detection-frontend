import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  ["/", "Dashboard"],
  ["/traps", "Smart Traps"],
  ["/detections", "Detections"],
  ["/sensors", "Sensors"],
  ["/alerts", "Alerts"],
  ["/users", "Users"],
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">🐛 PestWatch</div>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="muted">{user?.username || "Signed in"}</div>
          <button className="btn ghost" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
