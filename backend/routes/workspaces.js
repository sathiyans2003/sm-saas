const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const workspaceAuth = require('../middleware/workspaceMiddleware');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// @route    GET api/workspaces
// @desc     Get all workspaces for current user
// @access   Private
router.get('/', auth, async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            $or: [
                { owner: req.user.id },
                { 'team.user': req.user.id }
            ]
        }).sort({ createdAt: -1 });
        res.json(workspaces);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/workspaces
// @desc     Create a new workspace
// @access   Private
router.post('/', auth, async (req, res) => {
    const { name } = req.body;
    try {
        const newWorkspace = new Workspace({
            name,
            owner: req.user.id,
            team: [{ user: req.user.id, role: 'Admin' }] // Default role for creator
        });

        const workspace = await newWorkspace.save();
        res.json(workspace);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/workspaces/:id
// @desc     Get workspace details
// @access   Private (with workspace validation)
router.get('/:id', [auth, workspaceAuth], async (req, res) => {
    // req.workspace is set by workspaceAuth
    res.json(req.workspace);
});

module.exports = router;
