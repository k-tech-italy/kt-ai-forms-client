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

    let context = window.ai_context
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
    function scrollToBottom() {
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
        if (chatModal.style.display === 'none' || chatModal.style.display === '') {
            chatModal.style.display = 'flex';
            messageInput.focus();
        }
        else {
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
    const addEmptyValueFieldsToContext = (context) => {
        if (!context || !context.forms)
            return
        for (const form of Object.values(context.forms)) {
            if (!('values' in form)) {
                form['values'] = {}
            }
            for (const field of Object.keys(form.fields)) {
                if (!(field in form['values'])) {
                    form['values'][field] = ""
                }
            }
        }
    }
    const llmPrompt = (message) => {
        return `You are an intelligent assistant integrated into a web application.
        Your goal is to understand the user's message and the context provided separately in the request body, then respond with a JSON object that contains:  
        1. A "message" string — your reply to the user.  
        2. A "context" object — identical to the provided one, but with any form field values filled in based on the user's input or intent.
        
        Carefully analyze the given user_message and the context object (which is provided in the request body).  
        If the user provides information that matches any form fields, find the right form that is located inside the context "forms" object, and fill it's associated value inside 
        the "values" object.
        Bare in mind that could be more than one form in the context object, inside the "forms" key, and you need to add values to the right form.
        Never add any extra key in the context form values object, fill or replace the existing values based on the user's message.
        If some information is missing, leave those fields empty.
        
        Always return the result strictly in the following JSON format:
        
        {
          "message": "<your reply to the user>",
          "context": { <updated context JSON> }
        }
        
        Do not include any extra text or explanation outside of this JSON.
        
        ---
        
        ### Example:

        **Expected input context**
        {
            "context": {
                "site": "This website enables users to submit contact forms and has records of book titles and authors.",
                "page": "In this page, the user can submit a contact form that verifies the user's email address, deliver a message and find a book.",
                "forms": {
                    "contactmessageform": {
                        "context": "In this form, the user needs to specify their username, email address, and message to be delivered.",
                        "fields": {
                            "username": "This field contains a unique username for the user.",
                            "email": "This field contains an email address that verification of the submission will be sent to.",
                            "message": "This field contains the message the user wishes to deliver."
                        },
                        "values": {
                            "username": "",
                            "email": "",
                            "message": ""
                        }
                    },
                    "bookform": {
                        "context": "In this form, the user needs to specify a book title, and author.",
                        "fields": {
                            "title": "This field contains a book title.",
                            "author": "This field contains the book author name.",
                        },
                        "values": {
                            "title": "",
                            "author": "",
                        }
                    }
                }
            }
        }
        
        **User message:**
        "My name is John, my email is john@example.com, my favorite book is The Lord of the Ring written by J.R.R. Tolkien."
        
        **Expected output:**
        {
            "message": "Sure, I've filled in your user and book details. Let me know if you need anything else!",
            "context": {
                "site": "This website enables users to submit contact forms and has records of book titles and authors.",
                "page": "In this page, the user can submit a contact form that verifies the user's email address, deliver a message and find a book.",
                "forms": {
                    "contactmessageform": {
                        "context": "In this form, the user needs to specify their username, email address, and message to be delivered.",
                        "fields": {
                            "username": "This field contains a unique username for the user.",
                            "email": "This field contains an email address that verification of the submission will be sent to.",
                            "message": "This field contains the message the user wishes to deliver."
                        },
                        "values": {
                            "username": "John",
                            "email": "john@example.com",
                            "message": ""
                        }
                    },
                    "bookform": {
                        "context": "In this form, the user needs to specify a book title, and author.",
                        "fields": {
                            "title": "This field contains a book title.",
                            "author": "This field contains the book author name.",
                        },
                        "values": {
                            "title": "The Lord of the Rings",
                            "author": "J.R.R. Tolkien",
                        }
                    }
                }
            }
        }
        
        ---
        
        Now, here is the current user message:
        
        USER MESSAGE:
        ${message}`
    }
    const fillForms = (ai_response_context) => {
        if (!ai_response_context || !ai_response_context.forms)
            return
        for (const [formName, formInfo] of Object.entries(ai_response_context.forms)) {
            const formElement = document.querySelector(`aiform[data-aiform-form-name="${formName}"]`).closest('form');
            for (const [inputName, inputValue] of Object.entries(formInfo.values)) {
                if (inputValue) {
                    formElement.elements[inputName].value = inputValue
                }
            }
        }
        context = ai_response_context
    }
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
                message: llmPrompt(message),
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

                // 4. Display the LLM's response use a try catch if any error display an error message (something goes wrong, like try again later)
                try {
                    fillForms(data.context)
                    displayMessage(llmResponse, 'llm');
                } catch (e) {
                    displayMessage("Something went wrong, please try again later.", 'llm', true)
                }

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
    if (context && Object.keys(context).length > 0) {
        addEmptyValueFieldsToContext(context)
    }
})