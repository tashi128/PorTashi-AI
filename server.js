import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load portfolio.txt once
function loadPortfolio() {
  const text = fs.readFileSync("portfolio.txt", "utf-8");
  const sections = {};
  let currentKey = null;

  text.split("\n").forEach(line => {
    if (line.trim() === "") return;

    if (line.includes(":")) {
      const [key, ...rest] = line.split(":");
      currentKey = key.trim().toLowerCase();
      sections[currentKey] = rest.join(":").trim() || "";
    } else if (currentKey) {
      sections[currentKey] += "\n" + line.trim();
    }
  });

  return sections;
}

const data = loadPortfolio();

// Chatbot logic
function getAnswer(message) {
  const msg = message.toLowerCase();

  // Greetings
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return `🌸 Hi there! I’m ${data.name}, a ${data.title}. You can ask me about my skills, projects, work experience, education, or contact details!`;
  }

  // Polite replies
  if (msg.includes("nice to meet you") || msg.includes("pleasure") || msg.includes("good to meet you")) {
    return "😊 The pleasure is mine! Feel free to explore my projects and experience.";
  }

  // Farewells
  if (msg.includes("bye") || msg.includes("goodbye") || msg.includes("see you")) {
    return "🌸 It was great chatting with you! Hope to connect again soon.";
  }

  // Skills (interactive shoutout)
  if (msg.includes("skill") && !msg.includes("soft")) {
    return `🛠 Technical Skills:\n- Node.js, Express, JavaScript, C, C++, Python\n- AI & LLM Skills:\n  - Prompt Engineering\n  - RAG (Retrieval-Augmented Generation)\n  - OpenAI/Gemini APIs\n\n✨ Soft Skills:\n- Communication & Presentation\n- Team Collaboration\n- Leadership & Mentoring\n- Problem-Solving\n- Adaptability\n- Time Management`;
  }

  if (msg.includes("soft skill") || msg.includes("strength")) {
    return `✨ Soft Skills:\n- Communication & Presentation\n- Team Collaboration\n- Leadership & Mentoring\n- Problem-Solving\n- Adaptability\n- Time Management\n\n🛠 Technical Skills:\n- Node.js, Express, JavaScript, C, C++, Python\n- AI & LLM Skills:\n  - Prompt Engineering\n  - RAG (Retrieval-Augmented Generation)\n  - OpenAI/Gemini APIs`;
  }

  // Portfolio-specific queries
  if (msg.includes("contact")) 
  return `
📬 Here’s how you can reach me:  
- ✉️ Email: <a href="mailto:saleemzartashia1@gmail.com">saleemzartashia1@gmail.com</a>  
- 💼 LinkedIn: <a href="https://www.linkedin.com/in/zartashia-s-66b723349/" target="_blank">linkedin.com/in/zartashia-s</a>  
- 🐙 GitHub: <a href="https://github.com/tashi128" target="_blank">github.com/tashi128</a>
  `;
  if (msg.includes("name")) return `🌸 My name is ${data.name}.`;
  if (msg.includes("title") || msg.includes("who are you")) return `💻 I am ${data.title}.`;
  if (msg.includes("intro") || msg.includes("about yourself") || msg.includes("summary")) return `✨ ${data.introduction}`;
  if (msg.includes("project")) return `📁 Projects:\n${data.projects}`;
  if (msg.includes("experience") || msg.includes("work") || msg.includes("job")) return `🏢 Work Experience:\n${data["work experience"]}`;
  if (msg.includes("education") || msg.includes("study")) return `🎓 Education:\n${data.education}`;
  if (msg.includes("contact") || msg.includes("email")) return `📧 Contact:\n${data.contact}`;

  // Links with clickable URLs
  if (msg.includes("linkedin")) {
    return `🔗 LinkedIn: <a href='https://www.linkedin.com/in/zartashia-s-66b723349/' target='_blank'>https://www.linkedin.com/in/zartashia-s-66b723349/</a>`;
  }

  if (msg.includes("github")) {
    return `🐱 GitHub: <a href='https://github.com/tashi128' target='_blank'>https://github.com/tashi128</a>`;
  }

  // Fallback for irrelevant questions
  return "❌ I can only answer questions related to Zartashia's portfolio, such as skills, projects, experience, education, and contact details. 🌸";
}

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Portashi AI Chatbot backend is running!");
});

// Chat endpoint
app.post("/chat", (req, res) => {
  const userMessage = req.body.message || "";
  const reply = getAnswer(userMessage);
  res.json({ reply });
});

app.listen(PORT, () => console.log(`✅ Portfolio Chatbot running on port ${PORT}`));
