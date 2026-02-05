const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* GET RAZORPAY KEY (Public or Protected) */
router.get('/config/key', (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

/* GET PLANS */
router.get('/plans', async (req, res) => {
    try {
        const plans = await Plan.find();
        res.json(plans);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

/* CREATE ORDER */
router.post('/create-order', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        // In a real app, you might want to validate amount against planId

        const options = {
            amount: amount * 100, // INR -> paise
            currency: 'INR',
            receipt: 'zacx_' + Date.now()
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating order");
    }
});

/* VERIFY PAYMENT */
router.post('/verify', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');

        if (expectedSign === razorpay_signature) {

            const plan = await Plan.findById(planId);
            if (!plan) {
                // If for some reason plan is missing, we still verify payment success, but fail subscription?
                // For now, let's error out or fallback.
                return res.status(400).json({ success: false, msg: 'Plan not found' });
            }

            // Calculate end date based on plan duration
            const startDate = new Date();
            // Default to 30 days if not specified
            const duration = plan.duration || 30;
            const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

            await Subscription.create({
                userId: req.user.id,
                planId: planId,
                startDate: startDate,
                endDate: endDate,
                paymentId: razorpay_payment_id,
                status: 'active'
            });

            return res.json({ success: true });
        }

        res.status(400).json({ success: false, msg: 'Invalid signature' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
});

module.exports = router;
