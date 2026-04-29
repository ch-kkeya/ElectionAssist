process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../server');

// Mock the Gemini SDK
jest.mock('@google/genai', () => {
    return {
        GoogleGenAI: jest.fn().mockImplementation(() => {
            return {
                models: {
                    generateContent: jest.fn().mockResolvedValue({
                        text: "Mocked AI Response"
                    })
                }
            };
        })
    };
});

describe('Election Assistant API Endpoints', () => {
    
    test('GET /api/data should return election data', async () => {
        const response = await request(app).get('/api/data');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('details');
    });

    test('POST /api/chat should return an AI reply', async () => {
        const response = await request(app)
            .post('/api/chat')
            .send({ message: 'How do I vote?' });
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('reply');
        expect(response.body.reply).toBe('Mocked AI Response');
    });

    test('POST /api/chat should return 400 if message is missing', async () => {
        const response = await request(app)
            .post('/api/chat')
            .send({});
        
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    test('POST /api/chat should return 400 if message is too long', async () => {
        const longMessage = 'a'.repeat(501);
        const response = await request(app)
            .post('/api/chat')
            .send({ message: longMessage });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain('too long');
    });

    test('Security headers should be present', async () => {
        const response = await request(app).get('/api/data');
        expect(response.headers).toHaveProperty('x-content-type-options');
        expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
});
