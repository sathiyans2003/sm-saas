const sendSMS = async (to, text) => {
    // This is a placeholder for SMS integration (Twilio, Gupshup, etc.)
    // For now, we will log the SMS to the console.

    console.log('================================================');
    console.log(`[MOCK SMS] To: ${to}`);
    console.log(`[MOCK SMS] Body: ${text}`);
    console.log('================================================');

    // Future integration example:
    // await twilioClient.messages.create({ ... });
};

module.exports = sendSMS;
