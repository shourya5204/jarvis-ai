const https = require("https");
const Groq = require("groq-sdk");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// ---------------- SEARCH FUNCTION ----------------

function searchDuckDuckGo(query) {
  return new Promise((resolve, reject) => {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;

    https.get(url, (res) => {
      let data = "";

      res.on("data", chunk => data += chunk);

      res.on("end", () => {
        try {
          const json = JSON.parse(data);

          // 🔥 smarter extraction
          let text = "";

          if (json.Abstract) {
            text = json.Abstract;
          } else if (json.Answer) {
            text = json.Answer;
          } else if (json.RelatedTopics && json.RelatedTopics.length > 0) {
            const topics = json.RelatedTopics
              .filter(t => t.Text)
              .slice(0, 3)
              .map(t => t.Text);

            text = topics.join("\n");
          }

          resolve(text || "No useful results found.");

        } catch (err) {
          reject(err);
        }
      });

    }).on("error", reject);
  });
}

// ---------------- SUMMARIZER ----------------

async function summarize(content) {

  // 🔥 avoid useless summarization
  if (!content || content.length < 30) {
    return content;
  }

  const prompt = `
Summarize clearly in 3-5 concise bullet points.
Avoid filler words. Be direct.
`;

  try {
    const res = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: content }
      ],
      temperature: 0.3
    });

    return res.choices[0].message.content;

  } catch {
    console.log("JARVIS: Groq failed, trying Gemini...");
  }

  try {
    const res = await gemini.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${prompt}\n\n${content}`
    });

    return res.text;

  } catch {
    console.log("JARVIS: Using raw content...");
  }

  return content;
}

// ---------------- MAIN ----------------

async function handleBrowser(intent) {
  const { query, action } = intent;

  console.log("JARVIS: Searching...");

  try {
    const rawText = await searchDuckDuckGo(query);

    // 🔥 optional summarization
    if (action === "summarize") {
      const summary = await summarize(rawText);
      return summary;
    }

    return rawText;

  } catch (err) {
    console.error("Search Error:", err.message);
    return "Failed to fetch search results.";
  }
}

module.exports = { handleBrowser };