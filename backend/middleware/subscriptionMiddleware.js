const Subscription = require('../models/Subscription');

module.exports = async function (req, res, next) {
    try {
        // req.user.id comes from authMiddleware, so this must be placed AFTER auth middleware
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const sub = await Subscription.findOne({
            userId: req.user.id,
            status: 'active',
            endDate: { $gt: new Date() }
        }).populate('planId');

        if (!sub) {
            return res.status(403).json({ msg: "Upgrade plan to access this feature" });
        }

        req.subscription = sub;
        req.plan = sub.planId;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error Checking Subscription");
    }
};
