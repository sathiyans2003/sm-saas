const express = require('express');
const router = express.Router();
const Broadcast = require('../models/Broadcast');
const Contact = require('../models/Contact');
const Segment = require('../models/Segment');
const auth = require('../middleware/authMiddleware');
const checkSubscription = require('../middleware/subscriptionMiddleware');

/* ============================
   GET ALL BROADCASTS
============================ */
/* ============================
   GET ALL BROADCASTS
   - Protected: Needs Auth
============================ */
router.get('/', auth, async (req, res) => {
    try {
        // In a real app, filter by req.user.workspaceId
        const broadcasts = await Broadcast.find().sort({ createdAt: -1 });
        res.json(broadcasts);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch broadcasts' });
    }
});

/* ============================
   CALCULATE AUDIENCE SIZE
============================ */
router.post('/audience-count', async (req, res) => {
    try {
        const { audienceType, tags } = req.body;
        let count = 0;

        if (audienceType === 'ALL') {
            count = await Contact.countDocuments({});
        } else if (audienceType === 'TAG' && tags && tags.length > 0) {
            count = await Contact.countDocuments({ tags: { $in: tags } });
        } else if (audienceType === 'SEGMENT' && tags && tags.length > 0) {
            const segment = await Segment.findById(tags[0]);
            if (segment) count = await Contact.countDocuments(segment.criteria);
        } else if (audienceType === 'IMPORT' && tags && tags.length > 0) {
            count = await Contact.countDocuments({ importId: tags[0] });
        }

        res.json({ count });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to calculate audience' });
    }
});

/* ============================
   CREATE BROADCAST
============================ */
/* ============================
   CREATE BROADCAST
   - Protected: Needs Auth + Active Subscription
============================ */
router.post('/', [auth, checkSubscription], async (req, res) => {
    try {
        const { name, audienceType, audienceTags, templateName, messageBody } = req.body;

        // 1. Calculate final target count (snapshot)
        let targetCount = 0;
        if (audienceType === 'ALL') {
            targetCount = await Contact.countDocuments({});
        } else if (audienceType === 'TAG' && audienceTags && audienceTags.length > 0) {
            targetCount = await Contact.countDocuments({ tags: { $in: audienceTags } });
        } else if (audienceType === 'SEGMENT' && audienceTags && audienceTags.length > 0) {
            const segment = await Segment.findById(audienceTags[0]);
            if (segment) targetCount = await Contact.countDocuments(segment.criteria);
        } else if (audienceType === 'IMPORT' && audienceTags && audienceTags.length > 0) {
            targetCount = await Contact.countDocuments({ importId: audienceTags[0] });
        }

        // Mock Category & Cost
        const categories = ['Marketing', 'Utility', 'Authentication'];
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        // Mock Cost: Marketing=0.8, Utility=0.3, Auth=0.1
        const costPerMsg = randomCat === 'Marketing' ? 0.8 : (randomCat === 'Utility' ? 0.3 : 0.1);
        const estimatedCost = (targetCount * costPerMsg).toFixed(2);

        // 2. Create Broadcast Record
        const newBroadcast = new Broadcast({
            name,
            audienceType,
            audienceTags,
            templateName,
            templateCategory: randomCat, // Assign random category for demo
            messageBody,
            targetCount,
            cost: Number(estimatedCost),
            total: targetCount, // Total to send
            status: 'Processing' // Simulating immediate start
        });

        await newBroadcast.save();

        // 🔗 Simulating Async Sending Process (Mock Updates)
        // In production, this would be a background job (BullMQ / Agenda)
        (async () => {
            // Mock progress after 5 seconds
            setTimeout(async () => {
                newBroadcast.status = 'Sent';
                newBroadcast.sent = Math.floor(targetCount * 0.9);
                newBroadcast.delivered = Math.floor(targetCount * 0.85);
                newBroadcast.read = Math.floor(targetCount * 0.6);
                newBroadcast.failed = targetCount - newBroadcast.sent;
                await newBroadcast.save();
            }, 5000);
        })();

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to create broadcast' });
    }
});

/* ============================
   GET SINGLE BROADCAST
============================ */
router.get('/:id', async (req, res) => {
    try {
        const broadcast = await Broadcast.findById(req.params.id);
        if (!broadcast) return res.status(404).json({ msg: 'Broadcast not found' });
        res.json(broadcast);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to fetch broadcast' });
    }
});

/* ============================
   GET BROADCAST LOGS (Delivery Reports)
============================ */
router.get('/:id/logs', async (req, res) => {
    try {
        const MessageLog = require('../models/MessageLog');
        // Retrieve logs associated with this broadcast ID
        const logs = await MessageLog.find({ broadcastId: req.params.id })
            .populate('contactId', 'phone name')
            .sort({ timestamp: -1 });

        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to fetch logs' });
    }
});

module.exports = router;
