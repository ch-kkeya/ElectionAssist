require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
    try {
        const response = await ai.models.list();
        console.log("Response:", JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}
run();
