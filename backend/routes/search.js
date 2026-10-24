import express from "express";
import Document from "../models/Document.js";
import { createEmbedding } from "../utils/embed.js";

const router = express.Router();

// 🔍 SEARCH ROUTE
router.post("/", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Search query required" });
    }

    console.log("🔍 Searching for:", query);

    // create embedding from local model
    const queryEmbedding = await createEmbedding(query);

    // MongoDB Atlas vector search
    const results = await Document.aggregate([
      {
        $vectorSearch: {
               index: "vector_index",
               path: "embedding",
               queryVector: queryEmbedding,
               numCandidates: 1000,   // 🔥 increase search pool
               limit: 15             // 🔥 get more matches
},
      },
      {
  $addFields: {
    score: { $meta: "vectorSearchScore" }
  }
},
{
  $match: {
    score: { $gte: 0.55 }
     }   // 🔥 adjust 0.70–0.85
  },
      {
        $project: {
          _id: 0,
          title: 1,
          content: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    console.log(`📊 Found ${results.length} matches`);

    // return only search results (NO OPENAI)
    res.json({
      success: true,
      query: query,
      results: results
    });

  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
