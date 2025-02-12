import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // ✅ Ensures it listens on all network interfaces
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080, // ✅ Use Azure's assigned port if available
    historyApiFallback: true, // ✅ Ensures React Router handles deep routes (fixes 404 errors on refresh)
  },
  plugins: [
    react(), // ✅ Keeps React SWC for faster build times
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ Allows `@/` to map to `src/`
    },
  },
  build: {
    outDir: "dist", // ✅ Ensures build output goes to `dist/`
  },
  preview: {
    port: process.env.PREVIEW_PORT ? parseInt(process.env.PREVIEW_PORT) : 8080, // ✅ Use Azure's assigned preview port if available
    historyApiFallback: true, // ✅ Ensures deep links work in preview mode
  },
}));
