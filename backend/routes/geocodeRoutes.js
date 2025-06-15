import express from "express";
import fetch from "node-fetch";
const router = express.Router();

// GET /api/geocode?address=...
router.get('/geocode', async (req, res) => {
  const address = req.query.address;
  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RealEstateApp/1.0 (contact@example.com)'
      }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      res.json({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error fetching location' });
  }
});

export default router;
