const express = require('express');
const router = express.Router();
const ImportHistory = require('../models/ImportHistory');

// GET ALL IMPORTS
router.get('/', async (req, res) => {
    try {
        const imports = await ImportHistory.find().sort({ createdAt: -1 });
        res.json(imports);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch imports' });
    }
});

module.exports = router;
