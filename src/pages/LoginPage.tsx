// src/pages/LoginPage.tsx
import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { loginPageTourSteps, loginPageTourStyles, loginPageTourLocale } from "../features/onboarding/loginPageTour";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { login, saveToken } from "../Api/Config/Config";
import { useAuth } from "../hooks/useAuth";

type FormData = {
  username: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();
  // auth context to toggle authenticated state
  const { login: setAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Limpiar token y rol antiguos al entrar a login
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }, []);

  // Eliminar el efecto que muestra la guía automáticamente al cargar la página

  const onSubmit = async (data: FormData) => {
    try {
      const response = await login(data.username, data.password);
      // Si el backend devolvió una respuesta con status=false, mostrar el mensaje
      if (response?.data && response.data.status === false) {
        const serverMsg = response.data.message || "Usuario o contraseña incorrectos";
        Swal.fire({ title: "Error", text: serverMsg, icon: "error" });
        return;
      }
      const apiData = response.data?.data || response.data || response;
      const token = apiData.token || apiData.accessToken || apiData.jwt;
      const userId = apiData.userId || apiData.id || apiData.userID;
      const role = apiData.role || "";
      const userName = apiData.userName || "";
      if (userName) localStorage.setItem("userName", userName);

      if (!token || !userId) {
        Swal.fire({ title: "Error", text: "Usuario o contraseña incorrectos", icon: "error" });
        return;
      }

      saveToken(token, 60);
      localStorage.setItem("userId", userId.toString());
      if (role) localStorage.setItem("role", role);

      // notify AuthContext that user is authenticated so Protected routes allow navigation
      try {
        setAuthenticated();
      } catch (e) {
        console.warn("No se pudo actualizar el contexto de autenticación:", e);
      }

      const personData = {
        nombre: apiData.userName || "",
        correo: apiData.email || "",
        cargo: role,
        documento: apiData.personId || "",
        telefono: "",
      };
      localStorage.setItem("person", JSON.stringify(personData));

      Swal.fire({ title: "Éxito", text: "Has iniciado sesión correctamente", icon: "success", confirmButtonText: "Continuar" })
        .then(() => {
          // Redirect based on role (safe checks)
          try {
            if (Array.isArray(role)) {
              const lowerRoles = role.map((r: string) => String(r).toLowerCase());
              if (lowerRoles.includes("profesor") || lowerRoles.includes("teacher")) {
                navigate("/dashboardTeacher");
                return;
              }
            } else if (typeof role === "string") {
              const r = role.toLowerCase();
              if (r.includes("profesor") || r.includes("teacher")) {
                navigate("/dashboardTeacher");
                return;
              }
            }
          } catch (e) {
            // fallback
          }

          navigate("/dashboard");
        });
    } catch (err: any) {
      // Si el error es de referencia nula o similar, mostrar mensaje claro en español
      const msg = (err?.response?.data?.message || err?.response?.data || err?.message || "").toString();
      if (
        msg.includes("Object reference not set to an instance of an object") ||
        msg.toLowerCase().includes("not set to an instance") ||
        msg.toLowerCase().includes("nullreferenceexception")
      ) {
        Swal.fire({
          title: "Usuario no registrado",
          text: "El usuario no existe en el sistema. Por favor regístrate para crear una cuenta.",
          icon: "error",
          confirmButtonText: "Registrarme",
          showCancelButton: true,
          cancelButtonText: "Cerrar",
          customClass: {
            confirmButton: 'rounded-full px-6 py-2',
            cancelButton: 'rounded-full px-6 py-2'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/register');
          }
        });
      } else {
        Swal.fire({
          title: "Usuario no registrado",
          text: msg || "El usuario no existe en el sistema. Por favor regístrate para crear una cuenta.",
          icon: "error",
          confirmButtonText: "Registrarme",
          showCancelButton: true,
          cancelButtonText: "Cerrar",
          customClass: {
            confirmButton: 'rounded-full px-6 py-2',
            cancelButton: 'rounded-full px-6 py-2'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/register');
          }
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1033] to-[#17132a] text-white overflow-hidden">
      <Joyride
        steps={loginPageTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={loginPageTourLocale}
        styles={loginPageTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunTour(false);
            localStorage.setItem("loginPageTourDone", "true");
          }
        }}
      />
      <header className="flex items-center justify-end px-8 py-5 relative z-30">
        <div className="flex items-center space-x-2!">
          <button
            className="btn-ayuda px-3 py-2 rounded-lg! bg-gray-600 text-white font-semibold shadow-sm text-base"
            onClick={() => {
              setRunTour(true);
              localStorage.removeItem("loginPageTourDone");
            }}
          >
            Ayuda
          </button>
          <button className="btn-register px-4 py-2 rounded-lg! bg-blue-500 text-white font-semibold shadow-md text-base" onClick={() => navigate('/register')}>Registrate</button>
        </div>
      </header>

      <main className="relative flex flex-col lg:flex-row items-center lg:items-stretch px-8 lg:px-16 py-0 lg:py-4 h-[560px] mt-[0px]">


        {/* Stars background - absolutely positioned small dots with varying sizes */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-3 h-3 hidden sm:block" style={{ top: '6%', left: '12%' }} />
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-4 h-4 hidden sm:block" style={{ top: '10%', left: '30%' }} />
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-3 h-3" style={{ top: '14%', left: '52%' }} />
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-4 h-4 hidden sm:block" style={{ top: '8%', left: '72%' }} />
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-3 h-3 hidden md:block" style={{ top: '20%', left: '85%' }} />
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-3 h-3 hidden sm:block" style={{ top: '24%', left: '40%' }} />
        </div>

  <section className="z-20 max-w-2xl lg:flex-1 flex flex-col justify-center mt-50 ml-[190px]">
          <div className="relative w-[520px] sm:w-[500px] md:w-[600px] max-w-full">
            {/* soft glowing outline */}
            <div className="absolute -inset-1 rounded-2xl bg-white/10 blur-md opacity-90 pointer-events-none" />

            <div className="relative bg-[#1b1333] rounded-2xl shadow-2xl shadow-[0_10px_36px_rgba(2,6,23,0.6)] w-full p-12 sm:p-16 md:p-20 border border-white/20 backdrop-blur-md min-h-[520px] sm:min-h-[640px] md:min-h-[760px] flex flex-col justify-center">
              <div className="w-full max-w-none">
                <h2 className="text-5xl! sm:text-6xl md:text-7xl font-extrabold text-orange-400 text-center mb-6 -mt-6!">Iniciar Sesión</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="login-form space-y-6">
                  <div>
                    <label htmlFor="username" className="block text-xl sm:text-4xl md:text-3xl text-slate-300 mb-2">Ingrese el correo electrónico</label>
                    <input
                      id="username"
                      aria-label="Correo"
                      placeholder="Correo"
                      type="text"
                      {...register("username", { required: "El Username es requerido" })}
                      className="w-full px-6 py-4 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 text-2xl sm:text-3xl"
                    />
                    {errors.username && <p className="text-red-500 text-lg mt-1">{errors.username.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xl sm:text-4xl md:text-3xl text-slate-300 mb-2">Ingrese la contraseña</label>
                    <div className="relative">
                      <input
                        id="password"
                        aria-label="Contraseña"
                        placeholder="Contraseña"
                        type={showPassword ? "text" : "password"}
                        {...register("password", { required: "La contraseña es requerida" })}
                        className={`w-full pl-6 pr-14 py-4 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 text-2xl sm:text-3xl transition-shadow duration-200 ${flash ? 'ring-4 ring-orange-300/40' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowPassword(prev => !prev);
                          setFlash(true);
                          // short flash effect
                          window.setTimeout(() => setFlash(false), 260);
                        }}
                        aria-pressed={showPassword}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <span className={`inline-block transition-transform duration-200 ${showPassword ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                        {showPassword ? (
                          /* eye-off icon */
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a18.84 18.84 0 014.28-5.11M6.6 6.6A9.97 9.97 0 0112 5c7 0 10 7 10 7a18.8 18.8 0 01-3.56 4.68M3 3l18 18" />
                          </svg>
                        ) : (
                          /* eye icon */
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                        </span>
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-lg mt-1">{errors.password.message}</p>}
                  </div>

                  <button type="submit" className="w-full bg-orange-400 text-white py-3 rounded-xl! font-extrabold text-3xl! mt-6 shadow-md hover:bg-orange-500 transition-colors">Acceso</button>
                </form>

                <div className="mt-6 text-center text-base">
                  <Link to="/reset-password" className="block text-orange-300 hover:underline mb-2 text-xl md:text-2xl">¿Se te olvidó tu contraseña?</Link>
                  <Link to="/register" className="block text-orange-300 hover:underline text-xl md:text-2xl">Crea tu cuenta</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="mt-8 lg:mt-0 lg:ml-8 lg:flex-1 flex justify-center items-center relative z-20">
            <div className="max-w-[420px] sm:max-w-[560px] lg:max-w-[920px] w-full relative flex items-center justify-center">

            <img
              src="/images/Cohete.png"
              alt="Cohete ilustración"
              className="w-auto h-[340px] lg:h-[920px] object-contain mx-auto block relative z-30 drop-shadow-2xl mt-50 -translate-x-20"
            />
          </div>
        </aside>

        {/* Línea blanca ondulada debajo del cohete - reemplazada por imagen SVG */}
        <div className="absolute left-0 bottom-0 w-full pointer-events-none z-10 overflow-visible" aria-hidden style={{ transform: 'translateY(90%)' }}>
              <img
                src="/images/Smoke.svg"
                alt="Línea blanca ondulada"
                className="w-[180vw] max-w-none h-[260px] lg:h-[420px] block mx-auto -translate-x-[40vw]"
                draggable="false"
              />
        </div>

      </main>
    </div>
  );
};

export default LoginPage;