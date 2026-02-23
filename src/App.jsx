import { useState, useCallback } from "react";
import { getToken, getRole, clearAuth, apiFetch } from "./api";
import AuthScreen from "./pages/AuthScreen";
import DashboardView from "./pages/DashboardView";
import ClassroomsView from "./pages/ClassroomsView";
import ReservationsView from "./pages/ReservationsView";
import UsersView from "./pages/UsersView";
import ProfileView from "./pages/ProfileView";
import Sidebar from "./components/SideBar";
import Toast from "./components/Toast";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [page, setPage] = useState("dashboard");
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  async function logout() {
    const rt = localStorage.getItem("refreshToken");
    if (rt) {
      apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify(rt),
      }).catch(() => {});
    }
    clearAuth();
    setAuthed(false);
    setPage("dashboard");
  }

  if (!authed) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Outfit:wght@400;500;600;700&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background: #080c10; font-family: 'Outfit', sans-serif; }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
        <AuthScreen onAuth={() => setAuthed(true)} />
        <Toast toasts={toasts} />
      </>
    );
  }

  const isAdmin = getRole() === "Admin";

  const VIEWS = {
    dashboard: <DashboardView addToast={addToast} />,
    reservations: <ReservationsView addToast={addToast} />,
    classrooms: <ClassroomsView addToast={addToast} />,
    users: isAdmin ? <UsersView addToast={addToast} /> : null,
    profile: <ProfileView addToast={addToast} />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #080c10; font-family: 'Outfit', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #080c10; }
        ::-webkit-scrollbar-thumb { background: #1e2d3d; border-radius: 3px; }
        input, select, textarea { color-scheme: dark; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <Sidebar
        active={page}
        onNav={setPage}
        onLogout={logout}
      />

      <main
        style={{
          marginLeft: 220,
          minHeight: "100vh",
          background: "#080c10",
          padding: "28px 32px",
        }}
      >
        {VIEWS[page] || VIEWS.dashboard}
      </main>

      <Toast toasts={toasts} />
    </>
  );
}