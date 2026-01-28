require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

async function checkModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        console.log('Available Models:');
        response.data.models.forEach(m => console.log(m.name));
    } catch (e) {
        console.error('Error listing models:', e.response ? e.response.data : e.message);
    }
}

checkModels();
