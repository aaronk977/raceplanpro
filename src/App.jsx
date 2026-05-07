import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appLoading, setAppLoading] = useState(true);

  useEffect(function() {
    supabase.auth.getSession().then(function(res) {
      if (res.data.session) setUser(res.data.session.user);
      setAppLoading(false);
    });
    var listener = supabase.auth.onAuthStateChange(function(event, session) {
      setUser(session ? session.user : null);
    });
    return function() { listener.data.subscription.unsubscribe(); };
  }, []);

  var login = async function() {
    setLoading(true); setError("");
    var res = await supabase.auth.signInWithPassword({ email, password });
    if (res.error) setError(res.error.message);
    setLoading(false);
  };

  var signup = async function() {
    setLoading(true); setError("");
    var res = await supabase.auth.signUp({ email, password });
    if (res.error) setError(res.error.message);
    else setError("Account created! Check your email to confirm, then log in.");
    setLoading(false);
  };

  var logout = async function() {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (appLoading) return (
    <div style={{ minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#aaa", fontSize: 15 }}>Loading...</div>
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 16, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: "#0a1628" }}>RacePlan Pro</div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>Yard Management System</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button onClick={function(){setAuthMode("login");setError("");}}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
              background: authMode === "login" ? "#0a1628" : "#eee", color: authMode === "login" ? "#fff" : "#333" }}>
            Log In
          </button>
          <button onClick={function(){setAuthMode("signup");setError("");}}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
              background: authMode === "signup" ? "#0a1628" : "#eee", color: authMode === "signup" ? "#fff" : "#333" }}>
            Sign Up
          </button>
        </div>
        <input type="email" placeholder="Email" value={email}
          onChange={function(e){setEmail(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter")authMode==="login"?login():signup();}}
          style={{ width: "100%", padding: "10px 12px", marginBottom: 10, border: "1px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
        <input type="password" placeholder="Password" value={password}
          onChange={function(e){setPassword(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter")authMode==="login"?login():signup();}}
          style={{ width: "100%", padding: "10px 12px", marginBottom: 14, border: "1px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
        {error && (
          <div style={{ fontSize: 13, marginBottom: 12, padding: "8px 12px", borderRadius: 8,
            background: error.includes("created") || error.includes("Check") ? "#f0fdf4" : "#fef2f2",
            color: error.includes("created") || error.includes("Check") ? "#166534" : "#dc2626" }}>
            {error}
          </div>
        )}
        <button onClick={authMode === "login" ? login : signup} disabled={loading}
          style={{ width: "100%", padding: 13, background: "#f0c040", color: "#0a1628", border: "none",
            borderRadius: 8, fontSize: 15, fontWeight: 900, cursor: "pointer" }}>
          {loading ? "Please wait..." : authMode === "login" ? "Log In" : "Create Account"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a1628", color: "#fff", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#f0c040" }}>RacePlan Pro</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>{user.email}</span>
          <button onClick={logout} style={{ padding: "6px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Rebuilding features...</div>
        <div style={{ color: "#aaa", fontSize: 14 }}>Full app coming back shortly. Your account is set up and ready.</div>
      </div>
    </div>
  );
}
