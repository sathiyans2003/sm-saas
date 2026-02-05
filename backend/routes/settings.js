const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Workspace = require('../models/Workspace');

const auth = require('../middleware/authMiddleware'); // Import Auth Middleware

// Secure all routes
router.use(auth);

// Helper: Get Active Workspace (Respects x-workspace-id or defaults to first found)
const getWorkspace = async (req) => {
    const userId = req.user.id;
    const headerId = req.header('x-workspace-id');

    // 1. Try fetching specific workspace if ID provided
    if (headerId && headerId.match(/^[0-9a-fA-F]{24}$/)) {
        const ws = await Workspace.findOne({
            _id: headerId,
            $or: [{ owner: userId }, { 'team.user': userId }]
        });
        if (ws) return ws;
    }

    // 2. Fallback: Fetch first accessible workspace
    let ws = await Workspace.findOne({
        $or: [{ owner: userId }, { 'team.user': userId }]
    });

    // 3. Fallback: REMOVED auto-creation
    // If no workspace found, return null (caller must handle 404)
    if (!ws) {
        // throw new Error('No workspace found'); 
        return null;
    }
    return ws;
};

// GET List of All Workspaces (For Switcher)
router.get('/list', async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            $or: [{ owner: req.user.id }, { 'team.user': req.user.id }]
        }).select('name _id plan.type timezone'); // Lightweight list
        res.json(workspaces);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch workspaces' });
    }
});

const Subscription = require('../models/Subscription');
const PhoneNumber = require('../models/PhoneNumber');

// GET Workspace Settings
router.get('/', async (req, res) => {
    try {
        const ws = await getWorkspace(req);
        if (!ws) return res.status(404).json({ msg: 'No workspace found' });

        // Convert to object to append extra field
        const wsObj = ws.toObject();

        // Find current user's role
        const member = ws.team.find(m => m.user.toString() === req.user.id);
        wsObj.currentUserRole = member ? member.role : 'Viewer';

        // Fetch Subscription Status
        const sub = await Subscription.findOne({ userId: ws.owner }).sort({ createdAt: -1 });
        if (sub) {
            wsObj.subscription = {
                status: sub.status,
                endDate: sub.endDate,
                planId: sub.planId
            };

            // Check for implicit expiration
            if (sub.endDate && new Date(sub.endDate) < new Date()) {
                wsObj.subscription.status = 'expired';
            }
        }

        // Check WhatsApp Connection
        const phoneCount = await PhoneNumber.countDocuments({ workspaceId: ws._id });
        wsObj.whatsappConnected = phoneCount > 0;

        res.json(wsObj);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// CREATE New Workspace
router.post('/', async (req, res) => {
    try {
        console.log("Creating workspace for user:", req.user.id);
        console.log("Body:", req.body);
        const { name, timezone } = req.body;

        const newWorkspace = await Workspace.create({
            name: name || 'New Workspace',
            timezone: timezone || 'UTC',
            owner: req.user.id,
            team: [{ user: req.user.id, role: 'Owner', status: 'ACTIVE' }]
        });
        console.log("Workspace created:", newWorkspace._id);
        res.json(newWorkspace);
    } catch (err) {
        console.error("Workspace Creation Error:", err);
        res.status(500).json({ msg: 'Failed to create workspace', error: err.message });
    }
});

// UPDATE Workspace Settings (Name, Timezone)
router.put('/', async (req, res) => {
    try {
        const { name, timezone } = req.body;
        const ws = await getWorkspace(req);
        if (name) ws.name = name;
        if (timezone) ws.timezone = timezone;
        await ws.save();
        res.json(ws);
    } catch (err) {
        res.status(500).json({ msg: 'Update failed' });
    }
});

// === API KEYS ===

// Generate API Key
router.post('/api-keys', async (req, res) => {
    try {
        const ws = await getWorkspace(req);
        const newKey = {
            key: 'zacx_' + crypto.randomBytes(16).toString('hex'),
            createdAt: new Date()
        };
        ws.apiKeys.push(newKey);
        await ws.save();
        res.json(ws.apiKeys);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to generate key' });
    }
});

// Revoke API Key
router.delete('/api-keys/:id', async (req, res) => {
    try {
        const ws = await getWorkspace(req);
        ws.apiKeys = ws.apiKeys.filter(k => k._id.toString() !== req.params.id);
        await ws.save();
        res.json(ws.apiKeys);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to revoke key' });
    }
});

// === TEAM MEMBERS ===

// GET Team Members
router.get('/team', async (req, res) => {
    try {
        const ws = await getWorkspace(req);
        // Populate user details
        await ws.populate('team.user', 'name email avatar');
        res.json(ws.team);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to fetch team' });
    }
});

// UPDATE Team Member (Role or Status)
router.put('/team/:userId', async (req, res) => {
    try {
        const { role, status } = req.body;
        const ws = await getWorkspace(req);

        const memberIndex = ws.team.findIndex(m => m.user.toString() === req.params.userId);

        if (memberIndex === -1) {
            // If not in team (dev/mock), maybe add them? For now error.
            return res.status(404).json({ msg: 'Member not found in workspace' });
        }

        if (role) ws.team[memberIndex].role = role;
        if (status) ws.team[memberIndex].status = status;

        await ws.save();
        await ws.populate('team.user', 'name email avatar');
        res.json(ws.team);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to update member' });
    }
});

// DELETE Team Member (Remove from workspace)
router.delete('/team/:userId', async (req, res) => {
    try {
        const ws = await getWorkspace(req);

        // Filter out the member
        ws.team = ws.team.filter(m => m.user.toString() !== req.params.userId);

        await ws.save();
        await ws.populate('team.user', 'name email avatar');
        res.json(ws.team);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to remove member' });
    }
});

// INVITE (Mock for now, gives immediate access to a dummy user if needed or just placeholder)
const User = require('../models/User'); // Import User model

// INVITE (Real Logic: Create User if needed -> Add to Team)
router.post('/team/invite', async (req, res) => {
    try {
        const { phone, role } = req.body;
        const ws = await getWorkspace(req);

        // 1. Check if user exists by phone (using a dummy email format based on phone for now)
        // Since User model requires email/pass, we'll auto-gen them for the invited user.
        const dummyEmail = `${phone}@zacx-invite.com`;
        let user = await User.findOne({ email: dummyEmail });

        if (!user) {
            // Create new invited user
            user = new User({
                name: `User ${phone}`,
                email: dummyEmail,
                password: 'password123', // Default pass
                whatsappNumber: phone
            });
            await user.save();
        }

        // 2. Check if already in team
        const existingMember = ws.team.find(m => m.user.toString() === user._id.toString());
        if (existingMember) {
            return res.status(400).json({ msg: 'User already in team' });
        }

        // 3. Add to team
        ws.team.push({
            user: user._id,
            role: role || 'Editor',
            status: 'ACTIVE'
        });

        await ws.save();
        await ws.populate('team.user', 'name email avatar');

        res.json(ws.team);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error inviting user' });
    }
});

module.exports = router;
