#!/usr/bin/env node

/**
 * GDELT Article Fetcher
 * 
 * Fetches recent news articles from GDELT DOC API based on specified parameters
 * 
 * Usage:
 *   node gdelt-articles.js --country=<countryCode> [options]
 * 
 * Required:
 *   --country    Two-character FIPS country code (e.g., US, FR, GB)
 * 
 * Optional:
 *   --timespan   Time range to search (e.g., "1d", "1w", "1m")
 *   --theme      GDELT theme to filter by (e.g., "TERROR", "PROTEST")
 *   --sort       Sort method ("ToneDesc", "ToneAsc", "HybridRel")
 * 
 * Example:
 *   node gdelt-articles.js --country=FR --timespan=1w --theme=TERROR --sort=ToneDesc
 */

const axios = require('axios');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value;
  return acc;
}, {});

if (!args.country) {
  console.error('Error: --country parameter is required');
  process.exit(1);
}

async function fetchArticles() {
  try {
    // Build query string
    let query = `sourcecountry:${args.country.toLowerCase()}`;
    if (args.theme) {
      query += ` theme:${args.theme.toUpperCase()}`;
    }

    // Construct URL
    let url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}`;
    url += '&mode=artlist';
    url += '&format=json';
    url += '&maxrecords=10';
    
    if (args.timespan) {
      url += `&timespan=${args.timespan}`;
    }
    
    if (args.sort) {
      url += `&sort=${args.sort}`;
    }

    const response = await axios.get(url);
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error fetching articles:', error.message);
    process.exit(1);
  }
}

fetchArticles(); 