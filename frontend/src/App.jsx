import { useState } from "react";
import axios from "axios";
import { UploadCloud, Search, FileText, Sparkles, Mic } from "lucide-react";
export default function App() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
 const startVoiceSearch = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice search not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onstart = () => {
    setMsg("🎤 Listening...");
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    setQuery(text);
    setMsg("✅ Voice captured");

    setTimeout(() => searchDocs(text), 500);
  };

  recognition.onerror = () => {
    setMsg("❌ Voice recognition failed");
  };
};
  // Upload PDF
  const uploadFile = async () => {
    if (!file) return alert("Select PDF first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/upload", formData);
      setMsg("✅ PDF uploaded & processed successfully");
    } catch {
      setMsg("❌ Upload failed");
    }
    setLoading(false);
  };

  const searchDocs = async (input) => {
  let finalQuery;

  // if called from button click → input will be event
  if (typeof input === "string") {
    finalQuery = input; // voice search
  } else {
    finalQuery = query; // normal search
  }

  if (!finalQuery) return;

  try {
    setLoading(true);
    const res = await axios.post("http://localhost:5000/search", {
      query: finalQuery,
    });
    setResults(res.data.results || []);
  } catch (err) {
    console.error(err);
    setResults([]);
    alert("Search failed");
  }
  setLoading(false);
};

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <Sparkles size={40} color="#818cf8" />
        <h1 style={styles.title}>Semantic Search Engine</h1>
      </div>

      <p style={styles.subtitle}>
        Upload PDFs and search intelligently using AI-powered semantic search
      </p>

      {/* MAIN GRID */}
      <div style={styles.grid}>
        {/* LEFT PANEL */}
        <div style={styles.left}>
          {/* Upload */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <FileText size={20}/> Upload Document
            </h2>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{marginTop:10}}
            />

            <button style={styles.primaryBtn} onClick={uploadFile}>
              <UploadCloud size={18}/> Upload PDF
            </button>

            <p style={{marginTop:10, color:"#94a3b8"}}>{msg}</p>
          </div>

          {/* Search */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <Search size={20}/> Smart Search
            </h2>
            <div style={{display:"flex", gap:10, marginTop:12}}>
  <input
    style={styles.input}
    placeholder="Ask anything from your PDF..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />

  <button style={styles.micBtn} onClick={startVoiceSearch}>
    <Mic size={20}/>
  </button>
</div>

            <button style={styles.searchBtn} onClick={searchDocs}>
              <Search size={18}/> Search with AI
            </button>
          </div>
        </div>

        {/* RIGHT PANEL RESULTS */}
        <div style={styles.resultSection}>
          <h2 style={{marginBottom:15}}>📊 Results</h2>

          {loading && (
            <div style={styles.loadingBox}>
              🤖 AI thinking deeply...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div style={styles.nores}>
              No results yet. Try searching something.
            </div>
          )}

          <div style={styles.resultsScroll}>
            {results.map((r, i) => (
              <div key={i} style={styles.resultCard}>
                <h4>{r.title}</h4>
                <p>{r.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
   page:{
    fontFamily:"Arial",
    background:"#0f172a",
    minHeight:"100vh",
    width:"100vw",
    padding:"40px 80px",
    color:"white",
    boxSizing:"border-box"
  },


  header:{
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    gap:15
  },

  title:{ 
    fontSize:48, 
    fontWeight:"bold",
    textAlign:"center"
  },

  subtitle:{ 
    color:"#94a3b8", 
    marginBottom:40,
    textAlign:"center"
  },

  grid:{
  display:"grid",
  gridTemplateColumns:"420px 1fr",
  columnGap:"200px",   // space between upload & result
  rowGap:"20px",
  marginTop:40,
  width:"1300px"
},
  left:{
    display:"flex",
    flexDirection:"column",
    gap:25
  },

  resultSection:{
  background:"#020617",
  padding:25,
  borderRadius:16,
  border:"1px solid #1e293b",
  minHeight:"520px",
  maxHeight:"650px",
  display:"flex",
  flexDirection:"column",
  boxShadow:"0 10px 40px rgba(0,0,0,0.4)"
},
micBtn:{
  background:"#6366f1",
  border:"none",
  padding:"0 18px",
  borderRadius:10,
  color:"white",
  cursor:"pointer",
  display:"flex",
  alignItems:"center",
  justifyContent:"center"
},

 resultsScroll:{
  overflowY:"auto",
  marginTop:10,
  paddingRight:8,
  flex:1
},

  card:{
    background:"linear-gradient(145deg,#0f172a,#020617)",
    padding:24,
    borderRadius:16,
    width:"100%",
    boxShadow:"0 10px 30px rgba(0,0,0,0.4)",
    border:"1px solid #1e293b"
  },

  sectionTitle:{
    display:"flex",
    alignItems:"center",
    gap:10
  },

  input:{
    width:"100%",
    padding:12,
    marginTop:12,
    borderRadius:10,
    border:"1px solid #334155",
    background:"#020617",
    color:"white"
  },

  primaryBtn:{
    marginTop:12,
    padding:"12px 16px",
    background:"#6366f1",
    border:"none",
    color:"white",
    borderRadius:10,
    cursor:"pointer",
    display:"flex",
    gap:8,
    alignItems:"center",
    fontWeight:"bold"
  },

  searchBtn:{
    marginTop:12,
    padding:"12px 16px",
    background:"#22c55e",
    border:"none",
    color:"white",
    borderRadius:10,
    cursor:"pointer",
    display:"flex",
    gap:8,
    alignItems:"center",
    fontWeight:"bold"
  },

  resultCard:{
    background:"#0f172a",
    padding:18,
    borderRadius:12,
    marginBottom:15,
    border:"1px solid #334155"
  },

  loadingBox:{
    padding:20,
    background:"#0f172a",
    borderRadius:10,
    border:"1px solid #334155"
  },

  nores:{
    color:"#94a3b8",
    marginTop:20
  }
};