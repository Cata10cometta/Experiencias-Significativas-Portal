import React, { useState } from "react";
import Joyride from "react-joyride";
import { resetPasswordTourSteps, resetPasswordTourLocale, resetPasswordTourStyles } from "../features/onboarding/resetPasswordTour";
import flecha from "/images/flecha.svg";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { hasTourBeenSeen, markTourSeen } from "../shared/utils/tourStorage";

const ResetPassword: React.FC = () => {
  const [runTour, setRunTour] = useState(false);
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(Array(6).fill("")); 
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);

  // Validaciones de la contraseña
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);


  // Volver al paso 1 limpiando 
  const goBackToStep1 = () => {
    setPassword("");
    setCode(Array(6).fill(""));
    setStep(1);
  };

  // Volver al paso 2 desde step 3
  const goBackToStep2 = () => {
    setPassword("");
    setCode(Array(6).fill(""));
    setStep(2);
  };

  // Manejo de los cuadritos del código
  const handleCodeChange = (value: string, index: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Enfocar el siguiente cuadro si existe
    if (value && index < code.length - 1) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    }
  };

  const sendForgotPasswordEmail = async () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
    const endpoint = `${API_BASE}/api/User/forgot-password`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Error al enviar el correo");

      const data = await response.text();
      console.log("Respuesta del servidor:", data);

      Swal.fire({
        title: "Éxito",
        text: data,
        icon: "success",
        confirmButtonText: "Continuar",
      }).then(() => setStep(2)); // Ir al paso 2
    } catch (err) {
      console.error("Error al enviar el correo:", err);

      Swal.fire({
        title: "Error",
        text: "No se pudo enviar el correo. Verifique el correo ingresado.",
        icon: "error",
      });
    }
  };

  const navigate = useNavigate(); // Hook para redirigir

  const resetPassword = async () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
    const endpoint = `${API_BASE}/api/User/reset-password`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: code.join(""), // Convertir el array de código en un string
          newPassword: password,
        }),
      });

      if (!response.ok) throw new Error("Error al cambiar la contraseña");

      const data = await response.text();
      console.log("Respuesta del servidor:", data);

      Swal.fire({
        title: "Éxito",
        text: "Contraseña cambiada exitosamente.",
        icon: "success",
        confirmButtonText: "Continuar",
      }).then(() => navigate("/login")); // Redirigir al login
    } catch (err) {
      console.error("Error al cambiar la contraseña:", err);

      Swal.fire({
        title: "Error",
        text: "No se pudo cambiar la contraseña. Verifique los datos ingresados.",
        icon: "error",
      });
    }
  };

  const resendCode = async () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
    const endpoint = `${API_BASE}/api/User/forgot-password`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Error al reenviar el código");

      const data = await response.text();
      console.log("Código reenviado:", data);

      Swal.fire({
        title: "Éxito",
        text: "Código reenviado exitosamente.",
        icon: "success",
        confirmButtonText: "Continuar",
      });
    } catch (err) {
      console.error("Error al reenviar el código:", err);

      Swal.fire({
        title: "Error",
        text: "No se pudo reenviar el código. Verifique el correo ingresado.",
        icon: "error",
      });
    }
  };

  React.useEffect(() => {
    if (!hasTourBeenSeen("resetPasswordTourDone")) {
      const timer = window.setTimeout(() => setRunTour(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#383855] from-17% to-[#4343CD] to-75% text-white overflow-x-hidden">
      <Joyride
        steps={resetPasswordTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={resetPasswordTourLocale}
        styles={resetPasswordTourStyles}
        disableScrolling={true}
        spotlightClicks={true}
        callback={data => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunTour(false);
            markTourSeen("resetPasswordTourDone");
          }
        }}
      />
      <header className="flex items-center justify-end px-8 py-5 relative z-30 reset-header">
        <div className="flex items-center space-x-2!">
          <button
            className="px-3 py-2 rounded-lg! bg-gray-600 text-white font-semibold shadow-sm text-base reset-help"
            onClick={() => {
              setRunTour(true);
              markTourSeen("resetPasswordTourDone");
            }}
          >
            Ayuda
          </button>
        </div>
      </header>
      <main className="relative flex flex-col lg:flex-row items-center lg:items-start px-2 sm:px-4 md:px-6 lg:px-8 py-4 lg:py-8 min-h-screen pb-48 sm:pb-56 md:pb-72 lg:pb-96">
        <section className="z-20 w-full flex flex-col justify-start -mt-12 sm:-mt-20 lg:-mt-28 lg:-ml-40 xl:-ml-52 2xl:-ml-64">
          <div className={`relative ${step === 3 ? 'w-full max-w-[90vw] sm:max-w-[450px] md:max-w-[500px] lg:max-w-[550px]' : 'w-full max-w-[92vw] sm:max-w-[500px] md:max-w-[560px] lg:max-w-[620px]'} mx-auto lg:mx-0`}>
          <div className="absolute -inset-1 bg-white/10 blur-md opacity-90 pointer-events-none" />

          <div className={`relative bg-[#1b1333] ${step === 3 ? 'rounded-lg shadow-lg p-6 sm:p-8 md:p-12 lg:p-16 border border-white/8' : 'rounded-2xl shadow-2xl shadow-[0_16px_56px_rgba(2,6,23,0.6)] p-6 sm:p-8 md:p-12 lg:p-16 border border-white/10'} w-full backdrop-blur-md flex flex-col justify-center`}>
            <div className="w-full max-w-none">
              {/* Flecha / volver (esquina superior izquierda) */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-40 reset-header">
                {step === 1 ? (
                  <Link to="/login" aria-label="Volver al login">
                    <img src={flecha} alt="Volver" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 cursor-pointer shadow-md" />
                  </Link>
                ) : step === 2 ? (
                  <img src={flecha} alt="Volver" onClick={goBackToStep1} className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 cursor-pointer shadow-md" />
                ) : (
                  <img src={flecha} alt="Volver" onClick={goBackToStep2} className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 cursor-pointer shadow-md" />
                )}
              </div>

              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight font-extrabold text-orange-400 text-left mt-12 sm:mt-16 lg:mt-20 mb-4 sm:mb-6 lg:mb-8">{step === 1 ? "Restaurar contraseña" : step === 2 ? "Crea una nueva contraseña" : "Solicitar nuevo código"}</h2>

              {/* Pasos */}
              {step !== 3 && (
                <div className="flex items-center justify-center gap-3 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full font-bold text-lg sm:text-xl lg:text-2xl ${step === 1 ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-black"}`}>1</div>
                  <div className="w-10 sm:w-14 lg:w-20 border-t border-gray-400" />
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full font-bold text-lg sm:text-xl lg:text-2xl ${step === 2 ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-black"}`}>2</div>
                </div>
              )}

              {/* Paso 1 */}
              {step === 1 && (
                <>
                  <p className="py-4 sm:py-6 lg:py-8 text-sm sm:text-base md:text-lg text-slate-300 mb-4 sm:mb-6 lg:mb-10">Ingresa el correo registrado para enviarte un código de verificación.</p>

                  <div className="text-left mb-6 sm:mb-8 lg:mb-12 reset-email">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 lg:py-5 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm sm:text-base md:text-lg shadow-lg"
                    />
                  </div>

                  <button onClick={sendForgotPasswordEmail} className="w-full bg-orange-400 text-white py-3 sm:py-4 lg:py-5 rounded-xl! font-extrabold text-sm sm:text-base lg:text-lg mt-4 sm:mt-6 lg:mt-8 mb-4 sm:mb-6 lg:mb-8 shadow-lg hover:bg-orange-500 transition-colors reset-send-code">Enviar código</button>
                </>
              )}

              {/* Paso 2 */}
              {step === 2 && (
                <>
                  <p className="text-xs sm:text-sm md:text-base text-slate-300 mb-4 sm:mb-6 lg:mb-8">Ingresa el código que te enviamos a tu correo y crea tu nueva contraseña.</p>

                  <div className="flex justify-center gap-1.5 sm:gap-2 lg:gap-3 mb-6 sm:mb-8 lg:mb-10 reset-code-inputs">
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        id={`code-input-${i}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(e.target.value, i)}
                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border rounded-full text-center text-base sm:text-lg lg:text-xl focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-gray-700 shadow-sm"
                      />
                    ))}
                  </div>

                  <div className="text-right -mb-2 relative z-10">
                    <button onClick={() => setStep(3)} className="text-xs sm:text-sm text-orange-300 hover:underline reset-resend">Reenviar Código</button>
                  </div>
                    <div className="text-left mb-4 sm:mb-6 mt-4 sm:mt-6 relative reset-password-input">
                      <label className="block text-xs sm:text-sm md:text-base text-slate-300 mb-2 sm:mb-3">Contraseña</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=""
                        className={`w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-3 sm:py-4 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm sm:text-base md:text-lg transition-shadow duration-200 ${flash ? 'ring-4 ring-orange-300/40' : ''} shadow-sm`}
                      />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassword(prev => !prev);
                        setFlash(true);
                        window.setTimeout(() => setFlash(false), 260);
                      }}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-4 sm:right-6 top-[56%] -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <span className={`inline-block transition-transform duration-200 ${showPassword ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a18.84 18.84 0 014.28-5.11M6.6 6.6A9.97 9.97 0 0112 5c7 0 10 7 10 7a18.8 18.8 0 01-3.56 4.68M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </div>

                  <ul className="text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-6 list-disc list-inside text-slate-300 space-y-1">
                    <li className={hasUpperLower ? "text-green-500" : "text-red-400"}>Al menos una mayúscula y una minúscula</li>
                    <li className={hasMinLength ? "text-green-500" : "text-red-400"}>Mínimo 8 caracteres</li>
                    <li className={hasNumber ? "text-green-500" : "text-red-400"}>Al menos un número</li>
                    <li className={hasSpecialChar ? "text-green-500" : "text-red-400"}>Al menos un carácter especial (e.g., !@#$%^&*)</li>
                  </ul>

                  <button disabled={!(hasUpperLower && hasNumber && hasMinLength)} onClick={resetPassword} className={`w-full py-3 sm:py-4 lg:py-5 rounded-xl! font-extrabold text-sm sm:text-base lg:text-lg mt-4 sm:mt-6 lg:mt-8 mb-4 sm:mb-6 transition ${hasUpperLower && hasNumber && hasMinLength ? 'bg-orange-400 text-white hover:bg-orange-500 shadow-lg reset-submit' : 'bg-gray-300 text-gray-600 cursor-not-allowed reset-submit'}`}>Cambiar Contraseña</button>
                </>
              )}

              {/* Paso 3 */}
              {step === 3 && (
                <>
                  <p className="py-4 sm:py-6 lg:py-8 text-sm sm:text-base md:text-lg text-slate-300 mb-4 sm:mb-6 lg:mb-10 text-left">Ingresa el correo registrado para reenviarte un nuevo código de verificación.</p>

                  <div className="w-full mb-6 sm:mb-8 lg:mb-10 reset-email">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo electrónico"
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 lg:py-5 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm sm:text-base md:text-lg"
                    />
                  </div>

                  <button onClick={resendCode} className="w-full bg-orange-400 text-white py-3 sm:py-4 lg:py-5 rounded-xl! font-extrabold text-sm sm:text-base lg:text-lg shadow-md hover:bg-orange-500 mb-4 sm:mb-6 lg:mb-8 reset-send-code">Enviar</button>
                </>
              )}
            </div>
          </div>
          </div>
        </section>

        {/* Cohete fijo alineado con la ola blanca */}
        <div className="hidden lg:block fixed z-20 right-[1%] xl:right-[3%] 2xl:right-[5%]" style={{ bottom: 'calc(-80px + 180px)' }} aria-hidden>
          <img
            src="/images/Cohete.png"
            alt="Cohete ilustración"
            className="w-auto h-[500px] xl:h-[700px] 2xl:h-[920px] object-contain drop-shadow-2xl"
          />
        </div>

        {/* Línea blanca ondulada - fija en la parte inferior */}
        <div className="fixed left-0 w-full pointer-events-none z-10" style={{ bottom: '-80px' }} aria-hidden>
          <img
            src="/images/Smoke.svg"
            alt="Línea blanca ondulada"
            className="w-full h-[180px] sm:h-[220px] md:h-[300px] lg:h-[500px] xl:h-[550px] 2xl:h-[600px] block"
            style={{ maxWidth: 'none' }}
            draggable="false"
          />
        </div>
        
      </main>
    </div>
  );
};

export default ResetPassword;
