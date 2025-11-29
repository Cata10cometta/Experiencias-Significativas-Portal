// src/main.tsx
import ReactDOM from "react-dom/client";
import "./index.css";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  
);
