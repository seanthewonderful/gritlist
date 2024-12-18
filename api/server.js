console.log("Serverless function loaded");

import express from "express";
import fetchAndUpdateResults from "../public/search.js";
import path from "path";
import cors from "cors";

const port = 3333;
const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(cors());

app.post("/api/search", async (req, res) => {
    try {
        const results = await fetchAndUpdateResults(req.body);
        res.json(results);
    } catch (err) {
        console.error("Error in /search route:", err);
        res.status(500).json({
            error: "An error occurred",
            details: err,
        });
    }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default app;