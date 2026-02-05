const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/profiles';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // user_id_timestamp.ext to avoid caching issues and collisions
        // We can access req.user here if we use auth middleware before multer, 
        // BUT multer runs before body parsing might be tricky. 
        // Safer to use generic name and rename, or just unique ID.
        // Let's use unique ID + timestamp.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
});

// @route   POST api/profile/upload-photo
// @desc    Upload profile photo and update user record
// @access  Private
router.post('/upload-photo', auth, (req, res) => { // CHANGED: Wrapped in callback to handle multer errors
    upload.single('file')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ msg: 'File is too large. Max limit is 5MB.' });
            }
            return res.status(400).json({ msg: `Upload Error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ msg: err.message });
        }

        // Everything went fine.
        try {
            if (!req.file) {
                return res.status(400).json({ msg: 'No file uploaded' });
            }

            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;

            // UPDATE DATABASE - Single Source of Truth
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            user.profile_image = fileUrl;
            user.avatar = fileUrl;

            await user.save();

            res.json({
                success: true,
                profile_image: fileUrl
            });

        } catch (dbErr) {
            console.error(dbErr);
            res.status(500).send('Server Error');
        }
    });
});

module.exports = router;
