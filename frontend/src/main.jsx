import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{
          style: { 
            background: '#ffffff', 
            color: '#0f172a', 
            border: '1px solid #DCE3EB',
            borderRadius: '14px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
            fontWeight: 500,
            fontSize: '13px',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '12px 16px',
          },
          success: { 
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
            style: { borderColor: '#a7f3d0' },
          },
          error: { 
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
            style: { borderColor: '#fecaca' },
          },
          duration: 3000,
        }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
