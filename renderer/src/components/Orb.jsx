import { motion } from "framer-motion";

export default function Orb() {
  return (
    <div style={{
      position: "relative",
      width: 200,
      height: 200,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>

      {/* OUTER GLOW */}
      <motion.div
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(0,242,255,0.1)",
          filter: "blur(40px)"
        }}
      />

      {/* CORE */}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, #00f2ff, #001f3f)",
          boxShadow: "0 0 80px #00f2ff"
        }}
      />

    </div>
  );
}