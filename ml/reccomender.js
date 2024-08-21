async function getRecommendations(visitedLinks, pageInfo) {
    const currentEmbedding = await getEmbedding(pageInfo.title + " " + pageInfo.description);

    const recommendations = [];
    for (const link of visitedLinks) {
        const linkEmbedding = await getEmbedding(link.title + " " + link.description);
        const similarity = cosineSimilarity(currentEmbedding, linkEmbedding);
        if (similarity > 0.8) {  // Arbitrary threshold for similarity
            recommendations.push(link.url);
        }
    }

    return recommendations;
}

function cosineSimilarity(embedding1, embedding2) {
    const dotProduct = tf.dot(embedding1, embedding2).dataSync();
    const norm1 = tf.norm(embedding1).dataSync();
    const norm2 = tf.norm(embedding2).dataSync();
    return dotProduct / (norm1 * norm2);
}
