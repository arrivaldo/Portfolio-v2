import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (no render-blocking request to Google): only the subsets a page uses get downloaded.
import '@fontsource/syne/600.css'
import '@fontsource-variable/fira-code/wght.css'
import '@fontsource-variable/open-sans/wght.css'
import '@fontsource-variable/open-sans/wght-italic.css'
import 'lenis/dist/lenis.css'
import App from './App'
import { LangProvider } from './i18n'
import './index.css'
import './sections.css'
import './lab.css'
import './projects.css'
import './preloader.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
)
