import { useEffect, useState } from "react";
import NeuralMesh from "./components/NeuralMesh"; // ✅ make sure path is correct

function App() {
  const [status, setStatus] = useState("idle");

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

  return (
    <>
      <NeuralMesh status={status} />

      <div style={{
        position: "absolute",
        bottom: "40px",
        width: "100%",
        textAlign: "center",
        fontFamily: "system-ui",
        color: "black",
        fontSize: "14px",
        opacity: 0.7
      }}>
        {status === "idle" && "PRESS ENTER"}
        {status === "listening" && "Listening..."}
        {status === "processing" && "Processing..."}
      </div>
    </>
  );
}

export default App;
