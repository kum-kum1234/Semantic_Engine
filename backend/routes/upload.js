import express from "express";
import multer from "multer";
import { createRequire } from "module";
import Document from "../models/Document.js";
import { createEmbedding } from "../utils/embed.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); 

const router = express.Router();

// Allow bigger PDFs
const upload = multer({ 
  limits: { fileSize: 50 * 1024 * 1024 } 
}); 

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("🧹 Deleting old stored documents...");
    await Document.deleteMany({});   // ⭐ IMPORTANT: clears previous PDF data

    console.log("📄 Processing file:", req.file.originalname);
    console.log("📏 File size:", (req.file.size / (1024 * 1024)).toFixed(2), "MB");

    const fileBuffer = req.file.buffer;

    // Extract text
    const data = await pdfParse(fileBuffer);
    const text = data.text ? data.text.trim() : "";

    if (!text) {
      return res.status(400).json({ error: "PDF has no readable text" });
    }

    // Split into chunks
    const rawChunks = text.split(/\n+/);

    const chunks = rawChunks
     .map(chunk => chunk.trim())
     .filter(chunk => chunk.length > 80);  // ignore tiny garbage chunks
    console.log(`✂ Splitting into ${chunks.length} chunks...`);

    // Store chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const embedding = await createEmbedding(chunk);

      await Document.create({
        title: req.file.originalname,
        content: chunk,
        embedding: embedding
      });

      if (i % 10 === 0) {
        console.log(`⏳ Progress: ${i}/${chunks.length} chunks stored`);
      }
    }

    console.log("✅ All chunks successfully stored in MongoDB");
    res.json({ message: "Document uploaded & stored successfully" });

  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Upload failed. Check server logs." });
  }
});

export default router;