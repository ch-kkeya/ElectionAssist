const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware
app.use(express.json());

// Manual CORS Implementation
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Security: Refined Helmet and CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "*.google.com", "*.googleapis.com", "*.gstatic.com", "*.google-analytics.com", "blob:"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "*.google.com", "*.googleapis.com", "*.gstatic.com"],
            imgSrc: ["'self'", "data:", "*.google.com", "*.googleapis.com", "*.gstatic.com", "*.google-analytics.com"],
            connectSrc: ["'self'", "*.google.com", "*.googleapis.com", "*.gstatic.com", "*.google-analytics.com"],
            frameSrc: ["'self'", "*.google.com", "*.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "*.google.com", "*.googleapis.com", "*.gstatic.com"],
        },
    },
}));

// Efficiency: Static file caching
app.use(express.static('public', {
    maxAge: '1d',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Rate limiting for AI endpoint
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});

// Serve dummy data
app.get('/api/data', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'election_data.json'));
});

// Gemini Chat Endpoint
app.post('/api/chat', chatLimiter, async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
            return res.status(500).json({ error: "API Key is missing. Please add your actual Gemini API key to the .env file." });
        }

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        // Security: Input length validation
        if (message.length > 500) {
            return res.status(400).json({ error: "Message is too long. Please keep it under 500 characters." });
        }

        const systemInstruction = `You are a helpful, jargon-free Election Process Assistant. 
        Your ONLY purpose is to answer basic questions related to voting, elections, and civic duties.
        If a user asks a question that is NOT related to voting, elections, or civics, you MUST reply with: 
        "I'm sorry, I can only answer questions related to voting and elections."
        Keep your answers concise, easy to understand, and objective.
        Be gender, race and location neutral until the user specify the objectives.
        If you need to explain with an example by taking an existing thing, notify the user that only in example scenario`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: message }] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
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

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
