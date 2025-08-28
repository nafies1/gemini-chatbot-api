import 'dotenv/config';
import express from 'express'
import { GoogleGenAI } from '@google/genai'
import { extractText } from './util.js'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import specs from './swagger.js'

// __dirname fix for ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Set your default gemini model here
const GEMINI_MODEL = 'gemini-2.5-flash'

app.use(cors())
app.use(express.json())

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.PORT || 3000
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API CHAT
/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a chat message to the Gemini AI model.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       description: The role of the message sender (e.g., 'user', 'model').
 *                       example: user
 *                     content:
 *                       type: string
 *                       description: The content of the message.
 *                       example: Hello, how are you?
 *                 description: An array of message objects, each with a role and content.
 *     responses:
 *       200:
 *         description: Successful response with the AI's reply.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: The AI's response text.
 *                   example: I'm doing well, thank you for asking!
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: messages must be an array
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) throw new Error("messages must be an array");
    
    const contents = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents
    });

    res.json({ result: extractText(resp) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server is ready on http://localhost:${PORT}`))
