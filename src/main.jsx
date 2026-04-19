import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

// Remove the HTML loader once React has painted
requestAnimationFrame(() => {
  const loader = document.getElementById('root-loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 350);
  }
});
