const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');
const fs = require('fs');

// Load the scraped text from the file
const scrapedText = fs.readFileSync('scraped_text.txt', 'utf-8');
const comparisonText = "This is a sample text to compare with the scraped content.";

async function generateEmbeddings() {
  const model = await use.load();
  
  const [scrapedEmbedding, comparisonEmbedding] = await Promise.all([
    model.embed(scrapedText),
    model.embed(comparisonText)
  ]);

  return { scrapedEmbedding, comparisonEmbedding };
}

function cosineSimilarity(a, b) {
  const dotProduct = a.dot(b).arraySync();
  const normA = a.norm().arraySync();
  const normB = b.norm().arraySync();

  return dotProduct / (normA * normB);
}

generateEmbeddings().then(({ scrapedEmbedding, comparisonEmbedding }) => {
  const similarity = cosineSimilarity(scrapedEmbedding, comparisonEmbedding);
  console.log("Cosine Similarity:", similarity);
}).catch(error => console.error(error));
