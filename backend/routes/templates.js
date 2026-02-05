const express = require('express');
const router = express.Router();
const MetaTemplate = require('../models/MetaTemplate');
const axios = require('axios');

// GET /api/templates - List templates (filtered by WABA)
router.get('/', async (req, res) => {
    try {
        const { wabaId } = req.query;
        const query = wabaId ? { wabaId } : {};
        const templates = await MetaTemplate.find(query).sort({ lastSyncedAt: -1 });
        res.json(templates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/templates/sync - Sync from Meta
router.post('/sync', async (req, res) => {
    try {
        const { wabaId } = req.body;
        // In a real app, we would fetch tokens from DB based on wabaId
        // For MVP/Demo, we might rely on env vars or mock data if credentials aren't set

        console.log(`Syncing templates for WABA: ${wabaId}`);

        // Mocking Meta API response for demonstration/development
        // Only if real API call fails or for immediate UI testing
        const mockTemplates = [
            {
                id: '123456789',
                name: 'startup_pongal_2026_thank_message',
                category: 'MARKETING',
                language: 'en_US',
                status: 'APPROVED',
                components: [
                    { type: 'BODY', text: 'Hello {{1}}, thank you for choosing us!' }
                ]
            },
            {
                id: '987654321',
                name: 'order_update_v2',
                category: 'UTILITY',
                language: 'ta_IN',
                status: 'APPROVED',
                components: [
                    { type: 'BODY', text: 'Your order {{1}} is out for delivery.' }
                ]
            }
        ];

        // START REAL SYNC LOGIC HERE (Simulated)
        // const response = await axios.get(`https://graph.facebook.com/v21.0/${wabaId}/message_templates`, { headers: ... });
        // const templates = response.data.data;

        const templatesToSave = mockTemplates; // Replace with real data

        for (const tpl of templatesToSave) {
            await MetaTemplate.findOneAndUpdate(
                { metaId: tpl.id },
                {
                    metaId: tpl.id,
                    wabaId: wabaId,
                    name: tpl.name,
                    category: tpl.category,
                    language: tpl.language,
                    status: tpl.status,
                    components: tpl.components,
                    lastSyncedAt: Date.now()
                },
                { upsert: true, new: true }
            );
        }

        res.json({ msg: 'Templates synced successfully', count: templatesToSave.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/templates - Create New Template
router.post('/', async (req, res) => {
    try {
        const { wabaId, name, category, language, components } = req.body;

        // 1. Send to Meta API
        console.log('Creating template on Meta:', req.body);

        // Mock success response from Meta
        const metaResponseId = 'NEW_TEMPLATE_' + Date.now();

        // 2. Save to Local DB
        const newTemplate = new MetaTemplate({
            metaId: metaResponseId,
            wabaId,
            name,
            category,
            language,
            status: 'PENDING', // Usually starts as pending/approved
            components
        });

        await newTemplate.save();

        res.json(newTemplate);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/templates/:id - Get Single Template
router.get('/:id', async (req, res) => {
    try {
        const template = await MetaTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ msg: 'Template not found' });
        res.json(template);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Template not found' });
        res.status(500).send('Server Error');
    }
});

module.exports = router;
