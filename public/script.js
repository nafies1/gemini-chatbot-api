// const form = document.getElementById('chat-form');
// const input = document.getElementById('user-input');
// const chatBox = document.getElementById('chat-box');

// form.addEventListener('submit', function (e) {
//   e.preventDefault();

//   const userMessage = input.value.trim();
//   if (!userMessage) return;

//   appendMessage('user', userMessage);
//   input.value = '';

//   // Simulasi dummy balasan bot (placeholder)
//   setTimeout(() => {
//     appendMessage('bot', 'Gemini is thinking... (this is dummy response)');
//   }, 1000);
// });

// function appendMessage(sender, text) {
//   const msg = document.createElement('div');
//   msg.classList.add('message', sender);
//   msg.textContent = text;
//   chatBox.appendChild(msg);
//   chatBox.scrollTop = chatBox.scrollHeight;
// }

/**
 * This script handles the frontend logic for a simple chatbot application.
 * It captures user input, sends it to a backend API, and displays the
 * conversation in the chat box.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the necessary DOM elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const sendButton = chatForm.querySelector('button[type="submit"]');

    /**
     * Simulates a typing effect for a given message in a DOM element.
     * Adds and removes a blinking cursor during the typing animation.
     * @param {HTMLElement} element The element to display the message in.
     * @param {string} text The full text to type out.
     * @param {number} [speed=25] The delay in milliseconds between each character.
     * @returns {Promise<void>} A promise that resolves when typing is complete.
     */
    const typeMessage = (element, text, speed = 25) => {
        return new Promise(resolve => {
            let i = 0;
            element.textContent = '';
            element.classList.add('chat-box__message--typing'); // Add typing class for cursor

            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    chatBox.scrollTop = chatBox.scrollHeight;
                    setTimeout(type, speed);
                } else {
                    element.classList.remove('chat-box__message--typing'); // Remove cursor
                    resolve();
                }
            }
            type();
        });
    };

    /**
     * Creates and appends a new message to the chat box.
     * @param {string} content The text content of the message.
     * @param {'user' | 'bot'} role The role of the sender, used for styling.
     * @returns {HTMLElement} The newly created message element.
     */
    const addMessage = (content, role) => {
        const messageDiv = document.createElement('div');
        // Use a BEM-like class structure for clear and maintainable styling
        messageDiv.classList.add('chat-box__message', `chat-box__message--${role}`);
        messageDiv.textContent = content;
        chatBox.appendChild(messageDiv);

        // Automatically scroll to the bottom to show the latest message
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv;
    };

    /**
     * Handles the form submission event.
     * @param {Event} event The form submission event.
     */
    const handleChatSubmit = async (event) => {
        event.preventDefault();

        const userMessage = userInput.value.trim();
        if (!userMessage) {
            return; // Don't send empty messages
        }

        // Disable form controls while processing
        userInput.disabled = true;
        sendButton.disabled = true;

        // 1. Add the user's message to the chat interface
        addMessage(userMessage, 'user');

        // 2. Clear the input field and show a "Thinking..." message
        userInput.value = '';
        const botMessageElement = addMessage('Thinking...', 'bot');
        botMessageElement.classList.add('chat-box__message--thinking');

        try {
            // 3. Send the user's message to the backend API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: userMessage }],
                }),
            });

            if (!response.ok) {
                // Handle non-successful HTTP responses (e.g., 404, 500)
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            botMessageElement.classList.remove('chat-box__message--thinking');

            // 4. Replace the "Thinking..." message with the AI's actual response
            if (data && data.result) {
                await typeMessage(botMessageElement, data.result);
            } else {
                botMessageElement.textContent = 'Sorry, no response received.';
            }
        } catch (error) {
            // Handle network errors or failed requests
            console.error('Error fetching chat response:', error);
            botMessageElement.classList.remove('chat-box__message--thinking');
            botMessageElement.textContent = 'Failed to get response from server.';
        } finally {
            // 5. Re-enable form controls and focus input
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    };

    // Attach the event listener to the form
    chatForm.addEventListener('submit', handleChatSubmit);
});
