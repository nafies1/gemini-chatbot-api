# Gemini Flash API

This project provides a simple Express.js server to interact with the Google Gemini API. It supports text, image, and audio-based generation.

## Setup

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Create a `.env` file** in the root of the project and add your Gemini API key:

    ```
    GEMINI_API_KEY=your-api-key
    ```

3.  **Start the server:**

    ```bash
    npm start
    ```

## API Endpoints

### 1. Generate Text

- **URL:** `/generate-text`
- **Method:** `POST`
- **Body:**

  ```json
  {
    "prompt": "Your text prompt here"
  }
  ```

- **Success Response:**

  ```json
  {
    "result": "Generated text from Gemini"
  }
  ```

### 2. Generate From Image

- **URL:** `/generate-from-image`
- **Method:** `POST`
- **Form Data:**
  - `prompt` (text): Your text prompt
  - `image` (file): The image file
- **Success Response:**

  ```json
  {
    "result": "Generated text from Gemini based on the image"
  }
  ```

### 3. Generate From Audio

- **URL:** `/generate-from-audio`
- **Method:** `POST`
- **Form Data:**
  - `prompt` (text): Your text prompt (optional, defaults to "Transkrip audio berikut:")
  - `audio` (file): The audio file
- **Success Response:**

  ```json
  {
    "result": "Generated text from Gemini based on the audio"
  }
  ```

### 4. Generate From Document

- **URL:** `/generate-from-document`
- **Method:** `POST`
- **Form Data:**
  - `prompt` (text): Your text prompt (optional, defaults to "Ringkas dokumen berikut:")
  - `document` (file): The document file
- **Success Response:**

  ```json
  {
    "result": "Generated text from Gemini based on the document"
  }
  ```
