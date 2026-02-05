const crypto = require('crypto');
require('dotenv').config();

const verifyWhatsAppSignature = (req, res, next) => {
    // 1. Get Signature from Header
    const signature = req.headers['x-hub-signature-256'];

    if (!signature) {
        console.warn('Webhook Signature Missing');
        // For strict security, reject. For now, warn (or user can toggle STRICT_MODE in .env)
        return res.status(401).json({ error: 'Signature missing' });
    }

    // 2. Get Raw Body (Must replace bodyParser or verify stream)
    // Note: In Express, req.body is already parsed JSON. 
    // We need the raw buffer for HMAC. 
    // So in server.js, we must use: express.json({ verify: (req,res,buf) => { req.rawBody = buf } })

    if (!req.rawBody) {
        console.error('Raw Body not available for signature verification. Check server.js config.');
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    const appSecret = process.env.META_APP_SECRET;

    if (!appSecret) {
        console.error('META_APP_SECRET not defined in .env');
        return res.status(500).json({ error: 'Server Config Error' });
    }

    // 3. Calculate HMAC
    const hash = crypto.createHmac('sha256', appSecret).update(req.rawBody).digest('hex');
    const expectedSignature = `sha256=${hash}`;

    // 4. Compare
    if (signature !== expectedSignature) {
        console.warn(`Invalid Signature! Expected: ${expectedSignature}, Got: ${signature}`);
        return res.status(403).json({ error: 'Invalid Signature' });
    }

    next();
};

module.exports = verifyWhatsAppSignature;
