# Chatbot Web App

A simple chatbot web application built with Node.js/Express for the backend and Vanilla JavaScript for the frontend. It leverages the Google Gemini API to generate AI responses and features a dynamic chat interface with typing animations and markdown rendering.

Try the demo [Gemini Chatbot Web App](https://gemini-chatbot-api-760237378769.us-central1.run.app/).

## Features

- Real-time chat interaction.
- AI-powered responses using Google Gemini API.
- Dynamic display of user and bot messages.
- "Thinking..." indicator and word-by-word typing animation for bot responses.
- Markdown rendering for rich bot messages (e.g., paragraphs, lists, code blocks).
- Robust error handling for API communication.
- Responsive UI with input disabling during bot processing.

## Technologies Used

- **Backend:** Node.js, Express.js, Google Gemini API.
- **Frontend:** Vanilla JavaScript, HTML, CSS, `marked.js` (for Markdown parsing), `DOMPurify.js` (for HTML sanitization).

## Setup and Installation

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd gemini-chatbot-api
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Google Gemini API:**
    - Ensure your backend is configured with your Google Gemini API key (e.g., via environment variables).
    - Refer to your backend's `README.md` or configuration files for specific instructions.
4.  **Start the backend server:**
    ```bash
    npm start
    ```
    The backend should now be running, typically on `http://localhost:3000`.

### Frontend Setup

The frontend is served statically from the `public` directory.

1.  **HTML Structure (`public/index.html`):**
    Ensure your `index.html` has the following basic structure, including the CDN links for `marked.js` and `DOMPurify.js` which are essential for markdown rendering and sanitization:

    ```html
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Gemini Chatbot</title>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <div id="chat-container">
          <div id="chat-box"></div>
          <form id="chat-form">
            <input
              type="text"
              id="user-input"
              placeholder="Type your message..."
              autocomplete="off"
            />
            <button type="submit">Send</button>
          </form>
        </div>
        <!-- Include marked.js and DOMPurify.js for Markdown rendering and sanitization -->
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"></script>
        <!-- Your main frontend script -->
        <script src="script.js"></script>
      </body>
    </html>
    ```

2.  **Frontend Logic (`public/script.js`):**
    The `script.js` file handles all user interactions, API calls, and DOM manipulations. It sends user messages to the backend, displays bot responses with typing animation, and renders markdown.

3.  **Styling (`public/style.css`):**
    The `style.css` file defines the visual appearance of the chatbot. It uses BEM-like class names for messages (`chat-box__message`, `chat-box__message--user`, `chat-box__message--bot`, `chat-box__message--thinking`, `chat-box__message--typing`) and ensures proper newline rendering with `white-space: pre-wrap`.

## Usage

1.  Ensure both the backend and frontend are running.
2.  Open your browser and navigate to `http://localhost:3000` (or wherever your frontend is served).
3.  Type your message in the input field and press "Send" or Enter.
4.  Observe the bot's "Thinking..." message, followed by its typed-out response.

## API Endpoints

The backend exposes the following endpoint:

- **`POST /api/chat`**
  - **Description:** Sends a user message to the AI and receives a generated response.
  - **Request Body (JSON):**
    ```json
    {
      "messages": [{ "role": "user", "content": "<user_message>" }]
    }
    ```
  - **Response Body (JSON):**
    ```json
    {
      "result": "<gemini_ai_response>"
    }
    ```
    The `gemini_ai_response` may contain markdown formatting.

```

```
