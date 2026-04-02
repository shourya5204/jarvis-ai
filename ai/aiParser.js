const Groq = require("groq-sdk");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// ---------------- PROMPT ----------------

function buildPrompt(input) {
  return `
You are an AI system planner.

STRICT RULES:
- Output ONLY valid JSON
- No explanation
- No markdown
- No extra text
- Always return a PLAN object

------------------------

SUPPORTED STEP TYPES:

1. BROWSER_SEARCH
   - requires: query
   - optional: action ("summarize")

2. FILE_OPERATION
   - actions:
     - find_file (name)
     - create_folder (name, optional location)
     - move_file
     - rename_file (new_name)

------------------------

SUPPORTED LOCATIONS:
- desktop
- documents
- downloads
- home (default)

If user specifies a location, include it inside the action.

------------------------
MANDATORY ACTION RULES:

- If user mentions "move":
  MUST include:
    1. find_file
    2. move_file

- If destination folder is mentioned:
  MUST include:
    1. create_folder (if not guaranteed)
    2. move_file

- NEVER stop at create_folder if move is requested

- A plan is INVALID if move_file is missing when move is requested
----------------------------
Input: find testjarvis.txt and move it to happy folder

Output:
{
  "type": "PLAN",
  "steps": [
    {
      "type": "FILE_OPERATION",
      "actions": [
        {"action": "find_file", "name": "testjarvis.txt"},
        {"action": "create_folder", "name": "happy"},
        {"action": "move_file"}
      ]
    }
  ]
}





IMPORTANT RULES:

- Combine steps when possible
- If user says "that file", DO NOT include name (use memory)
- ALWAYS return an array of steps
- FILE_OPERATION must contain "actions" array

------------------------

EXAMPLES:

Input: search elon musk and summarize

Output:
{
  "type": "PLAN",
  "steps": [
    {
      "type": "BROWSER_SEARCH",
      "query": "elon musk",
      "action": "summarize"
    }
  ]
}

------------------------

Input: create a folder called career on desktop

Output:
{
  "type": "PLAN",
  "steps": [
    {
      "type": "FILE_OPERATION",
      "actions": [
        {
          "action": "create_folder",
          "name": "career",
          "location": "desktop"
        }
      ]
    }
  ]
}

------------------------

Input: find resume and move it to career folder

Output:
{
  "type": "PLAN",
  "steps": [
    {
      "type": "FILE_OPERATION",
      "actions": [
        {"action": "find_file", "name": "resume"},
        {"action": "create_folder", "name": "career"},
        {"action": "move_file"}
      ]
    }
  ]
}
-------------------------


--------------------------

NEW TYPE: OS_ACTION

Actions:
- youtube_play (query)
- close_tab
- open_youtube

Example:

Input: close tab

Output:
{
  "type": "PLAN",
  "steps": [
    {
      "type": "OS_ACTION",
      "action": "close_tab"
    }
  ]
}

--------------------------

--------------------------


NEW TYPE: OS_ACTION

------------------------


Actions:
- youtube_play (query)

Example:

Input: open youtube and play kesariya

Output:
{
  "type": "PLAN",
  "steps": [
    {
      "type": "OS_ACTION",
      "action": "youtube_play",
      "query": "kesariya song"
    }
  ]
}

------------------------

Input: move that file to documents

Output:
{
  "type": "PLAN",
  "steps": [
    {
      "type": "FILE_OPERATION",
      "actions": [
        {"action": "create_folder", "name": "documents", "location": "documents"},
        {"action": "move_file"}
      ]
    }
  ]
}

------------------------

Input: ${input}
`;
}

// ---------------- GROQ ----------------

async function parseWithGroq(input) {
  const res = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [{ role: "user", content: buildPrompt(input) }],
    temperature: 0
  });

  return res.choices[0].message.content;
}

// ---------------- GEMINI ----------------

async function parseWithGemini(input) {
  const res = await gemini.models.generateContent({
    model: "gemini-2.0-flash",
    contents: buildPrompt(input)
  });

  return res.text;
}

// ---------------- LOCAL FALLBACK ----------------
function localParser(input) {
  input = input.toLowerCase();

  // browser fallback
  if (input.includes("search")) {
    return {
      type: "PLAN",
      steps: [
        {
          type: "BROWSER_SEARCH",
          query: input.replace("search", "").trim(),
          action: "summarize"
        }
      ]
    };
  }
  if (input.includes("close tab")) {
  return {
    type: "PLAN",
    steps: [
      {
        type: "OS_ACTION",
        action: "close_tab"
      }
    ]
  };
}

  // file fallback
  if (input.includes("file") || input.includes("folder")) {
    return {
      type: "PLAN",
      steps: [
        {
          type: "FILE_OPERATION",
          actions: []
        }
      ]
    };
  }

  return {
    type: "PLAN",
    steps: []
  };
}


function validateIntent(intent, input) {
  if (!intent.steps) return intent;

  const lowerInput = input.toLowerCase();

  for (let step of intent.steps) {
    if (step.type === "FILE_OPERATION" && step.actions) {

      const actions = step.actions.map(a => a.action);

      const hasFind = actions.includes("find_file");
      const hasMove = actions.includes("move_file");

      // ✅ ONLY add move if user explicitly said move
      if (
        lowerInput.includes("move") &&
        hasFind &&
        !hasMove
      ) {
        step.actions.push({ action: "move_file" });
      }
    }
  }

  return intent;
}





// ---------------- MAIN PARSER ----------------

async function parseIntent(input) {
  // 1. Try GROQ
  try {
    const text = await parseWithGroq(input);

    const cleaned = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);
    return validateIntent(parsed, input);

  } catch (err) {
    console.log("JARVIS: Groq failed, switching to Gemini...");
  }

  // 2. Try GEMINI
  try {
    const text = await parseWithGemini(input);

    const cleaned = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);
    return validateIntent(parsed, input);

  } catch (err) {
    console.log("JARVIS: Gemini failed, using local parser...");
  }

  // 3. FINAL FALLBACK
  return localParser(input);
}

module.exports = { parseIntent };