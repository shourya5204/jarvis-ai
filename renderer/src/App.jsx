import { useEffect } from "react";
import NeuralMesh from "./components/NeuralMesh"; // ✅ make sure path is correct

function App() {

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        console.log("ENTER pressed → start listening");

        window.jarvis?.startListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <NeuralMesh /> {/* 🔥 your original UI restored */}
    </>
  );
}

export default App;