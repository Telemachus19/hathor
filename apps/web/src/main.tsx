import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ToastProvider } from './context/ToastContext';
import { routeTree } from './routeTree.gen.js';
import './index.css';

const router = createRouter({
  routeTree,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
);