const jwt = require('jsonwebtoken');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

module.exports = async function (req, res, next) {
    // 1. Get Workspace ID from Header
    const workspaceId = req.header('x-workspace-id');

    if (!workspaceId) {
        return res.status(400).json({ msg: 'Missing x-workspace-id header' });
    }

    try {
        // 2. Validate Workspace Exists
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ msg: 'Workspace not found' });
        }

        // 3. Validate User Access (req.user is set by authMiddleware)
        if (!req.user) {
            return res.status(401).json({ msg: 'User not authenticated' });
        }

        // Check if user is in the team
        const isMember = workspace.team.some(member => member.user.toString() === req.user.id);
        const isOwner = workspace.owner.toString() === req.user.id;

        if (!isMember && !isOwner) {
            return res.status(403).json({ msg: 'Access denied to this workspace' });
        }

        // 4. Attach Workspace to Request
        req.workspace = workspace;

        // 5. Attach User Role within this Workspace
        if (isOwner) {
            req.user.workspaceRole = 'Owner';
        } else {
            const member = workspace.team.find(m => m.user.toString() === req.user.id);
            req.user.workspaceRole = member.role;
        }

        next();
    } catch (err) {
        console.error('Workspace Middleware Error:', err.message);
        res.status(500).send('Server Error');
    }
};
