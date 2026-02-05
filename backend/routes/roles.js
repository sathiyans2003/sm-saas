const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const Workspace = require('../models/Workspace');
const auth = require('../middleware/authMiddleware'); // Assuming we have this

// Helper: Get Workspace (Mock for MVP, real would be from user context)
const getWorkspace = async () => {
    return await Workspace.findOne();
};

// @route   GET api/roles
// @desc    Get all roles for the workspace
router.get('/', async (req, res) => {
    try {
        const ws = await getWorkspace();
        if (!ws) return res.status(404).json({ msg: 'Workspace not found' });

        const roles = await Role.find({ workspace: ws._id });
        res.json(roles);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/roles
// @desc    Create a new role
router.post('/', async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const ws = await getWorkspace();

        if (!ws) {
            // Create default workspace if missing (Dev/Mock helper)
            const newWs = new Workspace({ name: 'My Workspace', plan: 'free' });
            await newWs.save();
            // Retry
            return res.status(400).json({ msg: 'Workspace initialization required. Please try again.' });
        }

        const existingRole = await Role.findOne({ workspace: ws._id, name });
        if (existingRole) {
            return res.status(400).json({ msg: 'Role with this name already exists' });
        }

        const role = new Role({
            workspace: ws._id,
            name,
            description,
            permissions
        });

        await role.save();
        res.json(role);
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Role name must be unique' });
        }
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// @route   PUT api/roles/:id
// @desc    Update logic (permissions or details)
router.put('/:id', async (req, res) => {
    try {
        const { name, description, permissions, status } = req.body;

        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).json({ msg: 'Role not found' });

        if (name) role.name = name;
        if (description) role.description = description;
        if (status) role.status = status;
        if (permissions) role.permissions = permissions;

        await role.save();
        res.json(role);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/roles/:id
// @desc    Soft delete (Deactivate) or Hard Delete
router.delete('/:id', async (req, res) => {
    try {
        await Role.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Role removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
