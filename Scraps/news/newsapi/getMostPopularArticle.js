require('dotenv').config(); // Load environment variables from .env file
const NewsAPI = require('newsapi'); // Import the NewsAPI client
const newsapi = new NewsAPI(process.env.NEWS_API_KEY); // Initialize with the API key

async function getMostPopularArticle(country) {
    try {
        const response = await newsapi.v2.everything({
            q:"news",
            language: country, // Use the country code as the language parameter
            sortBy: 'popularity', // Sort articles by popularity
            pageSize: 1 // Limit to the most popular article
        });
        const articles = response.articles;

        if (articles.length > 0) {
            // Return the most popular article
            return articles[0];
        } else {
            return "No articles found.";
        }
    } catch (error) {
        return `Error: ${error.message}`; // Simplified error handling
    }
}

// Example usage
const countryCode = process.argv[2] || 'us'; // Get country code from CLI input or default to 'us'
getMostPopularArticle(countryCode).then(article => console.log(article)); 