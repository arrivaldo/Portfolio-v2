import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import App from './App'
import { LangProvider } from './i18n'
import './index.css'
import './sections.css'
import './lab.css'
import './preloader.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
)
