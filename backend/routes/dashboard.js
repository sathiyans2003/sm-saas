const express = require('express');
const router = express.Router();
const Broadcast = require('../models/Broadcast');

/* ==========================================
   GET DASHBOARD ANALYTICS
   Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
========================================== */
router.get('/metrics', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Date Filter
        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const broadcasts = await Broadcast.find(query);

        // 1. Overall Stats (Cards)
        const stats = {
            sent: 0,
            delivered: 0,
            read: 0,
            failed: 0,
            cost: 0,
            received: 0 // Mocked for now as we don't have inbound logic yet
        };

        // 2. Cost Analysis (Bar Chart)
        const costByType = {
            Marketing: 0,
            Utility: 0,
            Authentication: 0
        };

        // 3. Template Type Distribution (Donut Chart)
        const countByType = {
            Marketing: 0,
            Utility: 0,
            Authentication: 0
        };

        // 4. Daily Trends (Line Chart)
        const dailyData = {};

        broadcasts.forEach(b => {
            // Card Stats
            stats.sent += b.sent;
            stats.delivered += b.delivered;
            stats.read += b.read;
            stats.failed += b.failed;
            stats.cost += (b.cost || 0);

            // Breakdown Stats
            const cat = b.templateCategory || 'Marketing';
            if (costByType[cat] !== undefined) costByType[cat] += (b.cost || 0);
            if (countByType[cat] !== undefined) countByType[cat] += b.sent; // Counting sent messages

            // Daily Trends
            const dateKey = new Date(b.createdAt).toISOString().split('T')[0];
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { date: dateKey, sent: 0, delivered: 0, read: 0 };
            }
            dailyData[dateKey].sent += b.sent;
            dailyData[dateKey].delivered += b.delivered;
            dailyData[dateKey].read += b.read;
        });

        // Fill missing dates if needed (optional optimization)

        const analytics = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({
            stats,
            costBreakdown: [
                { name: 'Marketing', value: costByType.Marketing },
                { name: 'Utility', value: costByType.Utility },
                { name: 'Auth', value: costByType.Authentication }
            ],
            typeDistribution: [
                { name: 'Marketing', value: countByType.Marketing, color: '#007bff' },
                { name: 'Utility', value: countByType.Utility, color: '#fd7e14' },
                { name: 'Auth', value: countByType.Authentication, color: '#28a745' }
            ],
            analytics
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to fetch dashboard metrics' });
    }
});

module.exports = router;
