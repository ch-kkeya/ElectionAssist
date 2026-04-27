const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Serve dummy data
app.get('/api/data', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'election_data.json'));
});

// Gemini Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
            return res.status(500).json({ error: "API Key is missing. Please add your actual Gemini API key to the .env file." });
        }

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        const systemInstruction = `You are a helpful, jargon-free Election Process Assistant. 
        Your ONLY purpose is to answer basic questions related to voting, elections, and civic duties.
        If a user asks a question that is NOT related to voting, elections, or civics, you MUST reply with: 
        "I'm sorry, I can only answer questions related to voting and elections."
        Keep your answers concise, easy to understand, and objective.
        Be gender, race and location neutral until the user specify the objectives.
        If you need to explain with an example by taking an existing thing, notify the user that only in example scenario`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2, // Low temperature for factual responses
            }
        });

        res.json({ reply: response.text });

    } catch (error) {
        console.error("Gemini API Error:", error);

        let errorMessage = "Sorry, I couldn't process your request right now. Please try again later.";
        // Give a more specific error if it's an API key issue from the SDK
        if (error.message && error.message.includes("API key not valid")) {
            errorMessage = "Invalid API Key. Please check your .env file and ensure your Gemini API key is correct.";
        }

        res.status(500).json({ error: errorMessage });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
