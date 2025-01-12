import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useAuthStore } from './store/authStore';
import App from './App.tsx';
import './index.css';

// Initialize auth before rendering
const init = async () => {
  await useAuthStore.getState().initializeAuth();
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

init().catch(console.error);
