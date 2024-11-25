import fs from "fs";
import { parse } from "json2csv";


const outputFileName = "bigExport";

const generateTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${month}.${day}.${year}-${hours}.${minutes}.${seconds}`;
};

const timestamp = generateTimestamp();
// console.log(timestamp);

// Function to convert JSON file to CSV file
const jsonToCsv = (inputPath, outputPath) => {
    // Read the JSON file
    fs.readFile(inputPath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading JSON file:", err);
            return;
        }

        // Parse the JSON data
        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (e) {
            console.error("Error parsing JSON data:", e);
            return;
        }

        // Convert JSON data to CSV format
        let csv;
        try {
            csv = parse(jsonData);
        } catch (e) {
            console.error("Error converting JSON to CSV:", e);
            return;
        }

        // Write the CSV data to the output file
        fs.writeFile(outputPath, csv, "utf8", (err) => {
            if (err) {
                console.error("Error writing CSV file:", err);
            } else {
                console.log("CSV file created successfully at", outputPath);
            }
        });
    });
};

// Path to input JSON file and output CSV file
const inputJsonPath = "results.json";
const outputCsvPath = outputFileName
    ? outputFileName + ".csv"
    : timestamp + ".csv";

// Call the function to convert JSON to CSV
jsonToCsv(inputJsonPath, outputCsvPath);
