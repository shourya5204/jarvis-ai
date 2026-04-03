const { startCLI } = require("./input/cli");
const { parseIntent } = require("./ai/aiParser");
const { route } = require("./router/router");
const { jarvisLog } = require("./utils/logger");
const { speak } = require("./utils/speaker");
const { createListener } = require("./input/cli");
const { sendToUI } = require("./utils/uiEmitter");
const { generateSpeech } = require("./ai/speechFormatter"); // 🔥 NEW
require("dotenv").config();

// 🔍 API STATUS CHECK
console.log("GROQ KEY:", process.env.GROQ_API_KEY ? "Loaded" : "Missing");
console.log("GEMINI KEY:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");


// 🧠 DISPLAY RESPONSE (FULL, UNTOUCHED)
function formatJarvisResponse(text) {
  if (!text) return "";

  const prefixes = [
    "Sir",
    "Certainly",
    "Right away",
    "Here you go"
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  return `${prefix}, ${text}`;
}


// 🎯 MAIN HANDLER
async function handleInput(input) {
  try {
    console.log("\n🟡 RAW INPUT:", input);

    // Step 1: AI intent
    const intent = await parseIntent(input);
    console.log("🧠 PARSED INTENT:", JSON.stringify(intent, null, 2));

    // Step 2: execute
    const result = await route(intent);
    console.log("⚙️ ROUTE RESULT:", result);

    const response = result;

    jarvisLog(response);
    speak(response);

  } catch (error) {
    jarvisLog("Something went wrong.");
    console.error(error);
  }
}



const listener = createListener(handleInput);

async function startListening() {
  console.log("🎤 Listening triggered from UI");
  await listener();
}

module.exports = { startListening };

// 🚀 START CLI
//startCLI(handleInput);