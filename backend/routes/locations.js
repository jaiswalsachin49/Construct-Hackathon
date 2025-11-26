const express = require('express');
const router = express.Router();
const axios = require('axios');

// Search for locations
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
            {
                headers: {
                    'User-Agent': 'SkillSwap-App/1.0'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Location search error:', error);
        res.status(500).json({ error: 'Failed to search locations' });
    }
});

// Reverse geocode coordinates
router.get('/reverse', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            {
                headers: {
                    'User-Agent': 'SkillSwap-App/1.0'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        res.status(500).json({ error: 'Failed to reverse geocode' });
    }
});

module.exports = router;
