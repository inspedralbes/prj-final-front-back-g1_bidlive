import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";
const IS_PLACEHOLDER = GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID_HERE");

if (IS_PLACEHOLDER) {
  console.warn("⚠️ [GoogleAuth] VITE_GOOGLE_CLIENT_ID is missing or using placeholder. Google Login will be disabled in components.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={IS_PLACEHOLDER ? "" : GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
