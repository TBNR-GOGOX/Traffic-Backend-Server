const express = require("express");
const fetch = require("node-fetch");

const app = express();

// Manual CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// Increase Payload Limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const ROBOFLOW_KEY = process.env.ROBOFLOW_KEY;

app.post("/detect", async (req, res) => {
    const image = req.body.image;

    try {
        const response = await fetch(
            "https://serverless.roboflow.com/traffic-detection-avjqh/workflows/find-cars-trucks-vans-and-motorbikes",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: ROBOFLOW_KEY,
                    inputs: {
                        image: { type: "url", value: image }
                    }
                })
            }
        );

        const data = await response.json();

        res.json({
            annotated_image: data.outputs?.[0]?.image || "",
            predictions: data.outputs?.[0]?.predictions || []
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Detection failed" });
    }
});

app.listen(3000, () => {
    console.log("Server running");
});

