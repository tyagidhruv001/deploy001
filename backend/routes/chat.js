const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { GoogleGenerativeAI } = require('@google/generative-ai');


// Initialize Gemini
// Ensure process.env.GEMINI_API_KEY is set in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST /api/chat
// @desc    Get a response from the AI worker
router.post('/', async (req, res) => {
    try {
        const { message, previousHistory, workerContext } = req.body;
        // previousHistory could be an array of { role: 'user'|'model', parts: [{ text: ... }] }

        // Default Worker Persona if not provided
        const workerName = workerContext?.name || 'Professional';
        const workerRole = workerContext?.role || 'Service Worker';
        const contextType = workerContext?.type || 'worker'; // 'worker' or 'platform_assistant'

        let systemInstruction;

        if (contextType === 'platform_assistant') {
            systemInstruction = {
                role: "user",
                parts: [{
                    text: `You are the KaryaSetu Platform Assistant. 
                    Your goal is to help customers use the platform, find workers, and manage their bookings.
                    
                    Platform Features:
                    - Booking services (Plumbing, Cleaning, Electrical, etc.)
                    - Tracking active jobs in real-time
                    - Wallet management (view balance, add money - coming soon)
                    - Viewing nearby verified workers on a map
                    
                    Be friendly, professional, and concise. Do not use markdown.
                    If asked about specific workers, guide them to the 'Nearby Workers' tab.
                    If asked about booking, guide them to the 'Book Service' tab.`
                }]
            };
        } else {
            systemInstruction = {
                role: "user",
                parts: [{
                    text: `You are ${workerName}, a professional ${workerRole} on the KaryaSetu platform. 
                    Be polite, helpful, and concise. 
                    You are texting a customer who has booked you or is inquiring about services.
                    Do not use markdown formatting like bold or headers in your SMS-style replies. Keep it plain text.`
                }]
            };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const history = (previousHistory && previousHistory.length > 0) ? previousHistory : [
            systemInstruction,
            {
                role: "model",
                parts: [{ text: contextType === 'platform_assistant' ? "Hello! I am the KaryaSetu Assistant. How can I help you today?" : "Understood. I will act as the professional worker." }],
            },
        ];

        const chat = model.startChat({ history });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Failed to generate response', details: error.message, fullError: error.toString() });
    }
});

// @route   POST /api/chat/p2p
// @desc    Send a P2P message
router.post('/p2p', async (req, res) => {
    try {
        const { bookingId, senderId, text, type } = req.body;

        if (!bookingId || !senderId || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const messageData = {
            senderId,
            text,
            type: type || 'text',
            timestamp: new Date().toISOString(),
            read: false
        };

        // Add to subcollection 'messages' inside the specific booking chat doc
        // Structure: chats/{bookingId}/messages/{messageId}
        await db.collection('chats').doc(bookingId).collection('messages').add(messageData);

        // Update last message and potentially participant details in parent doc
        const chatUpdate = {
            lastMessage: text,
            lastUpdated: new Date().toISOString(),
            bookingId: bookingId
        };

        // If sender details are provided (optional optimization from frontend)
        if (req.body.senderName) chatUpdate[`participants.${senderId}.name`] = req.body.senderName;
        if (req.body.senderPic) chatUpdate[`participants.${senderId}.pic`] = req.body.senderPic;

        await db.collection('chats').doc(bookingId).set(chatUpdate, { merge: true });

        res.status(201).json({ success: true, message: 'Message sent' });
    } catch (error) {
        console.error('P2P Chat Send Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/chat/p2p/:bookingId
// @desc    Get chat history for a booking
router.get('/p2p/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        const snapshot = await db.collection('chats').doc(bookingId).collection('messages')
            .orderBy('timestamp', 'asc')
            .get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        res.json(messages);
    } catch (error) {
        console.error('P2P Chat Fetch Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
