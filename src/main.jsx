import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './konfigurator.css'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'
import GarderobeWizard from './Konfigurator.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GarderobeWizard />
    </ErrorBoundary>
  </StrictMode>,
)
