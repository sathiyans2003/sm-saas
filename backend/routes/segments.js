const express = require('express');
const router = express.Router();
const Segment = require('../models/Segment');

// GET ALL SEGMENTS
router.get('/', async (req, res) => {
    try {
        // In a real app, user would create these.
        // For now, if none exist, seed a dummy one so the UI is testable.
        const count = await Segment.countDocuments();
        if (count === 0) {
            await Segment.create({ name: 'High Value Customers', criteria: { tags: [] } });
            await Segment.create({ name: 'Chennai Region', criteria: { city: 'Chennai' } });
        }

        const segments = await Segment.find().sort({ createdAt: -1 });
        res.json(segments);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch segments' });
    }
});

module.exports = router;
