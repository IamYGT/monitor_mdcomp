import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Bootstrap Icons ekle - gerçek projede bunu package.json'a ekleyip npm/yarn ile indirin
import 'bootstrap-icons/font/bootstrap-icons.css'

// Performans izleme - sadece geliştirme modunda
if (process.env.NODE_ENV === 'development') {
  console.log('Market Veri İzleyici - Geliştirme Modu')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
