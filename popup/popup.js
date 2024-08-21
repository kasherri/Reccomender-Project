document.addEventListener('DOMContentLoaded', async () => {
    const currentTab = await getCurrentTab();

    // Fetch the list of visited links from the background script
    chrome.runtime.sendMessage({ type: 'getLinks' }, async (visitedLinks) => {
        // Get the current page's title and description from the content script
        chrome.tabs.sendMessage(currentTab.id, { type: 'getPageInfo' }, async (pageInfo) => {
            if (!pageInfo) {
                displayError('Could not retrieve page info.');
                return;
            }

            try {
                // Generate recommendations based on the visited links and the current page's info
                const recommendations = await getRecommendations(visitedLinks, pageInfo);

                // Display the recommendations in the popup
                displayRecommendations(recommendations);
            } catch (error) {
                console.error('Error generating recommendations:', error);
                displayError('An error occurred while generating recommendations.');
            }
        });
    });
});

/**
 * Get the current active tab in the Chrome window.
 * @returns {Promise<chrome.tabs.Tab>} - The current active tab.
 */
function getCurrentTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0]);
        });
    });
}

/**
 * Generate recommendations by comparing the embedding of the current page with those of visited links.
 * @param {Array} visitedLinks - The list of visited links with title and description metadata.
 * @param {Object} pageInfo - The current page's title and description.
 * @returns {Promise<Array>} - A list of recommended URLs.
 */
async function getRecommendations(visitedLinks, pageInfo) {
    const currentEmbedding = await getEmbedding(pageInfo.title + " " + pageInfo.description);

    const recommendations = [];

    for (const link of visitedLinks) {
        const linkEmbedding = await getEmbedding(link.title + " " + link.description);
        const similarity = cosineSimilarity(currentEmbedding, linkEmbedding);

        if (similarity > 0.8) { // Adjust the threshold for similarity as needed
            recommendations.push(link.url);
        }
    }

    return recommendations;
}

/**
 * Display the list of recommended links in the popup.
 * @param {Array} recommendations - The list of recommended URLs.
 */
function displayRecommendations(recommendations) {
    const linksContainer = document.getElementById('links');
    linksContainer.innerHTML = '';

    if (recommendations.length === 0) {
        linksContainer.textContent = 'No recommendations available.';
    } else {
        recommendations.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.href = link;
            linkElement.textContent = link;
            linkElement.target = '_blank';
            linksContainer.appendChild(linkElement);
            linksContainer.appendChild(document.createElement('br'));
        });
    }
}

/**
 * Display an error message in the popup.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    const linksContainer = document.getElementById('links');
    linksContainer.textContent = message;
}

/**
 * Calculate the cosine similarity between two embeddings.
 * @param {tf.Tensor} embedding1 - The first embedding tensor.
 * @param {tf.Tensor} embedding2 - The second embedding tensor.
 * @returns {number} - The cosine similarity score.
 */
function cosineSimilarity(embedding1, embedding2) {
    const dotProduct = tf.dot(embedding1, embedding2).dataSync();
    const norm1 = tf.norm(embedding1).dataSync();
    const norm2 = tf.norm(embedding2).dataSync();
    return dotProduct / (norm1 * norm2);
}
