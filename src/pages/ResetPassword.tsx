import React, { useState } from "react";
import flecha from "../../public/images/flecha.png";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ResetPassword: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1033] to-[#17132a] text-white overflow-hidden">
      <main className="relative flex flex-col lg:flex-row items-center lg:items-stretch px-8 lg:px-16 py-0 lg:py-4 h-[560px] mt-[0px]">
        <section className="z-20 max-w-2xl lg:flex-1 flex flex-col justify-center mt-100 ml-[190px]">
          <div className={`relative ${step === 3 ? 'w-[520px] sm:w-[560px] md:w-[600px] mx-auto' : 'w-[640px] sm:w-[720px] md:w-[820px]'} max-w-full`}>
          <div className="absolute -inset-1 bg-white/10 blur-md opacity-90 pointer-events-none" />

          <div className={`relative bg-[#1b1333] ${step === 3 ? 'rounded-lg shadow-lg p-8 sm:p-10 md:p-12 min-h-[360px] sm:min-h-[420px] md:min-h-[480px] border border-white/8' : 'rounded-2xl shadow-2xl shadow-[0_16px_56px_rgba(2,6,23,0.6)] p-16 sm:p-20 md:p-24 border border-white/10 min-h-[760px] sm:min-h-[840px] md:min-h-[920px]'} w-full backdrop-blur-md flex flex-col justify-center`}> 
            <div className="w-full max-w-none">
              {/* Flecha / volver (esquina superior izquierda) */}
              <div className="absolute top-6 left-6 z-40">
                {step === 1 ? (
                  <Link to="/login" aria-label="Volver al login">
                    <img src={flecha} alt="Volver" className="w-16 h-16 rounded-lg bg-orange-400 p-2 cursor-pointer shadow-md" />
                  </Link>
                ) : step === 2 ? (
                  <img src={flecha} alt="Volver" onClick={goBackToStep1} className="w-16 h-16 rounded-lg bg-orange-400 p-2 cursor-pointer shadow-md" />
                ) : (
                  <img src={flecha} alt="Volver" onClick={goBackToStep2} className="w-16 h-16 rounded-lg bg-orange-400 p-2 cursor-pointer shadow-md" />
                )}
              </div>

              <h2 className="text-5xl sm:text-6xl md:text-7xl leading-tight font-extrabold text-orange-400 text-left mt-20! mb-8 justify-center!">{step === 1 ? "Restaurar contraseña" : step === 2 ? "Crea una nueva contraseña" : "Solicitar nuevo código"}</h2>

              {/* Pasos */}
              {step !== 3 && (
                <div className="flex items-center justify-center gap-8 mb-10">
                  <div className={`w-20 h-20 flex items-center justify-center rounded-full font-bold text-4xl ${step === 1 ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-black"}`}>1</div>
                  <div className="w-28 border-t border-gray-400" />
                  <div className={`w-20 h-20 flex items-center justify-center rounded-full font-bold text-4xl ${step === 2 ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-black"}`}>2</div>
                </div>
              )}

              {/* Paso 1 */}
              {step === 1 && (
                <>
                  <p className="py-8 text-2xl sm:text-3xl text-slate-300 mb-10">Ingresa el correo registrado para enviarte un código de verificación.</p>

                  <div className="text-left mb-18">
                    
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3 py-4 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 text-2xl sm:text-3xl shadow-lg"
                    />
                  </div>

                  <button onClick={sendForgotPasswordEmail} className="w-full bg-orange-400 text-white py-7 rounded-xl! font-extrabold text-2xl sm:text-3xl mt-10 shadow-lg hover:bg-orange-500 transition-colors">Enviar código</button>
                </>
              )}

              {/* Paso 2 */}
              {step === 2 && (
                <>
                  <p className="text-base sm:text-lg text-slate-300 mb-6">Ingresa el código que te enviamos a tu correo y crea tu nueva contraseña.</p>

                  <div className="flex justify-center gap-6 mb-10">
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        id={`code-input-${i}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(e.target.value, i)}
                        className="w-20 h-20 border rounded-full text-center text-3xl focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-gray-700 shadow-sm"
                      />
                    ))}
                  </div>

                  <div className="text-right -mb-4">
                    <button onClick={() => setStep(3)} className="text-sm text-orange-300 hover:underline">Reenviar Código</button>
                  </div>
                    <div className="text-left mb-6 mt-6 relative">
                      <label className="block text-base sm:text-base md:text-base text-slate-300 mb-2">Contraseña</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=""
                        className={`w-full pl-4 pr-12 py-3 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 text-xl sm:text-2xl transition-shadow duration-200 ${flash ? 'ring-4 ring-orange-300/40' : ''} shadow-sm`}
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
                      className="absolute right-6 top-[56%] -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <span className={`inline-block transition-transform duration-200 ${showPassword ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a18.84 18.84 0 014.28-5.11M6.6 6.6A9.97 9.97 0 0112 5c7 0 10 7 10 7a18.8 18.8 0 01-3.56 4.68M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </div>

                  <ul className="text-base sm:text-lg mb-6 list-disc list-inside text-slate-300">
                    <li className={hasUpperLower ? "text-green-500" : "text-red-400"}>Al menos una mayúscula y una minúscula</li>
                    <li className={hasMinLength ? "text-green-500" : "text-red-400"}>Mínimo 8 caracteres</li>
                    <li className={hasNumber ? "text-green-500" : "text-red-400"}>Al menos un número</li>
                    <li className={hasSpecialChar ? "text-green-500" : "text-red-400"}>Al menos un carácter especial (e.g., !@#$%^&*)</li>
                  </ul>

                  <button disabled={!(hasUpperLower && hasNumber && hasMinLength)} onClick={resetPassword} className={`w-full py-6 rounded-xl! font-extrabold text-lg sm:text-xl mt-8 transition ${hasUpperLower && hasNumber && hasMinLength ? 'bg-orange-400 text-white hover:bg-orange-500 shadow-lg' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>Cambiar Contraseña</button>
                </>
              )}

              {/* Paso 3 */}
              {step === 3 && (
                <>
                  <p className="py-8 text-2xl sm:text-3xl text-slate-300 mb-10 text-center">Ingresa el correo registrado para reenviarte un nuevo código de verificación.</p>

                  <div className="w-full max-w-[560px] mx-auto mb-8">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo electrónico"
                      className="w-full px-8 py-3 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 text-2xl sm:text-3xl"
                    />
                  </div>

                  <button onClick={resendCode} className="w-full bg-orange-400 text-white py-7 rounded-xl! font-extrabold text-2xl sm:text-3xl shadow-md hover:bg-orange-500">Enviar</button>
                </>
              )}
            </div>
          </div>
          </div>
        </section>

        <aside className="mt-8 lg:mt-0 lg:ml-8 lg:flex-1 flex justify-center items-center relative z-20">
          <div className="max-w-[420px] sm:max-w-[560px] lg:max-w-[920px] w-full relative flex items-center justify-center">
            <img
              src="/images/Cohete.png"
              alt="Cohete ilustración"
              className="w-auto h-[340px] lg:h-[920px] object-contain mx-auto block relative z-30 drop-shadow-2xl mt-130 -translate-x-20"
            />
          </div>
        </aside>

        {/* Línea blanca ondulada debajo del cohete */}
          <div className="absolute left-0 bottom-0 w-full pointer-events-none z-10 overflow-visible" aria-hidden style={{ transform: 'translateY(130%)' }}>
                  <svg viewBox="0 0 1440 320" className="w-full h-[260px] lg:h-[420px] block">
                    <path
                      fill="#ffffff"
                      d="M0,1 C300,40 360,300 510,220 C400,200 600,330 1000,30 C1260,280 1320,180 1440,150 L1440,320 L0,320 Z"
                    ></path>  
                  </svg>
                </div>
        
      </main>
    </div>
  );
};

export default ResetPassword;
