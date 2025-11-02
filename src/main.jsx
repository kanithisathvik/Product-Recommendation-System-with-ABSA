import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'  // ← This line must be here!
import { ThemeProvider } from './context/ThemeContext.jsx'
import { FavoritesProvider } from './context/FavoritesContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </ThemeProvider>
  </React.StrictMode>,
)