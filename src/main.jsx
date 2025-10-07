import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const elemDiv = document.createElement('div');
elemDiv.id = "ai-forms-chatbot"
document.body.appendChild(elemDiv);
createRoot(document.getElementById("ai-forms-chatbot")).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
