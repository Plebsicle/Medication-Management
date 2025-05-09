import express from 'express';
import axios from 'axios';
import { createClient } from 'redis';

const router = express.Router();

interface Hospital {
    id: number;
    name: string | null;
    address: string | null;
    postcode: string | null;
    googleMapsLink: string;
}

const cache_expiration = 3600;
const redisClient = createClient();
redisClient.on('error', (err : any) => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

router.post('/', async (req, res) => {
    const { latitude, longitude, radius } = req.body;

    if (!latitude || !longitude || !radius) {
        res.status(400).json({
            message: "Latitude, longitude, and radius are required fields.",
        });
        return;
    }
    const cacheKey = `hospitals:${latitude}:${longitude}`;
    const query = `
        [out:json];
        node["amenity"="hospital"](around:${radius},${latitude},${longitude});
        out;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log("Serving From Cache:", cachedData);
            try {
                const parsedData = JSON.parse(cachedData);
                res.status(200).json({hospitals : parsedData});
            } catch (error) {
                console.error("Error parsing cached data:", error);
                res.status(500).json({ message: "Error parsing cached data." });
            }
            return;
        }

        const response = await axios.get(url);
        if (!response) {
            console.log("Error Fetching Data");
            return;
        }
        const data: any = response.data;

        const hospitals: Hospital[] = data.elements.map((element: any) => {
            const name = element.tags?.name || null;
            const address = element.tags?.['addr:full'] || null;
            const postcode = element.tags?.['addr:postcode'] || null;
            const query = encodeURIComponent(`${name || ""} ${address || ""}`);
            const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${query}`;

            return {
                id: element.id,
                name,
                address,
                postcode,
                googleMapsLink,
            };
        });

        if (hospitals.length === 0) {
            res.status(200).json({
                message: "No hospitals found near the specified location.",
                hospitals: [],
            });
            return;
        }

        await redisClient.setEx(cacheKey, cache_expiration, JSON.stringify(hospitals));
        res.status(200).json({
            message: "Hospitals fetched successfully.",
            hospitals,
        });
    } catch (error: any) {
        console.error("Error fetching hospitals:", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

export default router;