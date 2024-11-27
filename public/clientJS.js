let allResults = [];
let currentStart = 0;

function addToResults(newResults) {
    let resultsArr = JSON.parse(sessionStorage.getItem("allResults"));
    resultsArr = resultsArr.concat(newResults);
    sessionStorage.setItem("allResults", JSON.stringify(resultsArr));
}

document
    .getElementById("searchForm")
    .addEventListener("submit", function (e) {
        e.preventDefault();
        currentStart = parseInt(
            document.getElementById("startNumber").value
        );
        searchAndDisplay();
    });

function searchAndDisplay() {
    // const apiKey = document.getElementById("apiKey").value;
    const searchString =
        document.getElementById("searchString").value;
    const googleMapsLocation =
        document.getElementById("googleMapsLocation").value;

    const config = {
        // apiKey: apiKey,
        start: currentStart,
        searchString: searchString,
        googleMapsLocation: googleMapsLocation,
    };

    axios
        .post("/api/search", config)
        .then(function (response) {
            if (!response || !response.data || response.data.length === 0) {
                alert("No results returned - press 'Search' again. Sometimes Google Maps returns no results even when there are more results.");
                return;
            }
            allResults = allResults.concat(response.data);
            displayResults(allResults);
            currentStart += 20;
            document.getElementById("startNumber").value =
                currentStart;

            if (response.data.length === 20) {
                searchAndDisplay(); // Continue searching if we got 20 results
            } else {
                document.getElementById(
                    "downloadButton"
                ).style.display = "block";
            }
        })
        .catch(function (error) {
            console.error("Error:", error);
            document.getElementById("errorMessage").textContent =
                "Error: " + error.response.data.details;
        });
}

function displayResults(newResults) {
    const resultsDiv = document.getElementById("results");
    if (
        currentStart ===
        parseInt(document.getElementById("startNumber").value)
    ) {
        // First set of results, add the header
        resultsDiv.innerHTML = "<h2>Results:</h2>";
    }

    // Create table for new results
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Create table header
    const headerRow = document.createElement("tr");
    const headers = [
        "Title",
        "Search String",
        "Maps URL",
        "Rating",
        "Reviews",
        "Phone",
        "Website",
        "Location",
    ];
    headers.forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    newResults.forEach((result) => {
        const row = document.createElement("tr");
        [
            result.title,
            result.searchString,
            result.maps_url,
            result.rating,
            result.reviews,
            result.phone,
            result.website,
            result.location,
        ].forEach((cellText) => {
            const td = document.createElement("td");
            if (cellText === result.maps_url) {
                const a = document.createElement("a");
                a.href = cellText;
                a.textContent = "View on Maps";
                a.target = "_blank";
                td.appendChild(a);
            } else {
                td.textContent = cellText;
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Create a new div for this set of results
    const newResultsDiv = document.createElement("div");
    newResultsDiv.innerHTML = `<h3>New Results (Start: ${currentStart}):</h3>`;
    newResultsDiv.appendChild(table);

    // Append the new results to the main results div
    resultsDiv.appendChild(newResultsDiv);
}

document
    .getElementById("downloadButton")
    .addEventListener("click", function () {
        // Convert allResults to CSV
        const csvContent = convertToCSV(allResults);

        // Create a Blob with the CSV content
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        // Create a download link
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "results.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

function convertToCSV(objArray) {
    const array =
        typeof objArray !== "object"
            ? JSON.parse(objArray)
            : objArray;
    let str =
        "Title,Search String,Maps URL,Rating,Reviews,Phone,Website,Location\r\n";

    for (let i = 0; i < array.length; i++) {
        let line = "";
        for (let index in array[i]) {
            if (line !== "") line += ",";
            let cell =
                array[i][index] === null
                    ? ""
                    : array[i][index].toString();
            cell = cell.replace(/"/g, '""'); // Escape double quotes
            if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`; // Wrap in double quotes if contains comma, newline or double quote
            }
            line += cell;
        }
        str += line + "\r\n";
    }
    return str;
}