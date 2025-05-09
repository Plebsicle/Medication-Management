"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const redis_1 = require("redis");
const router = express_1.default.Router();
const cache_expiration = 3600;
const redisClient = (0, redis_1.createClient)();
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const cachedData = yield redisClient.get(cacheKey);
        if (cachedData) {
            console.log("Serving From Cache:", cachedData);
            try {
                const parsedData = JSON.parse(cachedData);
                res.status(200).json({ hospitals: parsedData });
            }
            catch (error) {
                console.error("Error parsing cached data:", error);
                res.status(500).json({ message: "Error parsing cached data." });
            }
            return;
        }
        const response = yield axios_1.default.get(url);
        if (!response) {
            console.log("Error Fetching Data");
            return;
        }
        const data = response.data;
        const hospitals = data.elements.map((element) => {
            var _a, _b, _c;
            const name = ((_a = element.tags) === null || _a === void 0 ? void 0 : _a.name) || null;
            const address = ((_b = element.tags) === null || _b === void 0 ? void 0 : _b['addr:full']) || null;
            const postcode = ((_c = element.tags) === null || _c === void 0 ? void 0 : _c['addr:postcode']) || null;
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
        yield redisClient.setEx(cacheKey, cache_expiration, JSON.stringify(hospitals));
        res.status(200).json({
            message: "Hospitals fetched successfully.",
            hospitals,
        });
    }
    catch (error) {
        console.error("Error fetching hospitals:", error.message);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
}));
exports.default = router;
