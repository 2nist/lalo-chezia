import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Initialize theme immediately to prevent flash
const initTheme = () => {
  const stored = localStorage.getItem('theme')
  const theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

initTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
