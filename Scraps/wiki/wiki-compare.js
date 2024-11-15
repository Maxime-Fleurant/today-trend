const axios = require('axios');
const yargs = require('yargs');
const { getTopArticles } = require('./wiki-top.js');
const fs = require('fs');
const path = require('path');

const argv = yargs
    .option('date', {
        alias: 'd',
        description: 'Base date in YYYY-MM-DD format',
        type: 'string',
        required: true
    })
    .option('langs', {
        alias: 'l',
        description: 'Comma-separated language codes (e.g., en,es,fr)',
        type: 'string',
        required: true
    })
    .help()
    .alias('help', 'h')
    .argv;

async function getThreeMonthsData(baseDate, lang) {
    const dates = [];
    const [year, month, day] = baseDate.split('-').map(Number);
    
    for (let i = 0; i < 3; i++) {
        const date = new Date(year, month - 1 - i, day);
        dates.push(date.toISOString().split('T')[0]);
    }

    const results = await Promise.all(
        dates.map(date => getTopArticles(date, lang))
    );

    return {
        dates,
        results
    };
}

function findCommonArticles(data) {
    const titleSets = data.results.map(result => 
        new Set(result.map(article => article.title))
    );

    const commonTitles = [...titleSets[0]].filter(title => 
        titleSets[1].has(title) && titleSets[2].has(title)
    );

    return commonTitles.map(title => {
        const articles = data.results.map((monthResult, index) => 
            monthResult.find(article => article.title === title)
        );

        return {
            title,
            url: null, // Will be set later
            months: data.dates.map((date, index) => ({
                date,
                rank: articles[index].rank,
                views: articles[index].views
            }))
        };
    });
}

async function processLanguage(date, lang) {
    try {
        const data = await getThreeMonthsData(date, lang);
        const commonArticles = findCommonArticles(data);
        
        // Add URLs to articles
        commonArticles.forEach(article => {
            article.url = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(article.title)}`;
        });

        return {
            dates: data.dates,
            articles: commonArticles
        };
    } catch (error) {
        console.error(`Error processing language ${lang}:`, error.message);
        return null;
    }
}

async function main() {
    try {
        const languages = argv.langs.split(',').map(lang => lang.trim());
        const results = {};

        // Process each language
        for (const lang of languages) {
            console.log(`Processing ${lang}...`);
            const langResults = await processLanguage(argv.date, lang);
            if (langResults) {
                results[lang] = langResults;
            }
        }

        // Create output object
        const output = {
            base_date: argv.date,
            languages: results
        };

        // Write to file
        const fileName = `wiki_compare_${argv.date}.json`;
        const filePath = path.join(__dirname, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
        console.log(`\nResults written to ${fileName}`);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main(); 