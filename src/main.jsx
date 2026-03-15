import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import QuestMaze from './QuestMaze.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"     element={<App />} />
        <Route path="/maze" element={<QuestMaze />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)