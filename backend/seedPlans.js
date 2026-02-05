const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plan = require('./models/Plan');

dotenv.config();

const plans = [
    {
        name: "Starter",
        price: 999,
        duration: 30,
        features: ["Basic Support", "5 Projects", "1GB Storage"]
    },
    {
        name: "Pro",
        price: 2499,
        duration: 30,
        features: ["Priority Support", "Unlimited Projects", "10GB Storage", "Analytics"]
    },
    {
        name: "Agency",
        price: 4999,
        duration: 30,
        features: ["Dedicated Support", "Unlimited Projects", "Unlimited Storage", "White Label"]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Check if plans exist
        const count = await Plan.countDocuments();
        if (count === 0) {
            await Plan.insertMany(plans);
            console.log('Plans seeded!');
        } else {
            console.log('Plans already exist, skipping seed.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
