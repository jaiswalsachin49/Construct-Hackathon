import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App";
import useAuthStore from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Ensure auth store hydrates (loads persisted token/user) before rendering
try {
  if (useAuthStore?.getState()?.hydrateAuth) {
    useAuthStore.getState().hydrateAuth();
  }
} catch (e) {
  // Non-fatal — ProtectedRoute will handle verification
  console.warn('Auth hydrate failed:', e);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
