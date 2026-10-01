import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import gsap from 'gsap'
import App from './App.tsx'

// Nonaktifkan warning console jika target animasi GSAP belum ter-mount di DOM
gsap.config({ nullTargetWarn: false });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
