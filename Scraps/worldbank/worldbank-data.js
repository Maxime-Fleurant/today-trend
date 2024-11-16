/**
 * World Bank Data Fetcher
 * 
 * This script fetches specified indicators data for a specified country 
 * from the World Bank API and writes the response to a JSON file.
 * 
 * Usage:
 *   node worldbank-data.js -c <country_code> -i <indicator_codes>
 * 
 * Example:
 *   node worldbank-data.js -c US -i NY.GDP.MKTP.CD,SP.POP.TOTL
 * 
 * The output will be saved to 'output.json'.
 */

const axios = require('axios'); // Import axios for making HTTP requests
const yargs = require('yargs'); // Import yargs for command line argument parsing
const fs = require('fs'); // Import fs for file system operations

// Parse command line arguments
const argv = yargs
    .option('country', {
        alias: 'c',
        description: 'Country code (e.g., US, GB, FR)',
        type: 'string',
        demandOption: true // Country code is required
    })
    .option('indicators', {
        alias: 'i',
        description: 'Comma-separated indicator codes',
        type: 'string',
        demandOption: true // Indicator codes are required
    })
    .help() // Show help information
    .alias('help', 'h') // Alias for help
    .argv;

// Function to fetch data from the World Bank API
async function fetchWorldBankData(countryCode, indicators) {
    const outputFile = 'output.json'; // Set a generic output file name
    try {
        // Format the URL with parameters
        const baseUrl = 'http://api.worldbank.org/v2/country';
        const url = `${baseUrl}/${countryCode}/indicator/${indicators}`;
        
        // Make the API request
        const response = await axios.get(url, {
            params: {
                format: 'json', // Request JSON format
                per_page: 10000 // Set per page limit to 10000
            }
        });

        // Check if we got valid data
        if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
            throw new Error('Invalid response from World Bank API');
        }

        // Filter out results with null value
        const filteredData = response.data[1].filter(item => item.value !== null);

        // Write the filtered JSON response to a file
        fs.writeFileSync(outputFile, JSON.stringify(filteredData, null, 2));
        console.log(`Data written to ${outputFile}`);

    } catch (error) {
        // Handle errors
        console.error('Error fetching data:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        process.exit(1); // Exit the process with an error code
    }
}

// Get the indicators and country from command line arguments
const countryCode = argv.country; // Country code from CLI
const indicators = argv.indicators; // Indicator codes from CLI

// Execute the fetch
fetchWorldBankData(countryCode, indicators); 