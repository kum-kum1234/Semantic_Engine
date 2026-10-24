import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  title: String,
  content: String,
  embedding: [Number],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Document", DocumentSchema);
