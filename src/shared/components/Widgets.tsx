// src/components/Widgets.tsx
import React, { useState, useRef, useMemo } from "react";
import Joyride from "react-joyride";

import ExperienceModal from "../../features/experience/components/ExperienceModal";
import NotificationsModal from './NotificationsModal';
import { widgetsTourSteps, widgetsTourStyles, widgetsTourLocale } from "../../features/onboarding/widgetsTour";
import { hasTourBeenSeen, markTourSeen } from "../utils/tourStorage";

const Widgets: React.FC = () => {
  const tourKey = "widgetsTourDone";
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [selectedEje, setSelectedEje] = useState<number | null>(null);
  const [experiencias, setExperiencias] = useState<any[]>([]); // de getAll
  const [lineaExperiencias, setLineaExperiencias] = useState<any[]>([]); // de getAll line thematic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notifModalOpen, setNotifModalOpen] = useState<boolean>(false);
  const [notifCount, setNotifCount] = useState<number>(0);
  const [runWidgetsTour, setRunWidgetsTour] = useState(false);

  

  // Cargar todas las experiencias al montar
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/Experience/getAll", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          setExperiencias(data.data);
        } else {
          setExperiencias([]);
        }
      });
  }, []);

  // Cargar experiencias por línea temática al cambiar eje
  React.useEffect(() => {
    if (selectedEje === null) {
      setLineaExperiencias([]);
      return;
    }
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    fetch("/api/ExperienceLineThematic/getAll", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          setLineaExperiencias(data.data.filter((item: any) => item.lineThematicId === selectedEje));
        } else {
          setLineaExperiencias([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar experiencias");
        setLoading(false);
      });
  }, [selectedEje]);

  React.useEffect(() => {
    if (!hasTourBeenSeen(tourKey)) {
      const timer = window.setTimeout(() => setRunWidgetsTour(true), 800);
      return () => window.clearTimeout(timer);
    }
  }, [tourKey]);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const ejes = [
    { id: 1, label: "Educación Ambiental", img: "/images/EducacionAmbiental.png", imgClass: "w-15" },
    { id: 2, label: "Ciencia y Tecnología", img: "/images/Ciencia.png", imgClass: "w-20" },
    { id: 3, label: "Interculturalidad Bilingüismo", img: "/images/books.png", imgClass: "w-15" },
    { id: 4, label: "Arte, Cultura y Patrimonio", img: "/images/Arte.png", imgClass: "w-20" },
    { id: 5, label: "Habilidades Comunicativas", img: "/images/Habilidades.png", imgClass: "w-15" },
    { id: 6, label: "Acádemica Curricular", img: "/images/Acádemica.png", imgClass: "w-15" },
    { id: 7, label: "Inclusión Diversidad", img: "/images/inclusion.png", imgClass: "w-15" },
    { id: 8, label: "Convivencia Escolar (Ciencias Sociales y Políticas)", img: "/images/convivencia.png", imgClass: "w-15" },
    { id: 9, label: "Danza, Deporte y Recreación", img: "/images/deporte.png", imgClass: "w-20" },
  ];
  // derived filtered list for carousel search (mantener por si se usa searchTerm)
  const filteredExperiencias = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') return experiencias;
    const q = searchTerm.trim().toLowerCase();
    return experiencias.filter((exp: any) => {
      const name = String(exp.nameExperiences ?? exp.title ?? exp.name ?? exp.NameExperiences ?? '').toLowerCase();
      return name.includes(q);
    });
  }, [experiencias, searchTerm]);
  // Derivar la experiencia seleccionada a partir del id
  const selectedExperience = React.useMemo(() => {
    if (!selectedExperienceId) return null;
    return experiencias.find(
      (exp: any) => exp.id === selectedExperienceId || exp.experienceId === selectedExperienceId
    ) || null;
  }, [selectedExperienceId, experiencias]);

  return (
    <div>
      <Joyride
        steps={widgetsTourSteps}
        run={runWidgetsTour}
        continuous
        showSkipButton
        locale={widgetsTourLocale}
        styles={widgetsTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunWidgetsTour(false);
            markTourSeen(tourKey);
          }
        }}
      />
      <div className="font-bold text-[#00aaff] text-[28.242px] w-full">
      </div>
      {/* Thematic lines as pill bar (no images).
          Top row: first VISIBLE_COUNT pills. Below: remaining pills hidden until expanded.
      */}
      <div className="w-full">
        <div className="relative bg-indigo-600 rounded-full px-2 py-4 sm:px-4 sm:py-6 shadow-md">
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-3 items-center overflow-x-auto scrollbar-hide py-2 sm:py-3 px-2 sm:px-6 widgets-lineas"
              style={{ scrollBehavior: 'smooth' }}
            >
              {ejes.map(eje => (
                <button
                  key={eje.id}
                  onClick={() => setSelectedEje(eje.id)}
                  className={`inline-flex flex-shrink-0 items-center whitespace-nowrap px-4 py-2 rounded-full! text-sm font-medium transition-shadow duration-150 bg-white text-indigo-600 ${selectedEje === eje.id ? 'ring-2 ring-white/30 shadow-lg' : 'shadow-sm hover:shadow-md'}`}
                  style={{ minWidth: 'max-content' }}
                >
                  <span className="leading-none">{eje.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured orange card SIEMPRE visible abajo, mostrando la experiencia seleccionada o mensaje por defecto */}
      <div className="mt-12 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-orange-400 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-8 widgets-feature-card">
          <img src="/carts.svg" alt="icono experiencia" className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-4 md:mb-0" />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1f2937]">
              {selectedExperience
                ? (selectedExperience.nameExperiences || selectedExperience.title || selectedExperience.name)
                : 'Selecciona una experiencia'}
            </h2>
            <p className="mt-2 text-base sm:text-lg text-[#1f2937]">
              {selectedExperience
                ? (selectedExperience.thematicLocation || selectedExperience.ThematicLocation || selectedExperience.area || '')
                : ''}
            </p>
          </div>
          {selectedExperience && (
            <button
              onClick={() => setModalOpen(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 flex items-center justify-center shadow-md mt-4 md:mt-0"
              aria-label="Ver experiencia"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="mt-16">
        <div className="bg-white rounded-2xl p-6 shadow-lg relative">
          {/* action icons (search + notifications) */}
          <div className="absolute top-4 right-4 flex flex-col gap-3 z-20 widgets-action-icons">
            {searchOpen ? (
              <div className="flex items-center gap-2 bg-white rounded-full px-2 shadow-md">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por experiencia o institución..."
                  className="outline-none px-3 py-1 w-64"
                />
                <button onClick={() => { setSearchOpen(false); setSearchTerm(''); }} className="p-2 text-gray-600">
                  ✕
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setSearchOpen(true); }}
                  className="w-10 h-10 bg-white rounded-full! shadow-md flex items-center justify-center border border-white/40"
                  aria-label="Buscar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#4343CD">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => { setNotifModalOpen(true); }}
                  className="w-10 h-10 bg-white rounded-full! shadow-md flex items-center justify-center border border-white/40 relative"
                  aria-label="Notificaciones"
                >
                  {/* Custom notification icon */}
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 1C14.5523 1 15 1.44772 15 2V10C15 10.5523 14.5523 11 14 11H4.41421C3.88378 11 3.37507 11.2107 3 11.5858L1 13.5858V2C1 1.44772 1.44772 1 2 1H14ZM2 0C0.895431 0 0 0.895431 0 2V14.7929C0 15.2383 0.53857 15.4614 0.853553 15.1464L3.70711 12.2929C3.89464 12.1054 4.149 12 4.41421 12H14C15.1046 12 16 11.1046 16 10V2C16 0.895431 15.1046 0 14 0H2Z" fill="#4343CD"/>
                    <path d="M8 3.99275C9.66439 2.282 13.8254 5.27581 8 9.125C2.17465 5.27581 6.33561 2.282 8 3.99275Z" fill="#4343CD"/>
                  </svg>
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full! text-xs w-5 h-5 flex items-center justify-center font-bold border-2 border-white animate-pulse">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* carousel inside container */}
          <div className="mt-2 widgets-carousel">
            {loading ? (
              <div className="py-8">Cargando experiencias...</div>
            ) : error ? (
              <div className="text-red-500 py-8">{error}</div>
            ) : (selectedEje === null ? (
              <div className="relative">
                <div
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide py-6 px-2 pr-4 sm:pr-8 md:pr-12 lg:pr-20 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible"
                >
                  {experiencias
                    .filter((exp: any) => {
                      if (!searchTerm.trim()) return true;
                      const nombre = (exp.nameExperiences || exp.title || exp.name || exp.NameExperiences || exp.experience?.nameExperiences || exp.experience?.title || '').toLowerCase();
                      return nombre.includes(searchTerm.trim().toLowerCase());
                    })
                    .map((exp: any) => {
                      const nombre = exp.nameExperiences || exp.title || exp.name || exp.NameExperiences || exp.experience?.nameExperiences || exp.experience?.title || 'Sin nombre';
                      return (
                        <div
                          key={exp.id ?? exp.experienceId}
                          className="bg-white border rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-lg transition duration-200 relative
                            min-w-[200px] max-w-[200px] h-[240px] p-2
                            sm:min-w-[240px] sm:max-w-[240px] sm:h-[280px] sm:p-4
                            md:min-w-[280px] md:max-w-[280px] md:h-[320px] md:p-6
                            lg:min-w-[320px] lg:max-w-[320px] lg:h-[360px] lg:p-8
                          "
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedExperienceId(exp.id ?? exp.experienceId);
                          }}
                        >
                          <div className="flex flex-col items-center justify-center flex-grow w-full h-full">
                            {/* Imagen centrada */}
                            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center rounded-xl bg-[#fff7e6] overflow-hidden">
                              <img src="/carts.svg" alt="icono experiencia" className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain" />
                            </div>
                            <span
                              className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 text-center mt-4 mb-1 break-words w-full"
                              title={nombre}
                            >
                              {nombre}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : lineaExperiencias.length === 0 ? (
              <div className="text-gray-500 py-8">No hay experiencias.</div>
            ) : (
              <div className="relative">
                <div
                  ref={carouselRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide py-6 px-2 pr-4 sm:pr-8 md:pr-12 lg:pr-20 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible"
                >
                  {lineaExperiencias
                    .filter((exp: any) => {
                      if (!searchTerm.trim()) return true;
                      const id = exp.experienceId || exp.id;
                      const found = experiencias.find(e => (e.id || e.experienceId) === id);
                      const nombre = (found?.nameExperiences || found?.title || found?.name || found?.NameExperiences || exp.experience?.nameExperiences || exp.experience?.title || '').toLowerCase();
                      return nombre.includes(searchTerm.trim().toLowerCase());
                    })
                    .map((exp: any) => {
                      // Buscar la experiencia por id
                      const id = exp.experienceId || exp.id;
                      const found = experiencias.find(e => (e.id || e.experienceId) === id);
                      const nombre = found?.nameExperiences || found?.title || found?.name || found?.NameExperiences || exp.experience?.nameExperiences || exp.experience?.title || 'Sin nombre';
                      return (
                        <div
                          key={exp.id ?? exp.experienceId}
                          className="bg-white border rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-lg transition duration-200 relative
                            min-w-[200px] max-w-[200px] h-[240px] p-2
                            sm:min-w-[240px] sm:max-w-[240px] sm:h-[280px] sm:p-4
                            md:min-w-[280px] md:max-w-[280px] md:h-[320px] md:p-6
                            lg:min-w-[320px] lg:max-w-[320px] lg:h-[360px] lg:p-8
                          "
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedExperienceId(exp.id ?? exp.experienceId);
                          }}
                        >
                          <div className="flex flex-col items-center justify-center flex-grow w-full h-full">
                            {/* Imagen centrada */}
                            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center rounded-xl bg-[#fff7e6] overflow-hidden">
                              <img src="/carts.svg" alt="icono experiencia" className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain" />
                            </div>
                            <span
                              className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 text-center mt-4 mb-1 break-words w-full"
                              title={nombre}
                            >
                              {nombre}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {/* Scroll controls removed to avoid overlapping notification icon; users can swipe/scroll manually */}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Modal de experiencia */}
      {modalOpen && selectedExperienceId && (
        <ExperienceModal
          show={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedExperienceId(null);
          }}
          experienceId={selectedExperienceId}
        />
      )}

      <NotificationsModal open={notifModalOpen} onClose={() => setNotifModalOpen(false)} onCountChange={setNotifCount} />
    </div>
  );
};


export default Widgets;
