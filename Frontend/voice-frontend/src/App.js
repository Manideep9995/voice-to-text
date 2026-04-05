import React, { useRef, useState } from "react";
import axios from "axios";

function App() {
  const [mode, setMode] = useState("upload");
  const [recording, setRecording] = useState(false);
  const [lines, setLines] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const ws = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const lastTextRef = useRef("");

  // 🎙️ START RECORDING
  const startRecording = async () => {
    if (recording || uploading) return;

    setLines([]);
    lastTextRef.current = "";

    ws.current = new WebSocket("ws://127.0.0.1:8000/ws/audio/");
    ws.current.binaryType = "arraybuffer";
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.text && data.text.trim() !== "") {
        if (data.text !== lastTextRef.current) {
          setLines((prev) => [...prev, data.text]);
          lastTextRef.current = data.text;
        }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    // ✅ Safe MediaRecorder setup
let options = {};

if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
  options.mimeType = "audio/webm;codecs=opus";
} else if (MediaRecorder.isTypeSupported("audio/webm")) {
  options.mimeType = "audio/webm";
}

mediaRecorderRef.current = new MediaRecorder(stream, options);

// ✅ Debug logs
mediaRecorderRef.current.onstart = () => {
  console.log("🎙️ Recording started");
};

mediaRecorderRef.current.ondataavailable = async (event) => {
  console.log("🎤 Chunk:", event.data.size);

  // ❌ REMOVE readyState check (IMPORTANT)
  if (event.data.size > 1000 && ws.current) {
    try {
      const buffer = await event.data.arrayBuffer();
      ws.current.send(buffer);
      console.log("📡 Sent to backend");
    } catch (err) {
      console.error("❌ Send failed:", err);
    }
  }
};

mediaRecorderRef.current.onerror = (e) => {
  console.error("❌ Recorder error:", e);
};

// 🔥 IMPORTANT: use 1 second for testing
mediaRecorderRef.current.start(1000);
    setRecording(true);
  };

  // ⏹️ STOP RECORDING
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setRecording(false);
  };

  // 📁 FILE SELECT
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 📁 FILE SUBMIT
  const handleFileSubmit = async () => {
    if (!file) return alert("Select file first");

    setUploading(true);
    setLoadingText("⏳ Converting audio... Please wait...");
    setLines([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/transcribe/",
        formData
      );

      setLines([response.data.text]);

    } catch (error) {
      console.error(error);
      setLines(["❌ Error while converting file"]);
    } finally {
      // 🔥 Re-enable after completion
      setUploading(false);
      setLoadingText("");
    }
  };

  // 🧹 CLEAR TEXT
  const clearText = () => {
    setLines([]);
    lastTextRef.current = "";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>🎙️ Voice to Text</h2>

      {/* 🔘 RADIO BUTTONS */}
      <div>
        <label>
          <input
            type="radio"
            value="live"
            checked={mode === "live"}
            disabled={!uploading} // 🔥 disable while uploading
            onChange={(e) => setMode(e.target.value)}
          />
          Live Voice
        </label>

        <label style={{ marginLeft: "20px" }}>
          <input
            type="radio"       
            value="upload"
            checked={mode === "upload"}
            disabled={recording} // 🔥 disable while recording
            onChange={(e) => setMode(e.target.value)}
          />
          Upload File
        </label>
      </div>

      <br />

      {/* 🎤 LIVE MIC */}
      <div style={{ opacity: mode === "upload" ? 0.5 : 1 }}>
        <h3>🎙️ Live Microphone</h3>
        <button
          onClick={startRecording}
          disabled={recording || mode !== "live" || uploading}
        >
          Start
        </button>

        <button
          onClick={stopRecording}
          disabled={!recording || mode !== "live"}
        >
          Stop
        </button>
      </div>

      <br />

      {/* 📁 FILE UPLOAD */}
      <div style={{ opacity: mode === "live" ? 0.5 : 1 }}>
        <h3>📁 Upload Audio File</h3>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={mode !== "upload" || uploading}
        />

        <button
          onClick={handleFileSubmit}
          disabled={mode !== "upload" || uploading}
        >
          {uploading ? "Processing..." : "Submit File"}
        </button>
      </div>

      <br />

      {/* 📝 OUTPUT */}
      <h3>📝 Transcription:</h3>

      <div
        style={{
          maxWidth: "600px",
          margin: "auto",
          textAlign: "left",
          background: "#f4f4f4",
          padding: "15px",
          borderRadius: "10px",
        }}
      >
        {loadingText && <p>{loadingText}</p>}

        {lines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>

      <br />

      {/* 🧹 CLEAR BUTTON */}
      <button onClick={clearText} disabled={lines.length === 0 && !loadingText}>
        Clear Text
      </button>
    </div>
  );
}

export default App;