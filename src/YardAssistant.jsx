import React, { useState, useEffect, useRef } from "react";
import { Btn, C, ANTHROPIC_KEY } from "./shared";

var API_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
};

function YardAssistant({ horses, weights, medLogs, settings, user, supabase }) {
  var todayStr = new Date().toISOString().slice(0, 10);
  var messagesState = useState([]);
  var messages = messagesState[0]; var setMessages = messagesState[1];
  var inputState = useState("");
  var input = inputState[0]; var setInput = inputState[1];
  var loadingState = useState(false);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var listeningState = useState(false);
  var listening = listeningState[0]; var setListening = listeningState[1];
  var loadedState = useState(false);
  var loaded = loadedState[0]; var setLoaded = loadedState[1];
  var bottomRef = useRef(null);

  var yardName = (settings && settings.yardName) || "the yard";
  var trainerName = (settings && settings.trainerName) || "the trainer";
  var activeHorses = (horses || []).filter(function(h) { return h.status === "Active"; });

  // Load today's conversation from Supabase
  useEffect(function() {
    if (!user || !supabase || loaded) return;
    setLoaded(true);
    supabase.from("yard_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", todayStr)
      .eq("category", "assistant")
      .order("created_at", { ascending: true })
      .then(function(res) {
        if (res.data && res.data.length > 0) {
          var hist = res.data.map(function(row) {
            return { role: row.role, content: row.content, id: row.id };
          });
          setMessages(hist);
        } else {
          setMessages([{ role: "assistant", content: "Morning! I'm your yard assistant for " + yardName + ". I know your " + activeHorses.length + " active horses. Ask me anything, log tasks, or book appointments.", id: "welcome" }]);
        }
      });
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(function() {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  function saveMessage(role, content) {
    if (!user || !supabase) return;
    supabase.from("yard_logs").insert({
      user_id: user.id,
      log_date: todayStr,
      role: role,
      content: content,
      category: "assistant"
    }).then(function(r) {
      if (r.error) console.error("Log save:", r.error);
    });
  }

  function buildSystemPrompt() {
    var horseList = activeHorses.slice(0, 20).map(function(h) {
      return h.name + " (" + (h.sex || "") + ", " + (h.owner || "no owner") + ", OR " + (h.nhRating || h.flatRating || "unrated") + ")";
    }).join("; ");
    return [
      "You are the AI yard assistant for " + yardName + ", trainer: " + trainerName + ".",
      activeHorses.length + " active horses. " + (horseList || "None loaded."),
      "Today: " + new Date().toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + ".",
      "Help with: logging tasks, appointments, horse queries, medication, race planning.",
      "Be direct and concise. Under 120 words unless detail needed. Use Irish racing knowledge.",
      "When asked to log or book something, confirm it's been noted and saved to today's log.",
      "Format lists with bullet points. Keep it practical."
    ].join(" ");
  }

  var sendMessage = async function() {
    if (!input.trim() || loading) return;
    var userText = input.trim();
    var userMsg = { role: "user", content: userText, id: "u_" + Date.now() };
    setMessages(function(prev) { return prev.concat([userMsg]); });
    saveMessage("user", userText);
    setInput("");
    setLoading(true);
    try {
      var history = messages
        .filter(function(m) { return m.id !== "welcome"; })
        .concat([userMsg])
        .slice(-12)
        .map(function(m) { return { role: m.role, content: m.content }; });
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: API_HEADERS,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 500,
          system: buildSystemPrompt(),
          messages: history
        })
      });
      var data = await res.json();
      var txt = (data.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
      var aMsg = { role: "assistant", content: txt, id: "a_" + Date.now() };
      setMessages(function(prev) { return prev.concat([aMsg]); });
      saveMessage("assistant", txt);
    } catch (err) {
      console.error(err);
      var errMsg = { role: "assistant", content: "Connection error. Check API key in Yard Settings.", id: "err_" + Date.now() };
      setMessages(function(prev) { return prev.concat([errMsg]); });
    }
    setLoading(false);
  };

  function startListening() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input needs Chrome browser."); return; }
    var recognition = new SR();
    recognition.lang = "en-IE";
    recognition.interimResults = false;
    setListening(true);
    recognition.start();
    recognition.onresult = function(e) { setInput(e.results[0][0].transcript); setListening(false); };
    recognition.onerror = function() { setListening(false); };
    recognition.onend = function() { setListening(false); };
  }

  function clearToday() {
    if (!window.confirm("Clear today's conversation?")) return;
    setMessages([{ role: "assistant", content: "Fresh start. What do you need?", id: "fresh_" + Date.now() }]);
    if (user && supabase) {
      supabase.from("yard_logs").delete().eq("user_id", user.id).eq("log_date", todayStr).eq("category", "assistant").then(function() {});
    }
  }

  var QUICK_PROMPTS = [
    "Who is racing this week?",
    "Which horses need Peptizole checked today?",
    "Log: checked all horses this morning, all good",
    "Book farrier for next Thursday",
    "What tasks are outstanding?"
  ];

  var isFirstOpen = messages.length <= 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", minHeight: 500 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Yard Assistant</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>
            {"AI pocket assistant — " + activeHorses.length + " horses · today's conversation auto-saves"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={clearToday} style={{ fontSize: 11, padding: "6px 12px" }}>Clear Today</Btn>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4, marginBottom: 10 }}>
        {messages.map(function(msg) {
          var isUser = msg.role === "user";
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "82%", padding: "11px 15px",
                borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                background: isUser ? C.navy : C.card,
                border: isUser ? "none" : "1px solid " + C.border,
                color: isUser ? "#fff" : C.text, fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                {!isUser && (
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.gold, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                    Yard Assistant
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "11px 15px", borderRadius: "4px 18px 18px 18px", background: C.card, border: "1px solid " + C.border }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, opacity: 0.9 }} />
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, opacity: 0.6 }} />
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, opacity: 0.3 }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {isFirstOpen && (
        <div style={{ marginBottom: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>Quick prompts</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QUICK_PROMPTS.map(function(prompt) {
              return (
                <button key={prompt} onClick={function() { setInput(prompt); }}
                  style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + C.border, background: C.card, color: C.textMid, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                  {prompt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <textarea value={input} onChange={function(e) { setInput(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={"Ask anything · log a task · book an appointment · Enter to send"}
            rows={2}
            style={{ width: "100%", padding: "11px 15px", background: C.card, border: "1.5px solid " + C.border, borderRadius: 14, fontSize: 14, color: C.text, resize: "none", lineHeight: 1.5 }} />
        </div>
        <button onClick={startListening} disabled={listening}
          style={{ width: 46, height: 46, borderRadius: 14, border: "1.5px solid " + (listening ? C.red : C.border), background: listening ? C.red + "15" : C.card, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {listening ? "🔴" : "🎤"}
        </button>
        <Btn onClick={sendMessage} disabled={!input.trim() || loading}
          style={{ height: 46, padding: "0 20px", borderRadius: 14, flexShrink: 0, justifyContent: "center" }}>
          {loading ? "..." : "Send"}
        </Btn>
      </div>
    </div>
  );
}

export default YardAssistant;
