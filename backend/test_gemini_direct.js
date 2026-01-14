const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load env vars
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key present:', !!apiKey);

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello, acts as a plumber, are you available?");
        const response = await result.response;
        console.log('Gemini Response:', response.text());
        console.log('SUCCESS: Gemini API is working with gemini-2.0-flash!');
    } catch (error) {
        console.error('Gemini API Error:', error);
    }
}

run();
