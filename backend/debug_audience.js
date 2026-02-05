const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const Tag = require('./models/Tag');
require('dotenv').config();

const testAudience = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zacxdb');
        console.log('Connected to DB');

        // 1. Get a Tag
        let tag = await Tag.findOne();
        if (!tag) {
            tag = await Tag.create({ name: 'tag 1', color: '#ff0000' });
            console.log('Created tag 1');
        } else {
            console.log(`Found tag: ${tag.name} (${tag._id})`);
        }

        // 2. Get a Contact
        let contact = await Contact.findOne();
        if (!contact) {
            contact = await Contact.create({ name: 'Test User', phone: '9999999999' });
            console.log('Created contact');
        }

        // 3. Assign Tag to Contact
        if (!contact.tags.includes(tag._id)) {
            contact.tags.push(tag._id);
            await contact.save();
            console.log('Assigned tag to contact');
        } else {
            console.log('Contact already has tag');
        }

        // 4. Test Query
        const count = await Contact.countDocuments({ tags: { $in: [tag._id.toString()] } });
        console.log(`Audience Count for Tag '${tag.name}': ${count}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testAudience();
