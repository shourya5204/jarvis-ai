const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateSpeech(text) {
  try {
    const res = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `
You are Jarvis, a calm and intelligent AI assistant.

Convert the input into a short, natural, conversational spoken response.

Rules:
- Speak like a human (not like an article)
- Use pauses like "..." where natural
- Keep it under 1–2 sentences
- Sound confident and smooth
- No bullet points
- No explanations

Example:
Input: Elon Musk is the CEO of Tesla and SpaceX.
Output: Sir... Elon Musk leads Tesla and SpaceX.

Input:
${text}
`
        }
      ],
      temperature: 0.7
    });

    return res.choices[0].message.content;

  } catch (err) {
    console.log("Speech AI failed, fallback...");
    return text;
  }
}

module.exports = { generateSpeech };