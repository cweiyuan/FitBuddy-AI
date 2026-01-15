document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // N8N Webhook URL
    const WEBHOOK_URL = 'https://w3naut.app.n8n.cloud/webhook/99c8f926-6555-4aab-a06d-22f827ec00b3';

    // Send message function
    async function sendMessage() {
        const message = userInput.value.trim();
        
        if (!message) return;

        // Add user message to chat
        addMessageToChat(message, 'user');
        userInput.value = '';

        // Show loading indicator
        loadingIndicator.style.display = 'flex';
        sendBtn.disabled = true;

        try {
            // Send to N8N webhook - send in multiple formats for compatibility
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    guardrailsInput: message,
                    body: {
                        chatInput: message
                    },
                    message: message
                })
            });

            console.log('Response Status:', response.status);
            console.log('Response OK:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Try to parse JSON, but handle empty responses
            let data = {};
            const responseText = await response.text();
            console.log('Response Text:', responseText);
            
            if (responseText) {
                try {
                    data = JSON.parse(responseText);
                    console.log('Response Data:', data);
                } catch (e) {
                    console.log('Response is not JSON:', responseText);
                    data = { message: responseText };
                }
            }
            
            // Handle response from N8N - prioritize output, then response, then message
            const botResponse = data.output || data.response || data.message || data.body || 'Great! Your request was processed successfully. Tell me more about your fitness goals!';
            console.log('Bot Response:', botResponse);
            addMessageToChat(botResponse, 'bot');

        } catch (error) {
            console.error('Error:', error);
            console.error('Error Message:', error.message);
            console.error('Webhook URL:', WEBHOOK_URL);
            
            // Show detailed error for debugging
            const errorMessage = `Error: ${error.message}. Make sure your n8n webhook is returning a JSON response with a "message" or "response" field.`;
            addMessageToChat(errorMessage, 'bot');
        } finally {
            loadingIndicator.style.display = 'none';
            sendBtn.disabled = false;
            userInput.focus();
        }
    }

    // Add message to chat display
    function addMessageToChat(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;
        
        messageDiv.appendChild(messageParagraph);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Smooth press animation for send button
    sendBtn.addEventListener('mousedown', () => {
        sendBtn.style.transform = 'scale(0.95)';
    });

    sendBtn.addEventListener('mouseup', () => {
        sendBtn.style.transform = 'scale(1)';
    });

    sendBtn.addEventListener('mouseleave', () => {
        sendBtn.style.transform = 'scale(1)';
    });

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Focus input on load
    userInput.focus();
});