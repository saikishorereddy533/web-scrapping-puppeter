const cosineDistance = require('cosine-distance');

// Query handler
async function queryHandler(query) {
  // Get the embeddings and links from VectorDB
  const results = await VectorDB.search({
    query: '*', // Search for all documents (links)
  });

  // Compute cosine similarity scores for each result
  const scores = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const embedding = result.embedding;
    const queryEmbedding = await getQueryEmbedding(query);
    const score = cosineDistance.cosineSimilarity(embedding, queryEmbedding);
    scores.push({ link: result.link, score });
  }

  // Get the top K most similar results
  const k = 5; // Adjust this value as needed
  const topKResults = scores.sort((a, b) => b.score - a.score).slice(0, k);

  // Return the links and texts for the top K results
  const responseLinksAndTexts = [];
  for (let i = 0; i < topKResults.length; i++) {
    const result = topKResults[i];
    const link = await VectorDB.getLink(result.link);
    const text = await VectorDB.getText(result.link);
    responseLinksAndTexts.push({ link, text });
  }

  return responseLinksAndTexts;
}

// Function to compute the query embedding
async function getQueryEmbedding(query) {
  // Compute the query embedding using a library like USE
  const use = require('@google/semantic-search-use');
  const model = use.load('use_en_small');
  return model.encode(query, { maxLength: 512 });
}
