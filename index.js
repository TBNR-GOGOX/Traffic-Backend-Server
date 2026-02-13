const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "https://electramod.vercel.app"
}));

app.use(express.json());

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
