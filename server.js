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

// Helper: convert URLs in text into clickable links
function linkify(text) {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, url => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

// Helper: format lists with emojis
function formatList(text, emoji = "•") {
  return text
    .split("\n")
    .filter(line => line.trim() !== "")
    .map(line => `${emoji} ${line.replace(/^[-*]\s*/, "")}`)
    .join("<br>");
}

// Helper: add section title with emoji
function formatSection(title, content, emoji = "🌸") {
  return `<strong>${emoji} ${title}:</strong><br>${content}`;
}

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
  if (msg.includes("name")) return formatSection("Name", linkify(data.name), "👤");
  if (msg.includes("title") || msg.includes("who are you")) return formatSection("Title", linkify(data.title), "🎓");
  if (msg.includes("intro") || msg.includes("about yourself") || msg.includes("summary"))
    return formatSection("Introduction", linkify(data.introduction), "👋");
  if (msg.includes("skill") && !msg.includes("soft"))
    return formatSection("Technical Skills", formatList(data["technical skills"], "💻"), "⚡");
  if (msg.includes("soft skill") || msg.includes("strength"))
    return formatSection("Soft Skills", formatList(data["soft skills"], "🌟"), "✨");
  if (msg.includes("project"))
    return formatSection("Projects", formatList(data.projects, "📂"), "🚀");
  if (msg.includes("experience") || msg.includes("work") || msg.includes("job"))
    return formatSection("Work Experience", formatList(data["work experience"], "💼"), "📊");
  if (msg.includes("education") || msg.includes("study"))
    return formatSection("Education", linkify(data.education), "🎓");
  if (msg.includes("contact") || msg.includes("email"))
    return formatSection("Contact", linkify(data.contact), "📬");

  // LinkedIn & GitHub clickable links
  if (msg.includes("linkedin")) {
    const link = data.contact.match(/LinkedIn: (.*)/i)?.[1] || "";
    return `🌐 <a href="https://${link}" target="_blank" rel="noopener noreferrer">My LinkedIn Profile</a>`;
  }

  if (msg.includes("github")) {
    const link = data.contact.match(/GitHub: (.*)/i)?.[1] || "";
    return `💻 <a href="https://${link}" target="_blank" rel="noopener noreferrer">My GitHub Repositories</a>`;
  }

  // Email clickable
  if (msg.includes("email") || msg.includes("mail")) {
    const email = data.contact.match(/Email: (.*)/i)?.[1] || "";
    return `📧 <a href="mailto:${email}">Send me an Email</a>`;
  }

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
