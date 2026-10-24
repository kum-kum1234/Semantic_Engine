import { pipeline } from "@xenova/transformers";

let embedder;

// load model once
async function loadModel() {
  if (!embedder) {
    console.log("Loading embedding model...");
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("Model loaded successfully");
  }
}

export async function createEmbedding(text) {
  await loadModel();

  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}
