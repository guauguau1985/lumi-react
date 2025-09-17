//________Envolver App__________________
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { ProgressProvider } from "./state/progress";
import { MoodProvider } from "./state/mood";


console.log("[boot]", window.location.href);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// ...Progresos y desbloqueos___________________
root.render(
  <React.StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </React.StrictMode>
);

// ...Reacciones de lumi__________________________
<ProgressProvider>
  <MoodProvider>
    <App />
  </MoodProvider>
</ProgressProvider>