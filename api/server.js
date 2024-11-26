import express from "express";
import fetchAndUpdateResults from "../search.js";

const app = express();
const port = 3333;

app.use(express.static("."));
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/search", async (req, res) => {
    try {
        const results = await fetchAndUpdateResults(req.body);
        res.json(results);
    } catch (err) {
        console.error("Error in /search route:", err);
        res.status(500).json({
            error: "An error occurred",
            details: err.message,
        });
    }
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // Application specific logging, throwing an error, or other logic here
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}).on("error", (err) => {
    console.error("Error starting server:", err);
});

export default app;