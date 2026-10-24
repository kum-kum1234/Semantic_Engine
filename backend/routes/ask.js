import express from "express";
import Document from "../models/Document.js";
import { createEmbedding } from "../utils/embed.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    console.log("🧠 Question:", question);

    // 1️⃣ Create embedding for question
    const queryEmbedding = await createEmbedding(question);

    // 2️⃣ Find most relevant chunks
    const matches = await Document.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 5
        }
      },
      {
        $project: {
          _id: 0,
          content: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    console.log(`📊 Found ${matches.length} matches`);

    if (!matches.length) {
      return res.json({
        success: false,
        answer: "No relevant information found in documents."
      });
    }

    // 3️⃣ Generate simple answer from top chunks
    const combinedText = matches.map(m => m.content).join("\n\n");

    res.json({
      success: true,
      answer: combinedText
    });

  } catch (error) {
    console.error("❌ Ask error:", error);
    res.status(500).json({ error: "Ask failed" });
  }
});

export default router;
