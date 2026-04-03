const readline = require("readline");
const { recordAudio, stopRecording, transcribeAudio } = require("./voice");
const { isSpeaking } = require("../utils/speaker");
const { mute, unmute, getVolume, setVolume } = require("../utils/audioControl");

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// 🔥 SHARED LISTENER FACTORY (NEW)
function createListener(onInput) {

  let isRecording = false;
  const audioFile = "ptt.wav";
  let originalVolume = null;

  return async function toggleRecording() {
    if (isSpeaking) return;

    // 🎤 START RECORDING
    if (!isRecording) {
      console.log("🎤 Recording... (press ENTER to stop)");

      originalVolume = getVolume();
      mute();

      await sleep(200);

      isRecording = true;
      recordAudio(audioFile);
    }

    // 🛑 STOP RECORDING
    else {
      console.log("⏹️ Processing...");
      isRecording = false;

      stopRecording();

      await sleep(500);

      if (originalVolume !== null) {
        unmute();
        setVolume(originalVolume);
      }

      const fs = require("fs");
      console.log("File size:", fs.statSync(audioFile).size);

      try {
        const text = await transcribeAudio(audioFile);

        if (!text || text.trim().length < 2) {
          console.log("⚠️ No speech detected\n");
          return;
        }

        const command = text.toLowerCase().trim();
        console.log("Command:", command);

        await onInput(command);

        console.log("\nJARVIS: Ready (press ENTER)\n");

      } catch (err) {
        console.log("Error:", err.message);
      }
    }
  };
}

// 🖥️ CLI (UNCHANGED BEHAVIOR)
function startCLI(onInput) {
  console.log("JARVIS: Press ENTER to speak\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const toggleRecording = createListener(onInput);

  rl.on("line", toggleRecording);
}

module.exports = { startCLI, createListener };