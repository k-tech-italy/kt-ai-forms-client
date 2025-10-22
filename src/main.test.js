import { describe, it, expect, beforeEach, vi} from 'vitest';

describe('Chat Interface', () => {
  let fetchMock;

  beforeEach(async () => {
    // Clear module cache to get a fresh import each time
    vi.resetModules();

    // Set up DOM
    document.body.innerHTML = '';

    // Mock window.ai_context
    window.ai_context = { some: 'context' };

    // Mock fetch
    fetchMock = vi.fn();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'Test response' })
    });
    global.fetch = fetchMock;
  });

  async function loadModule() {
    // Dynamically import the module
    await import('./main.js');

    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);

    // Small delay to let the event handler execute
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  describe('Initial Setup', () => {
    it('should create and append toggle button to body', async () => {
      await loadModule();

      const toggleButton = document.getElementById('chat-toggle-button');
      expect(toggleButton).toBeTruthy();
      expect(toggleButton.textContent).toBe('Ask the LLM 💬');
    });

    it('should create and append chat modal to body', async () => {
      await loadModule();

      const chatModal = document.getElementById('chat-modal');
      expect(chatModal).toBeTruthy();

      const header = chatModal.querySelector('.chat-header h3');
      expect(header.textContent).toBe('LLM Assistant');

      const messagesContainer = document.getElementById('chat-messages');
      expect(messagesContainer).toBeTruthy();

      const messageInput = document.getElementById('user-message');
      expect(messageInput).toBeTruthy();
      expect(messageInput.placeholder).toBe('Type your message...');

      const sendButton = document.getElementById('send-button');
      expect(sendButton).toBeTruthy();
      expect(sendButton.textContent).toBe('Send');
    });

    it('should display welcome message when context is available', async () => {
      window.ai_context = { valid: 'context' };
      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messages = messagesContainer.querySelectorAll('.message');

      expect(messages.length).toBeGreaterThan(0);
      const welcomeMessage = Array.from(messages).find(
        msg => msg.textContent === 'Hello! Ask me anything.'
      );
      expect(welcomeMessage).toBeTruthy();
      expect(welcomeMessage.classList.contains('llm-message')).toBe(true);
    });

    it('should display error and disable inputs when context is missing', async () => {
      window.ai_context = null;
      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const errorMessage = messagesContainer.querySelector('.error-message');

      expect(errorMessage).toBeTruthy();
      expect(errorMessage.textContent).toBe('No contex provided, try to reload the page');

      const sendButton = document.getElementById('send-button');
      expect(sendButton.disabled).toBe(true);
      expect(sendButton.classList.contains('button-disabled')).toBe(true);

      const messageInput = document.getElementById('user-message');
      expect(messageInput.disabled).toBe(true);
      expect(messageInput.style.cursor).toBe('not-allowed');
    });

    it('should disable inputs when context is empty object', async () => {
      window.ai_context = {};
      await loadModule();

      const sendButton = document.getElementById('send-button');
      expect(sendButton.disabled).toBe(true);

      const messageInput = document.getElementById('user-message');
      expect(messageInput.disabled).toBe(true);
    });
  });

  describe('Toggle Button Functionality', () => {
    it('should show modal when toggle button is clicked and modal is hidden', async () => {
      await loadModule();

      const toggleButton = document.getElementById('chat-toggle-button');
      const chatModal = document.getElementById('chat-modal');

      chatModal.style.display = 'none';
      toggleButton.click();

      expect(chatModal.style.display).toBe('flex');
    });

    it('should hide modal when toggle button is clicked and modal is visible', async () => {
      await loadModule();

      const toggleButton = document.getElementById('chat-toggle-button');
      const chatModal = document.getElementById('chat-modal');

      chatModal.style.display = 'flex';
      toggleButton.click();

      expect(chatModal.style.display).toBe('none');
    });

    it('should focus on input when modal is opened', async () => {
      await loadModule();

      const toggleButton = document.getElementById('chat-toggle-button');
      const chatModal = document.getElementById('chat-modal');
      const messageInput = document.getElementById('user-message');

      const focusSpy = vi.spyOn(messageInput, 'focus');

      chatModal.style.display = 'none';
      toggleButton.click();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('Close Button Functionality', () => {
    it('should hide modal when close button is clicked', async () => {
      await loadModule();

      const closeButton = document.getElementById('close-chat-button');
      const chatModal = document.getElementById('chat-modal');

      chatModal.style.display = 'flex';
      closeButton.click();

      expect(chatModal.style.display).toBe('none');
    });

    it('should hide modal when clicking outside modal content', async () => {
      await loadModule();

      const chatModal = document.getElementById('chat-modal');

      chatModal.style.display = 'flex';

      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: chatModal, enumerable: true });
      chatModal.dispatchEvent(clickEvent);

      expect(chatModal.style.display).toBe('none');
    });

    it('should not hide modal when clicking inside modal content', async () => {
      await loadModule();

      const chatModal = document.getElementById('chat-modal');
      const modalContent = document.getElementById('chat-modal-content');

      chatModal.style.display = 'flex';

      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: modalContent, enumerable: true });
      chatModal.dispatchEvent(clickEvent);

      expect(chatModal.style.display).toBe('flex');
    });
  });

  describe('Message Display', () => {
    it('should add user message to chat when sending', async () => {
      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const initialCount = messagesContainer.children.length;

      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test message';
      sendButton.click();

      const userMessages = messagesContainer.querySelectorAll('.user-message');
      const lastUserMessage = userMessages[userMessages.length - 1];

      expect(lastUserMessage.textContent).toBe('Test message');
      expect(messagesContainer.children.length).toBeGreaterThan(initialCount);
    });

    it('should clear input field after sending message', async () => {
      await loadModule();

      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test message';
      sendButton.click();

      expect(messageInput.value).toBe('');
    });

    it('should not send empty messages', async () => {
      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const initialCount = messagesContainer.children.length;

      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = '   '; // Only whitespace
      sendButton.click();

      expect(messagesContainer.children.length).toBe(initialCount);
    });

    it('should display loading message when sending', async () => {
      fetchMock.mockImplementation(() => new Promise(() => {})); // Never resolves
      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test message';
      sendButton.click();

      const loadingMessage = Array.from(messagesContainer.children).find(
        msg => msg.textContent === 'LLM is thinking...'
      );
      expect(loadingMessage).toBeTruthy();
      expect(loadingMessage.classList.contains('loading-message')).toBe(true);
    });
  });

  describe('Fetch API Integration', () => {
    it('should send POST request with correct payload and default driver url', async () => {
      const mockResponse = { message: 'LLM response' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      await loadModule();

      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(fetchMock).toHaveBeenCalled();
      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost:8000/api/llm/call');
      expect(callArgs[1].method).toBe('POST');
      expect(callArgs[1].headers['Content-Type']).toBe('application/json');
      expect(callArgs[1].headers['X-Request-Marker']).toBeDefined();

      const body = JSON.parse(callArgs[1].body);
      expect(body.context).toEqual(window.ai_context);
      expect(body.message).toContain('Test prompt');
      expect(body.message).toContain('You are an intelligent assistant');
    });

    it('should send POST request with correct custom driver base url', async () => {
      const mockResponse = { message: 'LLM response' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      window.ai_driver_url = 'https://example.com';

      await loadModule();

      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(fetchMock).toHaveBeenCalled();
      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs[0]).toBe('https://example.com/api/llm/call');
    });

    it('should display LLM response after successful fetch', async () => {
      const mockResponse = { message: 'This is the LLM response' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      const llmMessage = Array.from(messagesContainer.children).find(
        msg => msg.textContent === 'This is the LLM response'
      );
      expect(llmMessage).toBeTruthy();
      expect(llmMessage.classList.contains('llm-message')).toBe(true);
    });

    it('should remove loading message after successful response', async () => {
      const mockResponse = { response: 'LLM response' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      const loadingMessage = Array.from(messagesContainer.children).find(
        msg => msg.textContent === 'LLM is thinking...'
      );
      expect(loadingMessage).toBeFalsy();
    });

    it('should handle fetch error and display error message', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      const errorMessage = Array.from(messagesContainer.children).find(
        msg => msg.textContent.includes('Error: Could not reach the server')
      );
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.classList.contains('error-message')).toBe(true);
    });

    it('should handle HTTP error status', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500
      });

      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      const errorMessage = Array.from(messagesContainer.children).find(
        msg => msg.textContent.includes('Error')
      );
      expect(errorMessage).toBeTruthy();
    });

    it('should re-enable send button after request completes', async () => {
      const mockResponse = { response: 'LLM response' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      await loadModule();

      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      expect(sendButton.disabled).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(sendButton.disabled).toBe(false);
    });

    it('should focus input after request completes', async () => {
      const mockResponse = { response: 'LLM response' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      await loadModule();

      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');
      const focusSpy = vi.spyOn(messageInput, 'focus');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should display fallback message when response property is missing', async () => {
      const mockResponse = {}; // No response property
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      const fallbackMessage = Array.from(messagesContainer.children).find(
        msg => msg.textContent === "Sorry, I didn't get a proper response."
      );
      expect(fallbackMessage).toBeTruthy();
      expect(fallbackMessage.classList.contains('llm-message')).toBe(true);
    });

    it('should display fallback message when response property is null', async () => {
      const mockResponse = { response: null };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      const fallbackMessage = Array.from(messagesContainer.children).find(
        msg => msg.textContent === "Sorry, I didn't get a proper response."
      );
      expect(fallbackMessage).toBeTruthy();
      expect(fallbackMessage.classList.contains('llm-message')).toBe(true);
    });

    it('should display fallback message when response property is empty string', async () => {
      const mockResponse = { response: '' };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      const fallbackMessage = Array.from(messagesContainer.children).find(
        msg => msg.textContent === "Sorry, I didn't get a proper response."
      );
      expect(fallbackMessage).toBeTruthy();
      expect(fallbackMessage.classList.contains('llm-message')).toBe(true);
    });

    it('should display error message when data is null', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => null
      });

      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Test prompt';
      sendButton.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      const errorMessage = Array.from(messagesContainer.children).find(
        msg => msg.textContent === "Something went wrong, please try again later."
      );
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.classList.contains('error-message')).toBe(true);
    });
  });

  describe('Keyboard Events', () => {
    it('should send message when Enter key is pressed', async () => {
      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');

      messageInput.value = 'Test with Enter key';

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey: false,
        bubbles: true
      });

      messageInput.dispatchEvent(enterEvent);

      const userMessages = messagesContainer.querySelectorAll('.user-message');
      const lastUserMessage = userMessages[userMessages.length - 1];

      expect(lastUserMessage.textContent).toBe('Test with Enter key');
    });

    it('should not send message when Shift+Enter is pressed', async () => {
      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const initialCount = messagesContainer.children.length;

      messageInput.value = 'Test with Shift+Enter';

      const shiftEnterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey: true,
        bubbles: true
      });
      messageInput.dispatchEvent(shiftEnterEvent);

      expect(messagesContainer.children.length).toBe(initialCount);
    });

    it('should not send message when other keys are pressed', async () => {
      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const initialCount = messagesContainer.children.length;

      messageInput.value = 'Test message';

      const keyEvent = new KeyboardEvent('keydown', {
        key: 'a',
        shiftKey: false,
        bubbles: true
      });
      messageInput.dispatchEvent(keyEvent);

      expect(messagesContainer.children.length).toBe(initialCount);
    });
  });

  describe('Scroll Functionality', () => {
    it('should scroll to bottom when message is added', async () => {
      await loadModule();

      const messagesContainer = document.getElementById('chat-messages');
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      Object.defineProperty(messagesContainer, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 1000
      });

      let scrollTopValue = 0;
      Object.defineProperty(messagesContainer, 'scrollTop', {
        get() { return scrollTopValue; },
        set(value) { scrollTopValue = value; },
        configurable: true
      });

      messageInput.value = 'Test scroll';
      sendButton.click();

      expect(scrollTopValue).toBe(1000);
    });
  });
  describe('Form fill functionality', () => {
    it('forms should be filled', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          "message": "I’ve filled in both forms with example data. You can now review or submit them.",
              "context": {
            "site": "This website enables users to submit contact forms and has records of book titles and authors.",
                "page": "In this page, the user can submit a contact form that verifies the users email address and delivers a message.",
                "forms": {
              "contactmessageform": {
                "context": "In this form, the user needs to specify their username, email address and message to be delivered.",
                    "fields": {
                  "username": "This field contains a unique username for the user.",
                      "email": "This field contains an email address that verification of the submission will be sent to.",
                      "message": "This field contains the message the user wishes to deliver."
                },
                "values": {
                  "username": "example_user",
                      "email": "user@example.com",
                      "message": "This is an example message for testing purposes."
                }
              },
              "registerform": {
                "context": "In this form, the user needs to provide their personal information to create a new account.",
                    "fields": {
                  "first_name": "This field contains the user's given name.",
                      "last_name": "This field contains the user's family name.",
                      "email": "This field contains the user's email address used for account verification and communication.",
                      "password": "This field contains a secure password chosen by the user for account authentication."
                },
                "values": {
                  "first_name": "John",
                      "last_name": "Doe",
                      "email": "john.doe@example.com",
                      "password": "ExamplePass123"
                }
              }
            }
          }
        })
      });
      document.body.innerHTML=`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LLM Chat Pop-up</title>
      </head>
      <body>
        <form name="contactmessageform" action="#" method="post">
          <aiform data-aiform-form-name="contactmessageform"></aiform>
          <h2>Contact Form</h2>

          <label for="username">Username:</label><br>
          <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="This field contains a unique username for the user."
                  required
          ><br><br>
          <label for="email">Email:</label><br>
          <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="This field contains an email address that verification of the submission will be sent to."
                  required
          ><br><br>

          <label for="message">Message:</label><br>
          <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="This field contains the message the user wishes to deliver."
                  required
          ></textarea><br><br>

          <button type="submit">Send</button>
        </form>
        <form name="registerform" action="#" method="post">
          <aiform data-aiform-form-name="registerform"></aiform>
          <h2>Registration Form</h2>

          <label for="first_name">First Name:</label><br>
          <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  placeholder="Enter your first name"
                  required
          ><br><br>

          <label for="last_name">Last Name:</label><br>
          <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Enter your last name"
                  required
          ><br><br>

          <label for="email_register">Email:</label><br>
          <input
                  type="email"
                  id="email_register"
                  name="email"
                  placeholder="Enter your email address"
                  required
          ><br><br>

          <label for="password">Password:</label><br>
          <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  required
          ><br><br>

          <button type="submit">Register</button>
        </form>
      </body>
      </html>`
      window.ai_context={
        "site": "This website enables users to submit contact forms and has records of book titles and authors.",
        "page": "In this page, the user can submit a contact form that verifies the users email address and delivers a message.",
        "forms": {
          "contactmessageform": {
            "context": "In this form, the user needs to specify their username, email address and message to be delivered.",
            "fields": {
              "username": "This field contains a unique username for the user.",
              "email": "This field contains an email address that verification of the submission will be sent to.",
              "message": "This field contains the message the user wishes to deliver."
            },
          },
          "registerForm": {
            "context": "In this form, the user needs to provide their personal information to create a new account.",
            "fields": {
              "first_name": "This field contains the user's given name.",
              "last_name": "This field contains the user's family name.",
              "email": "This field contains the user's email address used for account verification and communication.",
              "password": "This field contains a secure password chosen by the user for account authentication."
            }
          }
        },
      }
      await loadModule()
      const messageInput = document.getElementById('user-message');
      const sendButton = document.getElementById('send-button');

      messageInput.value = 'Fill forms with example data';
      sendButton.click();

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(document.getElementById('username').value).toBe('example_user');
      expect(document.getElementById('email').value).toBe('user@example.com');
      expect(document.getElementById('password').value).toBe('ExamplePass123');
      expect(document.getElementById('message').value).toBe('This is an example message for testing purposes.');
      expect(document.getElementById('first_name').value).toBe('John');
      expect(document.getElementById('last_name').value).toBe('Doe');

    });
  });
});
