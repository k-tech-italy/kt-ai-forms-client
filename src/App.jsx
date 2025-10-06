import { useState } from "react"
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Avatar
} from "@chatscope/chat-ui-kit-react";

function App() {

  const [chatCollapsed, setChatCollapsed] = useState(true);

  return (
    <>
      {!chatCollapsed && (
        <div className="chat-window">
          <MainContainer>
            <ChatContainer>
              <MessageList>
                <Message
                  model={{
                    message: "Hi there, I am your AI assistant. How can I help you today?",
                    sentTime: "just now",
                    sender: "Joe",
                    direction: "incoming",
                    position: "single",
                  }}
                >
                  <Avatar
                    name="Joe"
                    src="https://chatscope.io/storybook/react/assets/joe-v8Vy3KOS.svg"
                  />
                </Message>
              </MessageList>
              <MessageInput placeholder="Type message here" />
            </ChatContainer>
          </MainContainer>
        </div>
      )}
      <button className="chat-button" onClick={() => setChatCollapsed(!chatCollapsed)}>
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
      </button>
    </>
  )
}

export default App
