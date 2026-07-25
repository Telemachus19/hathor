import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createRouter,
} from '@tanstack/react-router';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { AuthContextProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { routeTree } from './routeTree.gen.js';
import './index.css';

const router = createRouter({
  routeTree,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContextProvider>
          <RouterProvider router={router} />
        </AuthContextProvider>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);