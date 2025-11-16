import React, { useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import AuthContext from "../../context/AuthContext";

const SessionHandler: React.FC = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const showingRef = useRef(false);

  useEffect(() => {
    const handleExpired = () => {
      if (showingRef.current) return;
      showingRef.current = true;

      // Clear auth storage and show modal
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      try {
        auth?.logout();
      } catch {}

      Swal.fire({
        title: "Sesión expirada",
        text: "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
        icon: "warning",
        confirmButtonText: "Ir al login",
        allowOutsideClick: false,
      }).then(() => {
        showingRef.current = false;
        navigate("/login");
      });
    };

    // Monkey-patch fetch
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      try {
        const res = await originalFetch(...args);
        if (res && (res.status === 401 || res.status === 403)) {
          handleExpired();
        }
        return res;
      } catch (err) {
        // network error, don't treat as session expiry
        throw err;
      }
    };

    // Axios interceptor
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          handleExpired();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // cleanup: restore fetch and eject interceptor
      try {
        window.fetch = originalFetch;
      } catch {}
      try {
        axios.interceptors.response.eject(interceptorId);
      } catch {}
    };
  }, [auth, navigate]);

  return null;
};

export default SessionHandler;
