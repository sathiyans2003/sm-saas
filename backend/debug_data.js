const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const Tag = require('./models/Tag');
const Segment = require('./models/Segment');
const ImportHistory = require('./models/ImportHistory');
require('dotenv').config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zacxdb');
        console.log('Connected to DB');

        const contactCount = await Contact.countDocuments();
        console.log(`Contacts: ${contactCount}`);

        const tagCount = await Tag.countDocuments();
        console.log(`Tags: ${tagCount}`);

        const segmentCount = await Segment.countDocuments();
        console.log(`Segments: ${segmentCount}`);

        const importCount = await ImportHistory.countDocuments();
        console.log(`Imports: ${importCount}`);

        if (contactCount === 0) {
            console.log("⚠️ No contacts found! Creating a dummy contact...");
            await Contact.create({ name: "Mr. Test", phone: "1234567890" });
            console.log("Created 1 dummy contact.");
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
