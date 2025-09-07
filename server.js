import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000; // ✅ dynamic port for Render

app.use(cors());
app.use(express.json());

// ✅ Load portfolio.txt once when the server starts
function loadPortfolio() {
  const text = fs.readFileSync("portfolio.txt", "utf-8");
  const sections = {};
  let currentKey = null;

  text.split("\n").forEach(line => {
    if (line.trim() === "") return; // skip empty lines

    // Detect section headers like "Introduction:" or "Projects:"
    if (line.includes(":")) {
      const [key, ...rest] = line.split(":");
      currentKey = key.trim().toLowerCase();
      sections[currentKey] = rest.join(":").trim() || "";
    } else if (currentKey) {
      // Append bullet points or multi-line content
      sections[currentKey] += "\n" + line.trim();
    }
  });

  return sections;
}

const data = loadPortfolio(); // ✅ read once at startup

// Simple chatbot logic
function getAnswer(message) {
  const msg = message.toLowerCase();

  // Greetings → introduction
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return `Hi there! I’m ${data.name}, a ${data.title}. Ask me about my skills, projects, or work experience! 🌸`;
  }

  // Polite replies
  if (msg.includes("nice to meet you") || msg.includes("pleasure") || msg.includes("good to meet you")) {
    return "The pleasure is mine! I'm excited to share more about my projects and experience. 😊";
  }

  // Farewells
  if (msg.includes("bye") || msg.includes("goodbye") || msg.includes("see you")) {
    return "It was great chatting with you! Hope to connect again soon. 🌸";
  }

  // Portfolio-specific queries
  if (msg.includes("name")) return data.name;
  if (msg.includes("title") || msg.includes("who are you")) return data.title;
  if (msg.includes("intro") || msg.includes("about yourself") || msg.includes("summary")) return data.introduction;
  if (msg.includes("skill") && !msg.includes("soft")) return data["technical skills"];
  if (msg.includes("soft skill") || msg.includes("strength")) return data["soft skills"];
  if (msg.includes("project")) return data.projects;
  if (msg.includes("experience") || msg.includes("work") || msg.includes("job")) return data["work experience"];
  if (msg.includes("education") || msg.includes("study")) return data.education;
  if (msg.includes("contact") || msg.includes("email")) return data.contact;
  if (msg.includes("linkedin")) return "LinkedIn: " + (data.contact.match(/LinkedIn: (.*)/i)?.[1] || "");
  if (msg.includes("github")) return "GitHub: " + (data.contact.match(/GitHub: (.*)/i)?.[1] || "");

  // Fallback: return full portfolio if no keywords matched
  // ❌ Fallback: irrelevant questions
  return "I can only answer questions related to Zartashia's portfolio, such as skills, projects, experience, education, and contact details. 🌸";

}

          // Root route (so browser shows something instead of "Cannot GET /")
  app.get("/", (req, res) => {
    res.send("🚀 Portashi AI Chatbot backend is running!");
  });

  // Chat endpoint
  app.post("/chat", (req, res) => {
    const userMessage = req.body.message || "";
    const reply = getAnswer(userMessage);
    res.json({ reply });
  });

  app.listen(PORT, () =>
    console.log(`✅ Portfolio Chatbot running on port ${PORT}`)
  );

