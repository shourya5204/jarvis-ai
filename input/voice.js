const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");




let recorderProcess = null;



async function transcribeAudio(file) {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file));
    formData.append("model", "whisper-large-v3");

    const res = await axios.post(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );

    return res.data.text || "";

  } catch (err) {
    console.log("Transcription error:", err.message);
    return "";
  }
}


// 🎤 START RECORDING (use rec, not sox -d)
function recordAudio(file = "ptt.wav") {
  const filePath = path.resolve(file);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  recorderProcess = spawn("rec", [
    filePath,
    "rate", "16000",
    "channels", "1"
  ]);

  recorderProcess.stderr.on("data", (data) => {
    console.log("REC:", data.toString());
  });
}

// 🛑 STOP RECORDING
function stopRecording() {
  if (recorderProcess) {
    recorderProcess.kill("SIGINT");
    recorderProcess = null;
  }
}



module.exports = {
  recordAudio,
  stopRecording,
  transcribeAudio
};