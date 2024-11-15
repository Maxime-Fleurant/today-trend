// This script fetches SDG series data from the UN API based on provided series and area codes.
// Usage: node fetch-sdg-data.js <seriesCode> <geoAreaCode>

const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Change the current working directory to the directory of this file
process.chdir(path.dirname(__filename));

// Function to parse command line arguments
function parseArguments() {
    const args = process.argv.slice(2);
    // Ensure at least two arguments are provided
    if (args.length < 2) {
        console.error('Usage: node fetch-sdg-data.js <seriesCode> <geoAreaCode>');
        process.exit(1);
    }
    return {
        seriesCode: args[0], // First argument: series code
        geoAreaCode: args[1] // Second argument: geographic area code
    };
}

// Function to fetch SDG series data from the API
async function fetchSDGSeriesData({ seriesCode, geoAreaCode }) {
    const baseUrl = 'https://unstats.un.org/SDGAPI/v1/sdg/Series/Data'; // API endpoint

    try {
        // Fetch data from the API
        const response = await axios.get(baseUrl, {
            params: {
                seriesCode: seriesCode,
                areaCode: geoAreaCode,
                pageSize: 1000 // Limit the number of records fetched
            },
            headers: {
                'Accept': 'application/json' // Request JSON response
            }
        });

        // Validate the response format
        if (!response.data || !response.data.data) {
            console.error('Invalid response format:', response.data);
            return [];
        }

        // Map the response data to keep only the required fields
        return response.data.data.map(entry => {
            const dimensions = entry.dimensions || {};
            return {
                seriesCode: entry.seriesCode || seriesCode,
                geoAreaCode: entry.geoAreaCode || geoAreaCode,
                timePeriodStart: entry.timePeriod || entry.timePeriodStart,
                value: entry.value || null,
                age: dimensions.Age || null, // Include age from dimensions
                sex: dimensions.Sex || null,  // Include sex from dimensions
                location: dimensions.Location || null // Include location from dimensions
            };
        });
    } catch (error) {
        // Handle errors during the fetch
        console.error('Error fetching SDG data:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error; // Rethrow the error for further handling
    }
}

// Function to save fetched data to a JSON file
function saveDataToFile(data, filename) {
    try {
        // Write data to a file in JSON format
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Data saved to ${filename}`);
    } catch (error) {
        // Handle errors during file saving
        console.error('Error saving file:', error.message);
        throw error; // Rethrow the error for further handling
    }
}

// Main function to execute the script
async function main() {
    try {
        const params = parseArguments(); // Get parameters from CLI
        console.log('Fetching data with parameters:', params);

        const data = await fetchSDGSeriesData(params); // Fetch the data
        
        // Check if any data was found
        if (data.length === 0) {
            console.log('No data found for the specified parameters');
        } else {
            console.log(`Found ${data.length} records`);
            console.log('Sample data:', data[0]); // Log a sample of the fetched data
        }

        // Save the fetched data to a JSON file
        saveDataToFile(data, 'sdg_series_data.json');
    } catch (error) {
        // Handle errors during the main execution
        console.error('Failed to fetch or save data:', error);
        process.exit(1); // Exit with an error code
    }
}

// Execute the main function
main();