// src/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardTeacher from "./pages/DashboardTeacher";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword";
import React, { useEffect } from "react";
// @ts-ignore: missing type declarations for JS module
import { startNotificationsHub, stopNotificationsHub } from "./shared/Service/notificationsHub";

interface NotificationPayload {
  Title: string;
  ExperienceName: string;
  CreatedBy: string;
}

const AppRoutes = () => {
  useEffect(() => {
    startNotificationsHub((notification: NotificationPayload) => {
      alert(`${notification.Title}: ${notification.ExperienceName} por ${notification.CreatedBy}`);
    });
    return () => stopNotificationsHub();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute role="admin"><DashboardAdmin /></ProtectedRoute>} />
        <Route path="/dashboardTeacher" element={<ProtectedRoute role="teacher"><DashboardTeacher /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
