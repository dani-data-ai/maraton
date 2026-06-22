import { useState, useContext } from "react";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import ContPage from "./pages/ContPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const [tab, setTab] = useState("home");
  const [page, setPage] = useState("login");

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="pulse" style={{ fontFamily: "Lora, serif", fontSize: "1.8rem", color: "var(--gold)" }}>Maraton</div>
      </div>
    );
  }

  if (!user) {
    if (page === "register") return <RegisterPage goLogin={() => setPage("login")} />;
    return <LoginPage goRegister={() => setPage("register")} />;
  }

  return (
    <div className="app-shell">
      {tab === "home" && <HomePage user={user} />}
      {tab === "cont" && <ContPage />}
      <NavBar tab={tab} setTab={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
