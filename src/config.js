/**
 * Retrieves the AI driver URL from the window object or returns a default localhost URL.
 *
 * @returns {string} The AI driver URL. Defaults to "http://localhost:8000" if not set.
 * @example
 * const url = getDriverUrl();
 * // Returns: "http://localhost:8000" or custom URL if window.ai_driver_url is set
 */
const getDriverUrl = () => {
    return window.ai_driver_url || "http://localhost:8000";
}

/**
 * Retrieves the AI context object from the window object.
 * The context contains information about the site, page, and forms that the LLM uses
 * to understand and fill form fields based on user input.
 *
 * @returns {Object|null} The AI context object containing site, page, and forms information,
 *                        or null if not available.
 * @example
 * const context = getContext();
 * // Returns: { site: "...", page: "...", forms: {...} } or null
 */
const getContext = () => {
    return window.ai_context || null;
}

/**
 * Generates a complete LLM prompt that instructs the AI assistant on how to process
 * user messages and fill form fields appropriately.
 *
 * The generated prompt includes:
 * - Instructions for the LLM to understand user input and context
 * - Guidelines for filling form values in the correct forms
 * - Expected JSON response format with "message" and "context" fields
 * - Example input/output demonstrating the expected behavior
 * - The actual user message to be processed
 *
 * @param {string} message - The user's message to be included in the prompt.
 * @returns {string} A complete prompt string ready to be sent to the LLM.
 * @example
 * const prompt = getLLMPrompt("My name is John");
 * // Returns: A formatted prompt containing instructions and the user message
 */
const getLLMPrompt = (message) => {
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

export {
    getDriverUrl,
    getContext,
    getLLMPrompt
};