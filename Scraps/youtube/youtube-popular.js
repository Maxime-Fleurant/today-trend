require('dotenv').config();
const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

async function findMostViewedVideos(date, languageCode) {
  try {
    // Validate inputs
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD');
    }
    if (!/^[a-z]{2}$/.test(languageCode.toLowerCase())) {
      throw new Error('Invalid language code. Please use ISO 639-1 format (e.g., en, fr, es)');
    }

    // Set up date range
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Search for videos with rectangular projection filter
    const searchResponse = await youtube.search.list({
      part: ['id'],
      type: 'video',
      relevanceLanguage: languageCode.toLowerCase(),
      order: 'viewCount',
      maxResults: 50,
      publishedAfter: startDate.toISOString(),
      publishedBefore: endDate.toISOString(),
      videoProjection: 'rectangular',
      fields: 'items(id(videoId))'
    });

    if (!searchResponse.data.items?.length) {
      console.log(`No videos found for ${date} in ${languageCode}`);
      return;
    }

    // Get video details
    const videoIds = searchResponse.data.items.map(item => item.id.videoId);
    const videoDetails = await youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: videoIds
    });

    // Filter by duration and store results
    const filteredVideos = videoDetails.data.items
      .filter(video => {
        const duration = video.contentDetails.duration;
        const durationInSeconds = parseDuration(duration);
        return durationInSeconds >= 120;  // Minimum duration of 2 minutes
      })
      .slice(0, 5);  // Limit to top 5 results

    if (!filteredVideos.length) {
      console.log(`No videos found for ${date} in ${languageCode}`);
      return;
    }

    // Display results
    console.log(`Top 5 most viewed rectangular videos in ${languageCode} created on ${date}:\n`);
    
    filteredVideos.forEach(video => {
      console.log(`${video.snippet.title}`);
      console.log(`   URL: https://youtube.com/watch?v=${video.id}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data.error.message);
    }
  }
}

// Helper function to parse ISO 8601 duration to seconds
function parseDuration(duration) {
  if (!duration) return 0;
  
  try {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = (match[1] ? parseInt(match[1], 10) : 0);
    const minutes = (match[2] ? parseInt(match[2], 10) : 0);
    const seconds = (match[3] ? parseInt(match[3], 10) : 0);
    
    return hours * 3600 + minutes * 60 + seconds;
  } catch (error) {
    console.error('Error parsing duration:', duration);
    return 0;
  }
}

// Command line handling
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Usage: node youtube-popular.js YYYY-MM-DD LANGUAGE_CODE');
  console.log('Example: node youtube-popular.js 2024-01-20 fr');
  process.exit(1);
}

const [date, languageCode] = args;
findMostViewedVideos(date, languageCode.toLowerCase());