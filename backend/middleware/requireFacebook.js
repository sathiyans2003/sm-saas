const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || !user.facebook || !user.facebook.connected) {
            return res.status(403).json({
                code: 'FACEBOOK_NOT_CONNECTED',
                msg: 'Please connect your Facebook Page to continue.'
            });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
