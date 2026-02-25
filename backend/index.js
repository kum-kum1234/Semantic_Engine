import dotenv from "dotenv";
import dns from "node:dns"; 
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import uploadRoutes from "./routes/upload.js";
import searchRoutes from "./routes/search.js"; // 1. ADD THIS IMPORT
import askRoute from "./routes/ask.js";

dotenv.config(); 

dns.setServers(['8.8.8.8', '8.8.4.4']);
console.log("API KEY:", process.env.OPENAI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/ask", askRoute);

// ROUTES
app.use("/upload", uploadRoutes);
app.use("/search", searchRoutes); // 2. ADD THIS LINE (Fixes the 404 error)

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected Successfully"))
  .catch(err => {
    console.error("❌ Mongo Error:", err);
  });

// 3. OPTIONAL: Add a global error handler for Multer "File too large"
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Max limit is 50MB." });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});