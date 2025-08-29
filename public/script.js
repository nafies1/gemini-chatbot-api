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
    const clearChatButton = document.getElementById('clear-chat-btn');

    const CHAT_STORAGE_KEY = 'gemini-chat-history';

    // Array to store the history of the conversation
    let chatHistory = [];
    // Store the last failed message for retry functionality
    let lastFailedMessage = null;

    /**
     * Saves the current chat history to localStorage.
     */
    const saveChatHistory = () => {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
    };

    /**
     * Loads chat history from localStorage and populates the chat box.
     */
    const loadChatHistory = () => {
        const savedHistory = localStorage.getItem(CHAT_STORAGE_KEY);
        if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
            chatHistory.forEach(message => {
                addMessage(message.content, message.role === 'model' ? 'bot' : 'user');
            });
        }
    };

    /**
     * Converts basic markdown formatting to HTML.
     * @param {string} text The text with markdown formatting.
     * @returns {string} The text with HTML formatting.
     */
    const convertMarkdownToHtml = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold** to <strong>bold</strong>
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic* to <em>italic</em>
            .replace(/\n/g, '<br>'); // newlines to <br>
    };

    /**
     * Simulates a typing effect for a given message in a DOM element.
     * Adds and removes a blinking cursor during the typing animation.
     * @param {HTMLElement} element The element to display the message in.
     * @param {string} text The full text to type out.
     * @param {number} [speed=25] The delay in milliseconds between each character.
     * @param {boolean} [isHtml=false] Whether the text contains HTML that should be preserved.
     * @returns {Promise<void>} A promise that resolves when typing is complete.
     */
    const typeMessage = (element, text, speed = 25, isHtml = false) => {
        return new Promise(resolve => {
            let i = 0;
            if (isHtml) {
                element.innerHTML = '';
            } else {
                element.textContent = '';
            }
            element.classList.add('chat-box__message--typing'); // Add typing class for cursor

            function type() {
                if (i < text.length) {
                    if (isHtml) {
                        // For HTML content, we need to handle it differently to preserve formatting
                        const currentText = text.substring(0, i + 1);
                        element.innerHTML = currentText;
                    } else {
                        element.textContent += text.charAt(i);
                    }
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
     * Creates a retry button for failed messages.
     * @param {string} failedMessage The message that failed to send.
     * @returns {HTMLElement} The retry button element.
     */
    const createRetryButton = (failedMessage) => {
        const retryButton = document.createElement('button');
        retryButton.classList.add('retry-button');
        retryButton.innerHTML = '🔄';
        retryButton.title = 'Retry sending message';
        
        retryButton.addEventListener('click', async () => {
            // Disable the retry button during retry
            retryButton.disabled = true;
            retryButton.innerHTML = '⏳';
            
            // Find the error message element and update it
            const errorMessageElement = retryButton.parentElement;
            errorMessageElement.innerHTML = convertMarkdownToHtml('Thinking...');
            errorMessageElement.classList.add('chat-box__message--thinking');
            
            try {
                // Add the failed message back to history for retry
                chatHistory.push({ role: 'user', content: failedMessage });
                
                // Send the message to the backend API
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: chatHistory,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }

                const data = await response.json();
                errorMessageElement.classList.remove('chat-box__message--thinking');

                // Replace the error message with the AI's response
                if (data && data.result) {
                    const htmlContent = convertMarkdownToHtml(data.result);
                    await typeMessage(errorMessageElement, htmlContent, 25, true);
                    // Add the bot's response to the history
                    chatHistory.push({ role: 'model', content: data.result });
                    saveChatHistory();
                    // Clear the last failed message since retry was successful
                    lastFailedMessage = null;
                } else {
                    throw new Error('No response received');
                }
            } catch (error) {
                console.error('Retry failed:', error);
                errorMessageElement.classList.remove('chat-box__message--thinking');
                // Show error message with retry button again
                const errorContent = document.createElement('div');
                errorContent.style.display = 'flex';
                errorContent.style.alignItems = 'center';
                errorContent.style.gap = '8px';
                
                const errorText = document.createElement('span');
                errorText.innerHTML = convertMarkdownToHtml('Failed to get response from server.');
                
                const newRetryButton = createRetryButton(failedMessage);
                
                errorContent.appendChild(errorText);
                errorContent.appendChild(newRetryButton);
                errorMessageElement.innerHTML = '';
                errorMessageElement.appendChild(errorContent);
                
                // Remove the failed message from history again
                chatHistory.pop();
            }
        });
        
        return retryButton;
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
        
        // For bot messages, convert markdown to HTML and use innerHTML
        // For user messages, use textContent for security (prevent XSS)
        if (role === 'bot') {
            messageDiv.innerHTML = convertMarkdownToHtml(content);
        } else {
            messageDiv.textContent = content;
        }
        
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
        // Add the user's message to the history for context
        chatHistory.push({ role: 'user', content: userMessage });
        saveChatHistory();

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
                    messages: chatHistory,
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
                const htmlContent = convertMarkdownToHtml(data.result);
                await typeMessage(botMessageElement, htmlContent, 25, true);
                // Add the bot's response to the history for context.
                // The Gemini API uses 'model' for the assistant's role.
                chatHistory.push({ role: 'model', content: data.result });
                saveChatHistory();
            } else {
                botMessageElement.innerHTML = convertMarkdownToHtml('Sorry, no response received.');
            }
        } catch (error) {
            // Handle network errors or failed requests
            console.error('Error fetching chat response:', error);
            botMessageElement.classList.remove('chat-box__message--thinking');
            
            // Store the failed message for retry functionality
            lastFailedMessage = userMessage;
            
            // Create error message with retry button
            const errorContent = document.createElement('div');
            errorContent.style.display = 'flex';
            errorContent.style.alignItems = 'center';
            errorContent.style.gap = '8px';
            
            const errorText = document.createElement('span');
            errorText.innerHTML = convertMarkdownToHtml('Failed to get response from server.');
            
            const retryButton = createRetryButton(userMessage);
            
            errorContent.appendChild(errorText);
            errorContent.appendChild(retryButton);
            botMessageElement.innerHTML = '';
            botMessageElement.appendChild(errorContent);
            
            // On failure, remove the last user message from history to allow for a clean retry
            chatHistory.pop();
        } finally {
            // 5. Re-enable form controls and focus input
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    };

    /**
     * Clears the chat history from the UI, the state array, and localStorage.
     */
    const handleClearChat = () => {
        chatHistory = [];
        localStorage.removeItem(CHAT_STORAGE_KEY);
        chatBox.innerHTML = '';
        userInput.focus();
    };

    // Attach the event listener to the form
    chatForm.addEventListener('submit', handleChatSubmit);
    clearChatButton.addEventListener('click', handleClearChat);

    // Load chat history when the page loads
    loadChatHistory();
});
