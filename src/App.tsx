import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import ContactDetails from "./pages/ContactDetails";

// If your function app is "az-pg-py-functions", set in your .env:
// VITE_API_BASE_URL="https://az-pg-py-functions.azurewebsites.net/api"
// For local dev, fallback to "http://localhost:7071/api"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7071/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index apiBase={API_BASE_URL} />} />
          <Route path="/admin" element={<Admin apiBase={API_BASE_URL} />} />
          <Route path="/contact/view" element={<ContactDetails apiBase={API_BASE_URL} />} />
          <Route path="/past-conversations" element={<div>Past Conversations - Coming Soon</div>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
