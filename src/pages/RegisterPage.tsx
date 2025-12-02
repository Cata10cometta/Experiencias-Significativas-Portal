// src/pages/RegisterPage.tsx
import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { registerPageTourSteps, registerPageTourLocale, registerPageTourStyles } from "../features/onboarding/registerPageTour";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerPerson } from "../Api/Services/Register";
import { getEnum } from "../Api/Services/Helper";
import { DataSelectRequest } from "../shared/types/HelperTypes";



const RegisterPage: React.FC = () => {
  const [runTour, setRunTour] = useState(false);
  // ...existing code...
  const [codigoDaneFocus, setCodigoDaneFocus] = useState(false);
  const [emailInstitucionalFocus, setEmailInstitucionalFocus] = useState(false);
  const [PrimerNombre, setNombre] = useState("");
  const [SegundoNombre, setSegundoNombre] = useState("");
  const [PrimerApellido, setPrimerApellido] = useState("");
  const [SegundoApellido, setSegundoApellido] = useState("");
  const [TipoDocumento, setTipoDocumento] = useState("");
  const [NumeroDocumento, setNumeroDocumento] = useState("");
  const [CodigoDane, setCodigoDane] = useState("");
  const [CodigoDaneId, setCodigoDaneId] = useState("");
  const [NombreUsuario, setNombreUsuario] = useState("");
  const [emailInstitucional, setEmailInstitucional] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [documentTypes, setDocumentTypes] = useState<DataSelectRequest[]>([]);
  const [codigoDaneOptions, setCodigoDaneOptions] = useState<DataSelectRequest[]>([]);
  const [emailInstitucionalOptions, setEmailInstitucionalOptions] = useState<DataSelectRequest[]>([]);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchEnums = async () => {
      const documentTypes = await getEnum("DocumentType");
      setDocumentTypes(documentTypes);
      console.log("DocumentTypes recibidos:", documentTypes);

      const emailInstitucionalOptions = await getEnum("EmailInstitucional");
      setEmailInstitucionalOptions(emailInstitucionalOptions);
      console.log("EmailInstitutional recibidos:", emailInstitucionalOptions);

      const codigoDaneOptions = await getEnum("CodeDane");
      setCodigoDaneOptions(codigoDaneOptions);
      console.log("CodeDane recibidos:", codigoDaneOptions);
    };

    fetchEnums();
    // Iniciar el tour automáticamente solo la primera vez
    if (!localStorage.getItem("registerTourDone")) {
      setTimeout(() => setRunTour(true), 600);
    }
  }, []);





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const personPayload = {
      DocumentType: String(TipoDocumento),
      IdentificationNumber: NumeroDocumento,
      FirstName: PrimerNombre,
      MiddleName: SegundoNombre,
      FirstLastName: PrimerApellido,
      SecondLastName: SegundoApellido,
      FullName: `${PrimerNombre} ${SegundoNombre} ${PrimerApellido} ${SegundoApellido}`.trim(),
  CodeDane: CodigoDaneId || CodigoDane,
      Code: CodigoDaneId || CodigoDane,
      Username: NombreUsuario,
      Password: password,
      EmailInstitutional: emailInstitucional,
      Email: email,
      Phone: telefono ? Number(telefono) : 0
    };

    console.log("Enviando /Person/create payload:", personPayload);


    try {
      // Registrar persona (solo /api/Person/create)
      const response = await registerPerson(personPayload);
      console.log("Respuesta de /Person/create:", response);

      // Intentamos extraer un id de persona en la respuesta para validar éxito
      let personId = null;
      if (response && (response.id || response.Id)) {
        personId = response.id || response.Id;
      } else if (response.data && (response.data.id || response.data.Id)) {
        personId = response.data.id || response.data.Id;
      }

      if (personId || response) {
        // Guardar solo el primer nombre en localStorage para mostrarlo en el TopBar
        localStorage.setItem("userName", PrimerNombre);
        // Guardar los datos de la persona en localStorage para auto-llenar otros formularios
        localStorage.setItem("person", JSON.stringify({
          FirstName: PrimerNombre,
          SecondName: SegundoNombre,
          FirstLastName: PrimerApellido,
          SecondLastName: SegundoApellido,
          IdentificationNumber: NumeroDocumento,
          Email: email,
          EmailInstitutional: emailInstitucional,
          Phone: telefono,
          CodeDane: CodigoDane
        }));

        Swal.fire({
          title: "Registro Exitoso",
          icon: "success",
          text: "La persona fue creada correctamente",
          confirmButtonText: "Iniciar sesión",
        }).then(() => {
          navigate("/login");
        });
        // Marcar el tour como completado
        localStorage.setItem("registerTourDone", "true");
      } else {
        Swal.fire({
          title: "Error",
          icon: "error",
          text: "No se pudo registrar la persona",
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: err.response?.data?.message || err.message || "Error desconocido",
      });
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-b from-[#0b1033] to-[#17132a] text-white overflow-hidden">
      <Joyride
        steps={registerPageTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={registerPageTourLocale}
        styles={registerPageTourStyles}
        disableScrolling={true}
        spotlightClicks={true}
        callback={data => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunTour(false);
            localStorage.setItem("registerTourDone", "true");
          }
        }}
      />
      <header className="flex items-center justify-end px-8 py-5 relative z-30 register-header">
        <div className="flex items-center space-x-2!">
          <button
            className="px-3 py-2 rounded-lg! bg-gray-600 text-white font-semibold shadow-sm text-base register-help"
            onClick={() => {
              setRunTour(true);
              localStorage.removeItem("registerTourDone");
            }}
          >
            Ayuda
          </button>
          <button className="px-4 py-2 rounded-lg! bg-orange-400 text-white font-semibold shadow-md text-base" onClick={() => navigate('/login')}>Inicio de sesión</button>
        </div>
      </header>

      <main className="relative flex flex-col lg:flex-row items-center lg:items-stretch px-8 lg:px-16 py-0 lg:py-4 h-[560px] mt-0">

        {/* Stars background */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-3 h-3 hidden sm:block" style={{ top: '6%', left: '12%' }} />
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-4 h-4 hidden sm:block" style={{ top: '10%', left: '30%' }} />
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-3 h-3" style={{ top: '14%', left: '52%' }} />
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-4 h-4 hidden sm:block" style={{ top: '8%', left: '72%' }} />
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-3 h-3 hidden md:block" style={{ top: '20%', left: '85%' }} />
          <img src="/images/Star%2014.png" aria-hidden alt="" className="absolute w-3 h-3 hidden sm:block" style={{ top: '24%', left: '40%' }} />
        </div>

  <section className="z-20 max-w-3xl lg:flex-1 flex flex-col justify-center mt-50! sm:mt-16 lg:mt-20 lg:ml-[120px]">
          <div className="relative w-[640px] sm:w-[700px] md:w-[760px] max-w-full">
            <div className="absolute -inset-1 rounded-3xl bg-white/10 blur-md opacity-90 pointer-events-none" />

            <div className="relative bg-[#1b1333] rounded-3xl shadow-[0_20px_60px_rgba(2,6,23,0.7)] w-full p-8 sm:p-10 md:p-14 border border-white/20 backdrop-blur-md min-h-[420px] sm:min-h-[520px] md:min-h-[600px] flex flex-col justify-center overflow-visible">
              {/* soft drop shadow under card to mimic floating look */}
              <div className="absolute -bottom-6 left-6 right-6 h-8 bg-black/40 rounded-2xl blur-md opacity-60 pointer-events-none" />
              <div className="w-full max-w-none">
                <h2 className="text-6xl sm:text-7xl md:text-7xl font-extrabold text-orange-400 text-center mb-6">Registro</h2>

                <form onSubmit={handleSubmit} className="space-y-6 register-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Primer Nombre:</label>
                      <input
                        type="text"
                        value={PrimerNombre}
                        onChange={(e) => {
                          const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                          if (regex.test(e.target.value)) {
                            setNombre(e.target.value);
                          }
                        }}
                        required
                        className="w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Segundo Nombre:</label>
                      <input
                        type="text"
                        value={SegundoNombre}
                        onChange={(e) => {
                          const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                          if (regex.test(e.target.value)) {
                            setSegundoNombre(e.target.value);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Primer Apellido:</label>
                      <input
                        type="text"
                        value={PrimerApellido}
                        onChange={(e) => {
                          const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                          if (regex.test(e.target.value)) {
                            setPrimerApellido(e.target.value);
                          }
                        }}
                        required
                        className="w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Segundo Apellido:</label>
                      <input
                        type="text"
                        value={SegundoApellido}
                        onChange={(e) => {
                          const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
                          if (regex.test(e.target.value)) {
                            setSegundoApellido(e.target.value);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Tipo de Documento:</label>
                      <select
                        value={TipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl"
                      >
                        <option value="">Seleccione...</option>
                        {documentTypes.map((doc) => (
                          <option key={doc.id} value={doc.id} style={{ color: '#111827' }}>
                            {String (doc.displayText ? doc.displayText : doc.id)}
                          </option>
                        ))}
                      </select>
                        {documentTypes.length === 0 && (
                          <p className="text-sm text-red-400 mt-1">No se cargaron opciones de tipo de documento (revisa consola o la API)</p>
                        )}
                    </div>

                    <div>
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Número de Documento:</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={NumeroDocumento}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          if (val.length <= 10) setNumeroDocumento(val);
                        }}
                        required
                        minLength={8}
                        maxLength={10}
                        className={`mt-1 block w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl placeholder:text-sm ${NumeroDocumento.length < 8 || NumeroDocumento.length > 10 ? "placeholder-red-500" : "placeholder-green-600"}`}
                        placeholder={`${NumeroDocumento.length} / 8-10 `}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative register-dane">
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Código DANE:</label>
                      <input
                        type="text"
                        value={CodigoDane}
                        onChange={e => setCodigoDane(e.target.value)}
                        onFocus={() => setCodigoDaneFocus(true)}
                        onBlur={() => setTimeout(() => setCodigoDaneFocus(false), 100)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl"
                        placeholder="Seleccione o escriba..."
                        autoComplete="off"
                      />
                      {codigoDaneFocus && (
                        <ul className="absolute left-0 z-10 bg-white border border-gray-300 rounded-md w-full mt-1 max-h-40 overflow-y-auto shadow-lg text-black" style={{ minWidth: '100%' }}>
                          {(CodigoDane
                            ? codigoDaneOptions.filter(opt => String(opt.id).toLowerCase().includes(CodigoDane.toLowerCase()))
                            : codigoDaneOptions
                          ).map(opt => (
                            <li
                              key={opt.id}
                              className="px-3 py-2 cursor-pointer hover:bg-indigo-100 text-black"
                              onMouseDown={() => { setCodigoDane(String(opt.id)); setCodigoDaneId(String(opt.id)); setCodigoDaneFocus(false); }}
                            >
                              {String(opt.id )}
                            </li>
                          ))}
                          {(CodigoDane && codigoDaneOptions.filter(opt => opt.displayText.toLowerCase().includes(CodigoDane.toLowerCase())).length === 0) && (
                            <li className="px-3 py-2 text-gray-400">Sin coincidencias</li>
                          )}
                        </ul>
                      )}
                    </div>

                    <div>
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Nombre de Usuario:</label>
                      <input
                        type="text"
                        value={NombreUsuario}
                        onChange={(e) => setNombreUsuario(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative register-email-institucional">
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Correo de la Institucion:</label>
                      <input
                        type="text"
                        value={emailInstitucional}
                        onChange={e => setEmailInstitucional(e.target.value)}
                        onFocus={() => setEmailInstitucionalFocus(true)}
                        onBlur={() => setTimeout(() => setEmailInstitucionalFocus(false), 100)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl"
                        placeholder="Seleccione o escriba..."
                        autoComplete="off"
                      />
                      {emailInstitucionalFocus && (
                        <ul className="absolute left-0 z-10 bg-white border border-gray-300 rounded-md w-full mt-1 max-h-40 overflow-y-auto shadow-lg text-black" style={{ minWidth: '100%' }}>
                          {(emailInstitucional
                            ? emailInstitucionalOptions.filter(opt => opt.displayText.toLowerCase().includes(emailInstitucional.toLowerCase()))
                            : emailInstitucionalOptions
                          ).map(opt => (
                            <li
                              key={opt.id}
                              className="px-3 py-2 cursor-pointer hover:bg-indigo-100 text-black"
                              onMouseDown={() => { setEmailInstitucional(opt.displayText); setEmailInstitucionalFocus(false); }}
                            >
                              {String(opt.displayText )}
                            </li>
                          ))}
                          {(emailInstitucional && emailInstitucionalOptions.filter(opt => opt.displayText.toLowerCase().includes(emailInstitucional.toLowerCase())).length === 0) && (
                            <li className="px-3 py-2 text-gray-400">Sin coincidencias</li>
                          )}
                        </ul>
                      )}
                    </div>

                    <div>
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Correo Personal:</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Teléfono:</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={telefono}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          if (val.length <= 10) setTelefono(val);
                        }}
                        required
                        maxLength={10}
                        className={`mt-1 block w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl placeholder:text-sm ${telefono.length !== 10 ? "placeholder-red-500" : "placeholder-green-600"}`}
                        placeholder={`${telefono.length} / 10 `}
                      />
                    </div>

                    <div className="relative register-password">
                      <label className="block text-base sm:text-lg md:text-xl text-slate-300 mb-2">Contraseña:</label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className={`mt-1 block w-full border border-gray-300 rounded-full pl-4 pr-14 py-2 shadow-sm focus:ring-orange-300 focus:border-orange-300 bg-white text-black text-lg sm:text-xl transition-shadow duration-200 ${flash ? 'ring-4 ring-orange-300/40' : ''}`}
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
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none flex items-center justify-center"
                          style={{ height: '2.5rem', width: '2.5rem' }}
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
                    </div>
                  </div>

                  <div className="mt-6 justify-center flex">
                    <button type="submit" className="w-full max-w-md mx-auto bg-orange-400 text-white py-3 rounded-xl! font-extrabold text-xl shadow-md hover:bg-orange-500 transition-colors register-submit">Registrarse</button>
                  </div>
                </form>

                <div className="mt-6 text-center text-base">
                  <a href="/login" className="block text-orange-300 hover:underline text-lg md:text-xl">¿Quieres iniciar sesión?</a>
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

        {/* Línea blanca ondulada debajo del cohete */}
          <div className="absolute left-0 bottom-0 w-full pointer-events-none z-10 overflow-visible" aria-hidden style={{ transform: 'translateY(90%)' }}>
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

export default RegisterPage;


