const fs = require('fs');
const csv = require('csv-parser');
const initSqlJs = require('sql.js');
const http = require('http');
const AdmZip = require('adm-zip');

async function downloadAndUnzip(url, outputPath) {
    console.log('Downloading file...');
    
    return new Promise((resolve, reject) => {
        const zipFile = fs.createWriteStream('temp.zip');
        
        http.get(url, (response) => {
            response.pipe(zipFile);
            
            zipFile.on('finish', () => {
                zipFile.close();
                console.log('Download completed');
                
                try {
                    console.log('Unzipping file...');
                    const zip = new AdmZip('temp.zip');
                    zip.extractAllTo(outputPath, true);
                    console.log('File unzipped');
                    
                    // Clean up zip file
                    fs.unlinkSync('temp.zip');
                    
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', (err) => {
            fs.unlinkSync('temp.zip');
            reject(err);
        });
    });
}

async function createDatabase(filename) {
    // Initialize SQL.js
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    // Create table with all GDELT columns
    db.run(`CREATE TABLE events (
        GlobalEventID INTEGER,
        Day INTEGER,
        MonthYear INTEGER,
        Year INTEGER,
        FractionDate REAL,
        Actor1Code TEXT,
        Actor1Name TEXT,
        Actor1CountryCode TEXT,
        Actor1KnownGroupCode TEXT,
        Actor1EthnicCode TEXT,
        Actor1Religion1Code TEXT,
        Actor1Religion2Code TEXT,
        Actor1Type1Code TEXT,
        Actor1Type2Code TEXT,
        Actor1Type3Code TEXT,
        Actor2Code TEXT,
        Actor2Name TEXT,
        Actor2CountryCode TEXT,
        Actor2KnownGroupCode TEXT,
        Actor2EthnicCode TEXT,
        Actor2Religion1Code TEXT,
        Actor2Religion2Code TEXT,
        Actor2Type1Code TEXT,
        Actor2Type2Code TEXT,
        Actor2Type3Code TEXT,
        IsRootEvent INTEGER,
        EventCode TEXT,
        EventBaseCode TEXT,
        EventRootCode TEXT,
        QuadClass INTEGER,
        GoldsteinScale REAL,
        NumMentions INTEGER,
        NumSources INTEGER,
        NumArticles INTEGER,
        AvgTone REAL,
        Actor1Geo_Type INTEGER,
        Actor1Geo_FullName TEXT,
        Actor1Geo_CountryCode TEXT,
        Actor1Geo_ADM1Code TEXT,
        Actor1Geo_ADM2Code TEXT,
        Actor1Geo_Lat REAL,
        Actor1Geo_Long REAL,
        Actor1Geo_FeatureID TEXT,
        Actor2Geo_Type INTEGER,
        Actor2Geo_FullName TEXT,
        Actor2Geo_CountryCode TEXT,
        Actor2Geo_ADM1Code TEXT,
        Actor2Geo_ADM2Code TEXT,
        Actor2Geo_Lat REAL,
        Actor2Geo_Long REAL,
        Actor2Geo_FeatureID TEXT,
        ActionGeo_Type INTEGER,
        ActionGeo_FullName TEXT,
        ActionGeo_CountryCode TEXT,
        ActionGeo_ADM1Code TEXT,
        ActionGeo_ADM2Code TEXT,
        ActionGeo_Lat REAL,
        ActionGeo_Long REAL,
        ActionGeo_FeatureID TEXT,
        DATEADDED INTEGER,
        SOURCEURL TEXT
    )`);

    // Prepare insert statement with 61 placeholders
    const stmt = db.prepare(`INSERT INTO events VALUES (
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?,?,?,?,?,?,?,?,?,?,
        ?
    )`);

    let rowCount = 0;
    
    // Read CSV and insert data
    return new Promise((resolve, reject) => {
        fs.createReadStream(filename)
            .pipe(csv({ 
                separator: '\t',
                headers: false
            }))
            .on('data', (row) => {
                try {
                    const values = Object.values(row);
                    stmt.run(values);
                    rowCount++;
                    if (rowCount % 1000 === 0) {
                        console.log(`Processed ${rowCount} rows`);
                    }
                } catch (err) {
                    console.error('Error inserting row:', err);
                    console.error('Row values:', values);
                    console.error('Number of values:', values.length);
                }
            })
            .on('end', () => {
                console.log(`Total rows processed: ${rowCount}`);
                stmt.free();
                
                const count = db.exec('SELECT COUNT(*) FROM events')[0].values[0][0];
                console.log(`Total rows in database: ${count}`);
                
                resolve(db);
            })
            .on('error', reject);
    });
}

async function exportToJson(outputFile = 'gdelt_events.json') {
    const url = 'http://data.gdeltproject.org/gdeltv2/20241116140000.export.CSV.zip';
    const csvFilename = '20241116140000.export.CSV';
    
    try {
        // Download and unzip file
        await downloadAndUnzip(url, './');
        
        console.log('Creating database...');
        const db = await createDatabase(csvFilename);
        
        console.log('Querying all data...');
        const results = db.exec('SELECT * FROM events');
        
        if (!results || results.length === 0) {
            console.log('No results found');
            return;
        }

        // Convert results to array of objects with column names
        const columns = results[0].columns;
        const data = results[0].values.map(row => {
            const obj = {};
            columns.forEach((col, index) => {
                obj[col] = row[index];
            });
            return obj;
        });

        // Write to file
        console.log('Writing to file...');
        fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
        console.log(`Data exported to ${outputFile}`);
        console.log(`Total records exported: ${data.length}`);

        // Clean up CSV file
        fs.unlinkSync(csvFilename);

    } catch (err) {
        console.error('Error:', err);
    }
}

// Run the export
exportToJson(); 