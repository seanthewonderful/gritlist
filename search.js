import fs from "fs";
import { getJson } from "serpapi";

// Path to the configuration file
const configPath = "config.json";

// Function to read the current configuration from the configuration file
const getConfig = () => {
    let config = {
        start: 0,
        searchString: "",
        googleMapsLocation: "@40.6267738,-111.8731843,11.17z",
    }; // default values
    try {
        const configData = fs.readFileSync(configPath, "utf8");
        config = JSON.parse(configData);
    } catch (error) {
        console.error("Error reading configuration:", error);
    }
    return config;
};

// Function to save the updated start parameter to the configuration file
const saveStartParameter = (start) => {
    let config = getConfig();
    config.start = start;
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
        console.log("Start parameter updated to:", start);
    } catch (error) {
        console.error("Error saving start parameter:", error);
    }
};

// Function to fetch and process results
const fetchAndUpdateResults = async (configObj) => {
    // const config = getConfig();
    const { start, searchString, googleMapsLocation } = configObj;

    const results = await getJson(
        {
            api_key:
                "4ad7bba8837058d48cd5abe207ef610941e25c940f36090d15ff562a0a5b2822",
            engine: "google_maps",
            no_cache: "true",
            start: start.toString(),
            q: searchString,
            google_domain: "google.com",
            ll: googleMapsLocation,
            type: "search",
            hl: "en",
        }
    )
    const localResults = results.local_results;

    if (!localResults || localResults.length === 0) {
        console.log("No results found");
        return [];
    }
    const filteredResults = localResults
        .filter(
            (result) =>
                !result.website || result.website.includes("facebook")
        )
        .map((result) => ({
            title: result.title || "NO TITLE TRANSFERRED, CHECK CODE",
            searchString:
                searchString ||
                "NO SEARCHSTRING TRANSFERRED, CHECK CODE",
            maps_url:
                "https://www.google.com/maps/search/?api=1&query=Google&query_place_id=" +
                result.place_id,
            rating: result.rating || "N/A",
            reviews: result.reviews || "N/A",
            phone: result.phone || "N/A",
            website: result.website || "N/A",
            location:
                googleMapsLocation ||
                "NO LOCATION TRANSFERRED, CHECK CODE",
        }));

    // Read the current contents of results.json
    fs.readFile("results.json", "utf8", (err, data) => {
        let currentResults = [];
        if (!err) {
            try {
                currentResults = JSON.parse(data);
            } catch (e) {
                console.error("Error parsing existing JSON data", e);
            }
        }

        // Append the new results to the current results
        const updatedResults = currentResults.concat(filteredResults);

        // Write the updated results back to results.json
        fs.writeFile(
            "results.json",
            JSON.stringify(updatedResults, null, 2),
            (err) => {
                if (err) {
                    console.error("Error writing to file", err);
                } else {
                    console.log("Results updated in results.json");
                }
            }
        );
    });

    // Increment the start parameter by 20 and save it
    saveStartParameter(start + 20);

    return filteredResults;
};

export default fetchAndUpdateResults;