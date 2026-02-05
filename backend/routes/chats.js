const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Contact = require('../models/Contact');
const MessageLog = require('../models/MessageLog');
const auth = require('../middleware/authMiddleware');
const workspaceAuth = require('../middleware/workspaceMiddleware');

// Apply Middleware to ALL routes
router.use(auth);
router.use(workspaceAuth); // Ensures req.workspace is set

// @route   GET api/chats
// @desc    Get all conversations for current workspace
router.get('/', async (req, res) => {
    try {
        const { status, agentId } = req.query;

        // Filter by Workspace
        const filter = { workspace: req.workspace._id };

        // Optional Filters
        if (status) filter.status = status; // OPEN, CLOSED
        if (agentId) filter.assigned_agent = agentId;

        const conversations = await Conversation.find(filter)
            .populate('contactId', 'name phone tags avatar') // Fetch contact details
            .populate('assigned_agent', 'name') // Fetch agent name
            .sort({ lastMessageTime: -1 });

        res.json(conversations);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/chats
// @desc    Start or Get a conversation with a contact
router.post('/', async (req, res) => {
    try {
        const { contactId } = req.body;

        if (!contactId) return res.status(400).json({ msg: 'Contact ID required' });

        // Check if conversation exists for this Contact + Workspace
        let conversation = await Conversation.findOne({
            contactId,
            workspace: req.workspace._id
        });

        if (!conversation) {
            conversation = new Conversation({
                workspace: req.workspace._id,
                contactId,
                lastMessage: 'Conversation started',
                lastMessageTime: new Date(),
                status: 'OPEN'
            });
            await conversation.save();
        }

        await conversation.populate('contactId');
        res.json(conversation);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/chats/:id
// @desc    Update conversation (Assign Agent, Change Status)
router.put('/:id', async (req, res) => {
    try {
        const { status, assigned_agent } = req.body;

        const conversation = await Conversation.findOne({
            _id: req.params.id,
            workspace: req.workspace._id
        });

        if (!conversation) return res.status(404).json({ msg: 'Conversation not found' });

        if (status) conversation.status = status;
        if (assigned_agent !== undefined) conversation.assigned_agent = assigned_agent; // Can be set to null

        await conversation.save();

        // Return populated for frontend update
        await conversation.populate('contactId');
        await conversation.populate('assigned_agent', 'name');

        res.json(conversation);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/chats/:id/messages
// @desc    Get messages for a conversation
router.get('/:id/messages', async (req, res) => {
    try {
        // Verify conversation belongs to workspace
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            workspace: req.workspace._id
        });

        if (!conversation) return res.status(404).json({ msg: 'Conversation not found' });

        const messages = await MessageLog.find({ conversationId: req.params.id })
            .sort({ timestamp: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/chats/:id/messages
// @desc    Send a message (Internal Mock for now)
router.post('/:id/messages', async (req, res) => {
    try {
        const { type, content } = req.body;
        const conversationId = req.params.id;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            workspace: req.workspace._id
        });

        if (!conversation) return res.status(404).json({ msg: 'Conversation not found' });

        // 1. Create Message
        const newMessage = new MessageLog({
            workspace: req.workspace._id,
            conversationId,
            contactId: conversation.contactId,
            direction: 'OUTBOUND',
            type: type || 'TEXT',
            content,
            status: 'SENT'
        });
        await newMessage.save();

        // 2. Update Conversation (Last Message)
        conversation.lastMessage = type === 'TEXT' ? content : 'Media Message';
        conversation.lastMessageTime = Date.now();
        // conversation.status = 'OPEN'; // Auto-reopen? Maybe.
        await conversation.save();

        res.json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
