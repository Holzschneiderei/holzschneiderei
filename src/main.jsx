import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GarderobeWizard from './Konfigurator.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GarderobeWizard />
  </StrictMode>,
)
