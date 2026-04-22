const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const serviceAccount = require('./serviceAccount.json');

// Firebase Admin initialize
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(bodyParser.json());

// Notification পাঠানোর API
app.post('/send-notification', async (req, res) => {
    const { receiverToken, senderName, message, senderPhone } = req.body;

    // সব তথ্য আছে কিনা চেক
    if (!receiverToken || !senderName || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'তথ্য অসম্পূর্ণ' 
        });
    }

    try {
        // FCM V1 দিয়ে notification পাঠান
        const response = await admin.messaging().send({
            token: receiverToken,
            android: {
                priority: 'high',
                notification: {
                    channelId: 'masschat_messages',
                    priority: 'max',
                    defaultSound: true,
                    defaultVibrateTimings: true,
                }
            },
            data: {
                senderName: senderName,
                body: message,
                senderPhone: senderPhone || '',
            },
            notification: {
                title: senderName,
                body: message,
            }
        });

        console.log('Notification পাঠানো হয়েছে:', senderName, '→', message);
        res.json({ success: true, messageId: response });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Server চালু আছে কিনা চেক করার জন্য
app.get('/', (req, res) => {
    res.json({ status: 'Mass Chat Server চালু আছে ✓' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server চালু হয়েছে: port ${PORT}`);
});