import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // Import Tailwind base styles

// Initial Zustand check (optional, hydrate in App is usually sufficient)
// import { useAuthStore } from './store/authStore.ts';
// useAuthStore.getState().hydrate();


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)