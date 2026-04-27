const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: "test" });
async function run() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'hello',
        });
        console.log(response.text);
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}
run();
