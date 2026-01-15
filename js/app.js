document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const motivationQuote = document.getElementById('motivationQuote');

    // Motivational Quotes Array
    const motivationalQuotes = [
        "Your body is your greatest project - invest in it.",
        "Fitness is not a destination, it's a lifestyle journey.",
        "Every rep brings you closer to your goals.",
        "Believe in yourself and you're already halfway there.",
        "The only bad workout is the one you didn't do.",
        "Transform your body, transform your life.",
        "Pain is temporary, pride is forever.",
        "You are stronger than you think.",
        "Success is the sum of small efforts repeated day in and day out.",
        "Your potential is limitless - keep pushing.",
        "Sweat now, shine later.",
        "Great things never come from comfort zones.",
        "Be the best version of yourself.",
        "No excuses, just results.",
        "Every step forward is a victory."
    ];

    // Rotate motivational quotes every 6 seconds
    let currentQuoteIndex = 0;
    function rotateQuote() {
        if (motivationQuote) {
            motivationQuote.style.animation = 'none';
            setTimeout(() => {
                currentQuoteIndex = (currentQuoteIndex + 1) % motivationalQuotes.length;
                motivationQuote.textContent = motivationalQuotes[currentQuoteIndex];
                motivationQuote.style.animation = 'fadeInOut 5s ease-in-out infinite';
            }, 50);
        }
    }
    setInterval(rotateQuote, 6000);

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
            // Send to N8N webhook
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatInput: message
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
        
        // For bot messages, convert markdown and line breaks to HTML
        if (sender === 'bot') {
            // Replace line breaks with <br>
            let formatted = message.replace(/\n/g, '<br>');
            
            // Convert markdown bold (**text**) to <strong>
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Convert markdown italic (*text*) to <em>
            formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Convert URLs to clickable links
            formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline;">$1</a>');
            
            messageParagraph.innerHTML = formatted;
        } else {
            // For user messages, just use plain text
            messageParagraph.textContent = message;
        }
        
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