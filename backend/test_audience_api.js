const axios = require('axios');
const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const Tag = require('./models/Tag');
require('dotenv').config();

const testApi = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zacxdb');
        console.log('Connected to DB');

        // 1. Get Tag
        let tag = await Tag.findOne();
        if (!tag) {
            console.log('No tags found. Creating one...');
            tag = await Tag.create({ name: 'api-test-tag', color: '#00ff00' });
        }
        console.log(`Using Tag: ${tag.name} (${tag._id})`);

        // 2. Ensure Contact has Tag
        let contact = await Contact.findOne({ tags: tag._id });
        if (!contact) {
            console.log('No contact with this tag. Assigning to a contact...');
            contact = await Contact.findOne();
            if (!contact) {
                contact = await Contact.create({ name: 'API Tester', phone: '1112223333' });
            }
            contact.tags.push(tag._id);
            await contact.save();
            console.log('Assigned tag to contact');
        } else {
            console.log('Found contact with this tag.');
        }

        // 3. Call API
        const payload = {
            audienceType: 'TAG',
            tags: [tag._id.toString()]
        };

        console.log('Sending payload:', JSON.stringify(payload));

        try {
            const res = await axios.post('http://localhost:5000/api/broadcasts/audience-count', payload);
            console.log('API Response:', res.data);
        } catch (apiErr) {
            console.error('API Error:', apiErr.message);
            if (apiErr.response) {
                console.error('Status:', apiErr.response.status);
                console.error('Data:', apiErr.response.data);
            }
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testApi();
