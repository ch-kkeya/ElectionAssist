# Election Process Assistant 🗳️

An interactive, AI-powered web application designed to guide citizens through the election process. It features an interactive timeline, a personalized voting checklist, and a Gemini-powered conversational assistant to answer any civic questions.

## Features ✨

*   **Eligibility Verification Wizard**: A simple upfront flow to confirm voter eligibility (with a Guest mode for non-eligible users to browse information).
*   **Interactive Election Journey**: A scrollable timeline showing the 5 key phases of an election (Registration, Nominations, Campaigning, Polling Day, Results).
*   **AI Voting Assistant**: A conversational AI powered by Google's Gemini 2.5 Flash, strictly programmed to answer questions related to voting and civic duties.
*   **Personal Voter Checklist**: A persistent checklist to track personal voting progress. Note: Checklist functionality is disabled for users browsing in Guest mode.
*   **Fully Responsive & Accessible**: Built with Tailwind CSS and modern web design principles.

## Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   A [Google Gemini API Key](https://aistudio.google.com/)

## Getting Started 🚀

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone https://github.com/ch-kkeya/ElectionAssist.git
    cd ElectionAssist
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    *   Open the `.env` file in the root directory.
    *   Replace the placeholder with your actual Gemini API key:
        ```env
        GEMINI_API_KEY=your_actual_api_key_here
        ```

4.  **Run the application**:
    ```bash
    npm start
    ```

5.  **View the app**:
    Open your browser and navigate to `http://localhost:3000`.

## Deployment Ready 🐳

This project includes a `Dockerfile` and is completely ready for containerized deployment on platforms like Render, Railway, AWS, or Google Cloud Run.

To build and run with Docker locally:

```bash
docker build -t election-assistant .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_actual_api_key_here election-assistant
```

## Technologies Used

*   **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS, Marked.js (for markdown parsing)
*   **Backend**: Node.js, Express.js
*   **AI Integration**: `@google/genai` SDK
*   **Containerization**: Docker
