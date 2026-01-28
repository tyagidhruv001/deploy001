const fs = require('fs');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    let log = '';
    const logFile = 'test-ai-log.txt';
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const modelsToTry = [
            "gemini-flash-latest",
            "gemini-pro-latest",
            "gemini-2.0-flash",
            "gemini-1.5-flash"
        ];

        for (const modelName of modelsToTry) {
            log += `--- Testing model: ${modelName} ---\n`;
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                log += `Success with ${modelName}: ` + result.response.text() + '\n';
            } catch (e) {
                log += `Failed with ${modelName}: ` + e.message + '\n';
                if (e.message.includes('429')) {
                    log += `(This is a quota issue, not a model name issue)\n`;
                }
            }
        }

    } catch (globalError) {
        log += 'Global Error: ' + globalError.message + '\n';
    }
    fs.writeFileSync(logFile, log);
    console.log('Results written to', logFile);
}

listModels();
