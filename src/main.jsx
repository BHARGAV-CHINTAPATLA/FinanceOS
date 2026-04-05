import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FinanceDashboard from './FinanceDashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FinanceDashboard />
  </StrictMode>,
)
