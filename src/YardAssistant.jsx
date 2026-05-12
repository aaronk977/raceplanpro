import React, { useState, useEffect } from "react";
import { Btn, C, ANTHROPIC_KEY } from "./shared";

var API_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
};

function YardAssistant({ horses, weights, medLogs, settings }) {
  var messagesState = useState([
    { role: "assistant", content: "Morning! I'm your yard assistant. Ask me anything about your horses, book appointments, log tasks, or just think out loud. I know your yard.", id: "welcome" }
  ]);
  var messages = messagesState[0]; var setMessages = messagesState[1];
  var inputState = useState("");
  var input = inputState[0]; var setInput = inputState[1];
  var loadingState = useState(false);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var listenState = useState(false);
  var listening = listenState[0]; var setListening = listenState[1];

  var yardName = (settings && settings.yardName) || "the yard";
  var trainerName = (settings && settings.trainerName) || "the trainer";
  var horseCount = (horses || []).filter(function(h) { return h.status === "Active"; }).length;

  function buildSystemPrompt() {
    var horseList = (horses || []).filter(function(h) { return h.status === "Active"; }).map(function(h) {
      return h.name + " (" + (h.sex || "") + ", " + (h.owner || "no owner") + ", OR " + (h.nhRating || h.flatRating || "unrated") + ")";
    }).join(", ");
    var parts = [
      "You are the AI yard assistant for " + yardName + ", trained by " + trainerName + ".",
      "You have " + horseCount + " active horses.",
      "Active horses: " + (horseList || "none loaded yet") + ".",
      "Today is " + new Date().toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + ".",
      "You help with: logging tasks and appointments, answering questions about horses, medication reminders, race planning thoughts, and anything else the trainer or staff need.",
      "Be direct, practical and concise. Use Irish racing knowledge. When someone mentions a horse by name, look them up in the yard list.",
      "If asked to book something, confirm the details and say it has been noted.",
      "Format responses cleanly. Use bullet points for lists. Keep answers under 150 words unless detail is needed."
    ];
    return parts.join(" ");
  }

  var sendMessage = async function() {
    if (!input.trim() || loading) return;
    var userMsg = { role: "user", content: input.trim(), id: "u_" + Date.now() };
    setMessages(function(prev) { return prev.concat([userMsg]); });
    setInput("");
    setLoading(true);
    try {
      var history = messages.concat([userMsg]).filter(function(m) { return m.id !== "welcome"; }).slice(-10).map(function(m) {
        return { role: m.role, content: m.content };
      });
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          system: buildSystemPrompt(),
          messages: history
        })
      });
      var data = await res.json();
      var txt = (data.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
      setMessages(function(prev) { return prev.concat([{ role: "assistant", content: txt, id: "a_" + Date.now() }]); });
    } catch (err) {
      console.error(err);
      setMessages(function(prev) { return prev.concat([{ role: "assistant", content: "Sorry, I couldn't connect. Check your API key in Yard Settings.", id: "err_" + Date.now() }]); });
    }
    setLoading(false);
  };

  function startListening() {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Voice input not supported in this browser. Use Chrome.");
      return;
    }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SR();
    recognition.lang = "en-IE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.start();
    recognition.onresult = function(event) {
      var transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = function() { setListening(false); };
    recognition.onend = function() { setListening(false); };
  }

  var QUICK_PROMPTS = [
    "Who is racing this week?",
    "Which horses need their Peptizole checked today?",
    "Book a vet visit for next Tuesday",
    "Log: treated Monalee's leg this morning",
    "What's the weight trend for my top horses?",
    "Remind me to call the farrier Thursday"
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)", minHeight: 500 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Yard Assistant</div>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>
          {"Your AI pocket assistant — " + horseCount + " horses loaded. Ask anything."}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, paddingRight: 4 }}>
        {messages.map(function(msg) {
          var isUser = msg.role === "user";
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "80%", padding: "12px 16px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: isUser ? C.navy : C.card,
                border: isUser ? "none" : "1px solid " + C.border,
                color: isUser ? "#fff" : C.text, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {!isUser && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
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
            <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", background: C.card, border: "1px solid " + C.border }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0,1,2].map(function(i) {
                  return <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, opacity: 0.6, animation: "pulse 1s infinite " + (i * 0.2) + "s" }} />;
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Quick prompts</div>
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

      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <textarea value={input} onChange={function(e) { setInput(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything about your yard, log a task, book an appointment..."
            rows={2}
            style={{ width: "100%", padding: "12px 16px", background: C.card, border: "1.5px solid " + C.border, borderRadius: 14, fontSize: 14, color: C.text, resize: "none", lineHeight: 1.5 }} />
        </div>
        <button onClick={startListening} disabled={listening}
          style={{ width: 48, height: 48, borderRadius: 14, border: "1.5px solid " + (listening ? C.red : C.border), background: listening ? C.red + "15" : C.card, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {listening ? "🔴" : "🎤"}
        </button>
        <Btn onClick={sendMessage} disabled={!input.trim() || loading} style={{ height: 48, padding: "0 20px", borderRadius: 14, flexShrink: 0, justifyContent: "center" }}>
          {loading ? "..." : "Send"}
        </Btn>
      </div>
    </div>
  );
}

export default YardAssistant;
