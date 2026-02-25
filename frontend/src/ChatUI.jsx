import { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function ChatUI({ results, onSearch }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [filter, setFilter] = useState("all");
  if (!browserSupportsSpeechRecognition) {
  return (
    <div style={{color:"white"}}>
      ❌ Voice search not supported in this browser. Use Chrome.
    </div>
  );
}
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const sendMessage = async () => {
    if (!input) return;

    const userMsg = { type: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    await onSearch(input);

    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [
        ...prev,
        { type: "ai", results: results }
      ]);
    }, 1200);

    setInput("");
    resetTranscript();
  };

  const filteredResults =
    filter === "all"
      ? results
      : results.filter(r => r.title === filter);

  return (
    <div style={styles.chatContainer}>
      {/* CHAT WINDOW */}
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i}>
            {m.type === "user" && (
              <div style={styles.userMsg}>{m.text}</div>
            )}

            {m.type === "ai" && (
              <div style={styles.aiMsg}>
                <b>Top Results:</b>

                {/* FILTER */}
                <select
                  style={styles.dropdown}
                  onChange={e => setFilter(e.target.value)}
                >
                  <option value="all">All Files</option>
                  {[...new Set(results.map(r => r.title))].map(f => (
                    <option key={f}>{f}</option>
                  ))}
                </select>

                {/* RESULTS */}
                {filteredResults.map((r, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.resultCard,
                      border:
                        idx === 0
                          ? "2px solid #22c55e"
                          : "1px solid #334155"
                    }}
                  >
                    <h4>{r.title}</h4>
                    <p>{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div style={styles.typing}>AI is typing...</div>
        )}
      </div>

      {/* INPUT BAR */}
      <div style={styles.inputBox}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything..."
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.sendBtn}>
          Send
        </button>

        {browserSupportsSpeechRecognition && (
  <button
    onClick={() =>
      listening
        ? SpeechRecognition.stopListening()
        : SpeechRecognition.startListening({
            continuous: true,
            language: "en-IN"
          })
    }
    style={{
      ...styles.voiceBtn,
      background: listening ? "#ef4444" : "#6366f1"
    }}
  >
    {listening ? "🎙 Listening..." : "🎤 Speak"}
  </button>
)}
      </div>
    </div>
  );
}

const styles = {
  chatContainer: {
    marginTop: 40,
    background: "#020617",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #334155",
  },

  chatBox: {
    height: "400px",
    overflowY: "auto",
    marginBottom: 15,
  },

  userMsg: {
    background: "#6366f1",
    padding: 10,
    borderRadius: 10,
    margin: 8,
    maxWidth: "60%",
    marginLeft: "auto",
  },

  aiMsg: {
    background: "#0f172a",
    padding: 10,
    borderRadius: 10,
    margin: 8,
    maxWidth: "80%",
  },

  resultCard: {
    background: "#020617",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
  },

  typing: {
    color: "#94a3b8",
    fontStyle: "italic",
  },

  inputBox: {
    display: "flex",
    gap: 10,
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "none",
  },

  sendBtn: {
    padding: "10px 16px",
    background: "#22c55e",
    border: "none",
    borderRadius: 8,
    color: "white",
  },

  voiceBtn: {
    padding: "10px",
    borderRadius: 8,
    border: "none",
    background: "#6366f1",
    color: "white",
  },

  dropdown: {
    marginTop: 10,
    padding: 6,
    borderRadius: 6,
  },
};