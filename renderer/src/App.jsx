import { useEffect, useState } from "react";
import NeuralMesh from "./components/NeuralMesh";

function App() {
  const [status, setStatus] = useState("idle");

  const [apiKey, setApiKey] = useState("");
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // 🔥 Load config FIRST
  useEffect(() => {
    window.jarvis?.getConfig().then((config) => {
      if (config && config.GROQ_API_KEY) {
        setIsSetupDone(true);
      }
      setIsChecking(false);
    });
  }, []);

  // 🔥 Keyboard + state listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        window.jarvis?.startListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    window.jarvis?.onStateChange((data) => {
      setStatus(data.state);
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 🔥 Save key
  const saveKey = () => {
    window.jarvis?.saveConfig({
      GROQ_API_KEY: apiKey
    });
    setIsSetupDone(true);
  };

  // 🔥 Loading (prevents flicker)
  if (isChecking) {
    return null;
  }

  return (
    <>
      {/* 🔥 SETUP SCREEN */}
      {!isSetupDone ? (
        <div style={{ padding: 40 }}>
          <h2>Enter API Key</h2>
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter GROQ API key"
          />
          <br /><br />
          <button onClick={saveKey}>Save</button>
        </div>
      ) : (
        <>
          {/* 🔥 ORIGINAL UI */}
          <NeuralMesh status={status} />

          <div
            style={{
              position: "absolute",
              bottom: "40px",
              width: "100%",
              textAlign: "center",
              fontFamily: "system-ui",
              color: "black",
              fontSize: "14px",
              opacity: 0.7,
            }}
          >
            {status === "idle" && "PRESS ENTER"}
            {status === "listening" && "Listening..."}
            {status === "processing" && "Processing..."}
          </div>
          
          <div
            onClick={() => window.jarvis?.resetConfig()}
            style={{
              position: "absolute",
              top: "20px",
              right: "25px",
              fontSize: "12px",
              fontFamily: "system-ui",
              color: "black",
              opacity: 0.4,
              cursor: "pointer",
              userSelect: "none",
              transition: "opacity 0.2s ease"
            }}
            onMouseEnter={(e) => (e.target.style.opacity = 0.8)}
            onMouseLeave={(e) => (e.target.style.opacity = 0.4)}
          >
            reset
          </div>




        </>
      )}
    </>

    


  );
}

export default App;