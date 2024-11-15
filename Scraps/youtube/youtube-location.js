require('dotenv').config();
const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

async function findVideosByLocation(date, latitude, longitude, radiusKm) {
  try {
    // Validate inputs
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD');
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radius = parseInt(radiusKm, 10);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error('Invalid latitude. Must be between -90 and 90');
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      throw new Error('Invalid longitude. Must be between -180 and 180');
    }
    if (isNaN(radius) || radius <= 0) {
      throw new Error('Invalid radius. Must be a positive number');
    }

    // Set up date range
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Search for videos with broader criteria
    const searchResponse = await youtube.search.list({
      part: ['id', 'snippet'],
      type: 'video',
      order: 'viewCount',
      maxResults: 50,
      publishedAfter: startDate.toISOString(),
      publishedBefore: endDate.toISOString(),
      location: `${lat},${lng}`,
      locationRadius: `${radius}km`,
      q: '', // Empty query to get all videos
      safeSearch: 'none',
      videoEmbeddable: true,
      fields: 'items(id(videoId),snippet(channelTitle,title))'
    });

    if (!searchResponse.data.items?.length) {
      // If no results, try without location restriction
      console.log(`No videos found with location. Trying without location filter...`);
      const fallbackResponse = await youtube.search.list({
        part: ['id', 'snippet'],
        type: 'video',
        order: 'viewCount',
        maxResults: 50,
        publishedAfter: startDate.toISOString(),
        publishedBefore: endDate.toISOString(),
        q: `near:"${lat},${lng}"`, // Use location as search term
        safeSearch: 'none',
        videoEmbeddable: true,
        fields: 'items(id(videoId),snippet(channelTitle,title))'
      });
      
      if (!fallbackResponse.data.items?.length) {
        console.log(`No videos found for ${date} near location (${lat}, ${lng})`);
        return;
      }
      searchResponse.data.items = fallbackResponse.data.items;
    }

    // Get video details
    const videoIds = searchResponse.data.items.map(item => item.id.videoId);
    const videoDetails = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: videoIds,
      fields: 'items(id,snippet(title,channelTitle,publishedAt),statistics(viewCount,likeCount))'
    });

    // Find top 5 most viewed videos
    const videos = videoDetails.data.items
      .filter(video => video?.statistics?.viewCount)
      .sort((a, b) => Number(b.statistics.viewCount) - Number(a.statistics.viewCount))
      .slice(0, 5);

    if (!videos.length) {
      console.log(`No videos found for ${date} near location (${lat}, ${lng})`);
      return;
    }

    // Display results
    console.log(`Top 5 most viewed videos created on ${date} near (${lat}, ${lng}):\n`);
    
    videos.forEach((video, index) => {
      const publishedAt = new Date(video.snippet.publishedAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      console.log(`${index + 1}. ${video.snippet.title}`);
      console.log(`   Channel: ${video.snippet.channelTitle}`);
      console.log(`   Created: ${publishedAt}`);
      console.log(`   Views: ${Number(video.statistics.viewCount).toLocaleString()}`);
      console.log(`   Likes: ${Number(video.statistics.likeCount).toLocaleString()}`);
      console.log(`   URL: https://youtube.com/watch?v=${video.id}`);
      console.log(); // Empty line between videos
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data.error.message);
    }
  }
}

// Command line handling
const args = process.argv.slice(2);
if (args.length !== 4) {
  console.log('Usage: node youtube-location.js YYYY-MM-DD LATITUDE LONGITUDE RADIUS_KM');
  console.log('Example: node youtube-location.js 2024-01-20 48.8584 2.2945 10');
  console.log('\nSome example coordinates:');
  console.log('Paris:     48.8584, 2.2945');
  console.log('New York:  40.7128, -74.0060');
  console.log('Tokyo:     35.6762, 139.6503');
  console.log('London:    51.5074, -0.1278');
  process.exit(1);
}

const [date, latitude, longitude, radius] = args;
findVideosByLocation(date, latitude, longitude, radius); 