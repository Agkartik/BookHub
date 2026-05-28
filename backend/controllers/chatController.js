import Book from "../models/Book.js";

// Spoiler-safe AI-like responses using keyword matching when no API key is present
const mockResponses = (query, chapterTitle, chapterContent, bookTitle) => {
  const q = query.toLowerCase();
  const words = chapterContent.split(/\s+/).slice(0, 600).join(" "); // first ~600 words for context

  if (q.includes("summarize") || q.includes("summary") || q.includes("what happened")) {
    const sentences = chapterContent.match(/[^.!?]+[.!?]+/g) || [];
    const summary = sentences.slice(0, 5).join(" ");
    return `📖 **Chapter Summary — "${chapterTitle}"**\n\n${summary}\n\n*This is a condensed overview of the chapter you're currently reading.*`;
  }

  if (q.includes("character") || q.includes("who is") || q.includes("who are")) {
    // Extract capitalized proper nouns as potential character names
    const properNouns = [...new Set((chapterContent.match(/\b[A-Z][a-z]{2,}\b/g) || []))].slice(0, 8);
    if (properNouns.length > 0) {
      return `👥 **Characters mentioned in this chapter:**\n\n${properNouns.map(n => `• **${n}**`).join("\n")}\n\n*These names appear in "${chapterTitle}". I can only discuss what you've read so far — no spoilers!*`;
    }
    return `👥 The characters in this chapter of *${bookTitle}* develop the story's core themes. Reread the chapter to spot all the key figures!`;
  }

  if (q.includes("theme") || q.includes("what is the book about") || q.includes("meaning")) {
    return `🎭 **Themes in "${chapterTitle}"**\n\nBased on what you've read so far, this chapter explores themes of conflict, discovery, and transformation. Great literature often rewards close reading — notice the subtle details in the narrative!`;
  }

  if (q.includes("explain") || q.includes("what does") || q.includes("what is")) {
    const excerpt = words.substring(0, 300);
    return `💡 **Context from "${chapterTitle}":**\n\n"${excerpt}..."\n\n*This passage may help clarify what you're asking about. Try rereading it carefully!*`;
  }

  if (q.includes("help") || q.includes("what can you")) {
    return `🤖 **I'm your AI Book Companion for *${bookTitle}*!**\n\nI can help you:\n• 📖 Summarize the current chapter\n• 👥 Identify characters mentioned so far\n• 🎭 Explore themes and meanings\n• 💡 Explain confusing passages\n• 🔍 Answer questions about what you've already read\n\n*Note: I won't spoil anything beyond your current chapter!*`;
  }

  // Default thoughtful fallback
  const sentences = chapterContent.match(/[^.!?]+[.!?]+/g) || [];
  const relevantSentence = sentences.find(s => s.toLowerCase().split(" ").some(w => q.split(" ").includes(w))) || sentences[0] || "";
  return `🔍 **Regarding "${chapterTitle}":**\n\n${relevantSentence}\n\n*I found this relevant passage. For deeper discussion, try asking me to "summarize" the chapter or ask about specific characters!*`;
};

// POST /api/chat/:bookId
export const chatWithBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { question, chapterIndex } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ message: "Please ask a question" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const chapIdx = Number(chapterIndex) || 0;
    const chapter = book.chapters?.[chapIdx] || { title: "Introduction", content: book.description || "" };

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (GEMINI_API_KEY) {
      // Use Gemini API
      try {
        const systemPrompt = `You are a helpful, spoiler-free AI book companion for the book "${book.title}" by ${book.author}. 
The reader is currently on Chapter ${chapIdx + 1}: "${chapter.title}".
You MUST ONLY discuss content from chapters 1 through ${chapIdx + 1}. Do NOT reveal anything about future chapters.
Current chapter content (for context): ${chapter.content.substring(0, 2000)}
Be concise, friendly, and insightful. Use markdown formatting.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nReader's question: ${question}` }] }],
              generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
            })
          }
        );
        const data = await response.json();
        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) {
          return res.json({ answer, source: "gemini" });
        }
      } catch (geminiErr) {
        console.error("Gemini API error, falling back to mock:", geminiErr.message);
      }
    }

    // Fallback: intelligent mock response
    const answer = mockResponses(question, chapter.title, chapter.content, book.title);
    res.json({ answer, source: "mock" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Chat failed" });
  }
};
