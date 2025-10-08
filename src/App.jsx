import { useState, useEffect } from "react"
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
import {createMessage} from "./api/chat.js";

function App() {

  const [chatCollapsed, setChatCollapsed] = useState(true);
  const [messages, setMessages] = useState([]);
  const [context, setContext] = useState({})

  const aiAvatar = {
    name: "Joe",
    src: "https://chatscope.io/storybook/react/assets/joe-v8Vy3KOS.svg"
  }

  const userAvatar = {
    name: "Eliot",
    src: "https://chatscope.io/storybook/react/assets/eliot-JNkqSAth.svg"
  }

  // set the initial messages by the AI
  useEffect(() => {
    if(window.ai_context)
    {
      setContext(window.ai_context)
      setMessages([
        <Message model={{
          message: "Hi there, I am your AI assistant. How can I help you today?",
          sentTime: "just now",
          sender: "Joe",
          direction: "incoming",
          position: "single",
        }}>
          <Avatar src={aiAvatar.src} name={aiAvatar.name}/>
        </Message>
      ])
    }
    else
    {
      console.error("No context provided")
      setMessages([
        <Message model={{
          message: "No context provided. Try to refresh the page",
          sentTime: "just now",
          sender: "Joe",
          direction: "incoming",
          position: "single",

        }}>
          <Avatar src={aiAvatar.src} name={aiAvatar.name} />
          <Message.HtmlContent className="error-message"
                               html="<div>No context provided. Try to refresh the page</div>"
          ></Message.HtmlContent>
        </Message>
      ])
    }
  },[]);


  const onSend = async (message) => {
    const newMessage = <Message model={{
      message: message,
      sentTime: "just now",
      sender: "Joe",
      direction: "outgoing",
      position: "single",
    }}>
      <Avatar src={userAvatar.src} name={userAvatar.name} />
    </Message>
    setMessages([...messages, newMessage]);
    console.log(context)
    await createMessage(message, context);
  }

  return (
    <>
      {!chatCollapsed && (
        <div className="chat-window">
          <MainContainer>
            <ChatContainer>
              <MessageList>
                {messages.map((message, index) => (
                  <div key={`message-${index}`}>{message}</div>
                ))}
              </MessageList>
              <MessageInput 
              placeholder="Type message here"
              onSend={onSend}
              disabled={!context || Object.keys(context).length === 0}
              />
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
