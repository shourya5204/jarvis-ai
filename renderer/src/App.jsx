import Orb from "./components/Orb";

export default function App() {
  return (
    <div style={{
      height: "100vh",
      width: "100vw",
      background: "radial-gradient(circle at center, #020617, #000000)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <Orb />
    </div>
  );
}