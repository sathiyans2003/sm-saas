// E:\zacx\backend\server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const tagsRoutes = require('./routes/tags');
const broadcastsRoutes = require('./routes/broadcasts');
const segmentsRoutes = require('./routes/segments');
const importsRoutes = require('./routes/imports');

require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};
connectDB();

// Init Middleware
const { helmet, apiLimiter, broadcastLimiter } = require('./middleware/security');

app.use(helmet()); // Secure HTTP headers
app.use('/api/', apiLimiter); // Global Rate Limit
app.use('/api/broadcasts', broadcastLimiter); // Specific limit for broadcasts

// Raw Body for Webhooks (needed for HMAC)
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/broadcasts', broadcastsRoutes);
console.log('Mounting /api/broadcasts...');
app.use('/api/segments', segmentsRoutes);
app.use('/api/imports', importsRoutes);
app.use('/api/workspaces', require('./routes/workspaces'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/profile', require('./routes/profile')); // New Profile Routes
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/facebook', require('./routes/facebook'));
app.use('/uploads', express.static('public/uploads'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/protected', require('./routes/protected')); // Example protected route

// Simple test route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));