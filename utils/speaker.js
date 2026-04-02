const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

let queue = [];
let isSpeaking = false;



function speak(text) {
  if (!text) return;

  isSpeaking = true;

  const command = `say "${text}"`;

  require("child_process").exec(command, () => {
    isSpeaking = false;
  });
}

module.exports = { speak, isSpeaking };


function processQueue() {
  if (isSpeaking || queue.length === 0) return;

  const text = queue.shift();
  speakInternal(text);
}

async function speakInternal(text) {
  isSpeaking = true;

  const safeText = text.replace(/"/g, "").trim();
  const filePath = path.join(__dirname, `../voice_${Date.now()}.mp3`);

  try {
    // 🔥 ElevenLabs
    const response = await axios({
      method: "POST",
      url: "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
      },
      data: {
        text: safeText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.25,
          similarity_boost: 0.9,
          style: 0.7,
          use_speaker_boost: true
        }
      },
      responseType: "arraybuffer"
    });

    fs.writeFileSync(filePath, response.data);

    exec(`afplay "${filePath}"`, () => {
      fs.unlink(filePath, () => {});
      isSpeaking = false;
      processQueue();
    });

  } catch (err) {
    console.log("⚠️ ElevenLabs failed, fallback...");

    const wavPath = filePath.replace(".mp3", ".wav");

    const command = `
/Users/shourya/Desktop/jarvis-ai/voice-env/bin/tts \
--text "${safeText}" \
--model_name tts_models/en/vctk/vits \
--speaker_idx p230 \
--speed 0.9 \
--out_path "${wavPath}"
`;

    exec(command, () => {
      exec(`afplay "${wavPath}"`, () => {
        fs.unlink(wavPath, () => {});
        isSpeaking = false;
        processQueue();
      });
    });
  }
}

function speak(text) {
  if (!text) return;

  queue.push(text);
  processQueue();
}

module.exports = { speak };