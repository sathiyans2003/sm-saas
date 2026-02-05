// E:\zacx\backend\routes\protected.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Import our auth middleware

// @route    GET api/protected
// @desc     Test protected route
// @access   Private (requires token)
router.get('/', auth, (req, res) => {
    res.json({ msg: 'This is a protected route!', user: req.user });
});

module.exports = router;