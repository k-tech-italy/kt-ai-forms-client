import { v4 as uuidv4 } from 'uuid';
document.addEventListener("DOMContentLoaded", () => {
    const CHAT_URL = window.ai_driver_url || "http://localhost:8000";
    const uuid = uuidv4();
    const toggleButton = document.createElement("button");
    toggleButton.id = "chat-toggle-button";
    toggleButton.textContent = 'Ask the LLM 💬'
    document.body.appendChild(toggleButton);

    const chatModal = document.createElement("div");
    chatModal.id = "chat-modal";
    chatModal.innerHTML = `
        <div id="chat-modal-content">
            <div class="chat-header">
              <h3>LLM Assistant</h3>
              <button class="close-button" id="close-chat-button">&times;</button>
            </div>
            <div class="chat-messages" id="chat-messages">
            </div>
            <div class="chat-input">
              <input type="text" id="user-message" placeholder="Type your message..." autofocus>
              <button id="send-button">Send</button>
            </div>
        </div>`
    document.body.appendChild(chatModal);

    const closeButton = document.getElementById('close-chat-button');
    const messagesContainer = document.getElementById('chat-messages');
    const messageInput = document.getElementById('user-message');
    const sendButton = document.getElementById('send-button');

    const context = window.ai_context
    if (!context || Object.keys(context).length === 0) {
        displayMessage('No contex provided, try to reload the page', 'llm', true);
        sendButton.disabled = true;
        sendButton.classList.add('button-disabled');
        messageInput.disabled = true;
        messageInput.style.cursor = 'not-allowed';
    } else {
        displayMessage('Hello! Ask me anything.', 'llm');
    }

// Function to scroll the messages container to the bottom
    function scrollToBottom(){
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

// Function to create and append a message element
    function displayMessage(text, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (isError) {
            messageDiv.classList.add(`error-message`);
        } else {
            messageDiv.classList.add(`${sender}-message`);
        }

        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
        return messageDiv;
    }



// --- Event Listeners for UI interaction ---
    toggleButton.addEventListener('click', () => {
        if(chatModal.style.display === 'none' || chatModal.style.display === '')
        {
            chatModal.style.display = 'flex';
            messageInput.focus();
        }
        else
        {
            chatModal.style.display = 'none';
        }
    });

    closeButton.addEventListener('click', () => {
        chatModal.style.display = 'none';
    });

    chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) {
            chatModal.style.display = 'none';
        }
    });

    const handleSendMessage = () => {
        const message = messageInput.value.trim();
        if (message === '') return; // Don't send empty messages

        // 1. Display the user message
        displayMessage(message, 'user');
        messageInput.value = ''; // Clear the input field
        sendButton.disabled = true; // Disable button while loading

        // 2. Display a loading message for the LLM response
        const loadingMessage = displayMessage('LLM is thinking...', 'loading');

        // 3. Send message to the server
        fetch(`${CHAT_URL}/api/llm/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Marker': uuid
            },
            // The body must be a stringified JSON object
            body: JSON.stringify({
                message: message,
                context: context,
            })
        })
            .then(response => {
                // Check if the request was successful (status code 200-299)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // Parse the JSON response
            })
            .then(data => {
                // Remove the loading message
                messagesContainer.removeChild(loadingMessage);

                // Handle missing or falsy response property
                const llmResponse = (data && data.message) || "Sorry, I didn't get a proper response.";

                // 4. Display the LLM's response
                displayMessage(llmResponse, 'llm');
            })
            .catch(error => {
                console.error('Fetch error:', error);
                // Update the loading message to an error message
                loadingMessage.textContent = `Error: Could not reach the server or invalid response. (${error.message})`;
                loadingMessage.classList.remove('loading-message');
                loadingMessage.classList.add('error-message'); // Style as a general LLM/System message
            })
            .finally(() => {
                sendButton.disabled = false; // Re-enable the button
                messageInput.focus(); // Focus back to input
            });
    };

    sendButton.addEventListener('click', handleSendMessage);

    messageInput.addEventListener('keydown', (e) => {
        // Check for 'Enter' key and ensure Shift key is NOT pressed (for multi-line inputs)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default 'Enter' behavior (e.g., new line)
            handleSendMessage();
        }
    });
})