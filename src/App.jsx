import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async function() {
    setLoading(true);
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.error) setError(res.error.message);
    else setUser(res.data.user);
    setLoading(false);
  };

  const logout = async function() {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 16, width: 360 }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: "#0a1628" }}>RacePlan Pro</div>
        <input type="email" placeholder="Email" value={email} onChange={function(e){setEmail(e.target.value);}}
          style={{ width: "100%", padding: 10, marginBottom: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
        <input type="password" placeholder="Password" value={password} onChange={function(e){setPassword(e.target.value);}}
          style={{ width: "100%", padding: 10, marginBottom: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }} />
        {error && <div style={{ color: "red", marginBottom: 10, fontSize: 13 }}>{error}</div>}
        <button onClick={login} disabled={loading}
          style={{ width: "100%", padding: 12, background: "#0a1628", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a1628", color: "#fff", padding: 32 }}>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>RacePlan Pro</div>
      <div style={{ color: "#aaa", marginBottom: 20 }}>{user.email}</div>
      <button onClick={logout} style={{ padding: "8px 16px", background: "#f0c040", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
        Sign Out
      </button>
      <div style={{ marginTop: 32, color: "#aaa" }}>App loading... features coming back online shortly.</div>
    </div>
  );
}
