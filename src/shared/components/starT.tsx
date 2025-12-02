import React, { useState, useEffect, useMemo, useRef } from "react";
import Joyride from "react-joyride";
import ExperienceModal from "../../features/experience/components/ExperienceModal";
import {
  startTourSteps,
  startTourLocale,
  startTourStyles,
} from "../../features/onboarding/startTour";
import { hasTourBeenSeen, markTourSeen } from "../utils/tourStorage";

const starT: React.FC = () => {
  const [experiencias, setExperiencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [selectedEje, setSelectedEje] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [runStartTour, setRunStartTour] = useState(false);
  const tourKey = "startTourDone";

  // Ejes temáticos igual que en Widgets.tsx
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

  // Filtrar experiencias por eje seleccionado y búsqueda
  const experienciasFiltradas = useMemo(() => {
    let lista = experiencias;
    if (selectedEje) {
      lista = lista.filter((exp) => {
        if (Array.isArray(exp.thematicLineIds)) {
          return exp.thematicLineIds.includes(selectedEje);
        }
        if (Array.isArray(exp.thematicLineNames)) {
          const ejeLabel = ejes.find(e => e.id === selectedEje)?.label;
          return exp.thematicLineNames.includes(ejeLabel);
        }
        return false;
      });
    }
    if (searchTerm.trim() !== '') {
      const q = searchTerm.trim().toLowerCase();
      lista = lista.filter(exp => {
        const nombre = String(exp.nameExperiences || exp.name || '').toLowerCase();
        return nombre.includes(q);
      });
    }
    return lista;
  }, [experiencias, selectedEje, searchTerm]);

  // Derivar la experiencia seleccionada a partir del id
  const selectedExperience = useMemo(() => {
    if (!selectedExperienceId) return null;
    return experiencias.find(
      (exp: any) => exp.id === selectedExperienceId || exp.experienceId === selectedExperienceId
    ) || null;
  }, [selectedExperienceId, experiencias]);

  useEffect(() => {
    const fetchExperiencias = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
      const endpoint = `${API_BASE}/api/Experience/List`;

      try {
        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error("Error al obtener experiencias");

        const data = await res.json();
        setExperiencias(data);
      } catch (err) {
        setError("Error al cargar experiencias");
      } finally {
        setLoading(false);
      }
    };
    fetchExperiencias();
  }, []);

  useEffect(() => {
    if (!experiencias.length || hasTourBeenSeen(tourKey)) return;
    const timer = window.setTimeout(() => setRunStartTour(true), 800);
    return () => window.clearTimeout(timer);
  }, [experiencias, tourKey]);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Joyride
        steps={startTourSteps}
        run={runStartTour}
        continuous
        showSkipButton
        locale={startTourLocale}
        styles={startTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunStartTour(false);
            markTourSeen(tourKey);
          }
        }}
      />

      {/* Tarjeta Destacada (Experiencia Seleccionada) */}
      <div className="mt-12 mb-16 flex justify-center widgets-feature-card">
        <div 
          className="w-full max-w-4xl bg-amber-500 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 transition-transform duration-300 ease-in-out transform hover:scale-[1.01]"
          style={{ boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.4), 0 10px 10px -5px rgba(245, 158, 11, 0.2)' }}
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-xl bg-white/30 p-2 flex-shrink-0">
            <img src="/carts.svg" alt="icono experiencia" className="w-full h-full text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold uppercase text-amber-900/80">Experiencia Destacada</p>
            <h2 className="text-2xl font-extrabold text-gray-900 mt-1 line-clamp-2">
              {selectedExperience
                ? (selectedExperience.nameExperiences || selectedExperience.title || selectedExperience.name)
                : 'Selecciona una experiencia para ver su resumen.'}
            </h2>
            <p className="mt-1 text-base font-medium text-gray-800 line-clamp-1">
              {selectedExperience
                ? (selectedExperience.thematicLocation || selectedExperience.ThematicLocation || selectedExperience.area || 'Información de ubicación no disponible')
                : '¡Explora el carrusel de abajo!'}
            </p>
          </div>
          {selectedExperience && (
            <button
              onClick={() => setModalOpen(true)}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white text-amber-700 flex items-center justify-center shadow-lg hover:bg-gray-100 transition duration-200 flex-shrink-0"
              aria-label="Ver detalle de la experiencia"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Acciones (Buscador) */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-3 z-20 widgets-action-icons">
          {searchOpen ? (
            <div className="flex items-center gap-1 bg-gray-100 rounded-full pl-4 pr-1 shadow-inner border border-gray-200 transition-all duration-300 w-full sm:w-64">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar experiencia..."
                className="outline-none bg-transparent px-2 py-2 w-full text-sm"
              />
              <button onClick={() => { setSearchOpen(false); setSearchTerm(''); }} className="p-2 text-gray-500 hover:text-gray-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full shadow-md flex items-center justify-center hover:bg-indigo-100 transition"
              aria-label="Abrir búsqueda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Carrusel de Experiencias */}
      <div className="mt-10 widgets-carousel-container">
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl relative">
          <div className="pt-2">
            {loading ? (
              <div className="py-8 text-center text-gray-500">Cargando experiencias...</div>
            ) : error ? (
              <div className="text-red-600 py-8 text-center"> {error}</div>
            ) : experienciasFiltradas.length === 0 ? (
              <div className="text-gray-500 py-8 text-center">No hay experiencias.</div>
            ) : (
              <div className="relative">
                <div ref={carouselRef} className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-2">
                  {experienciasFiltradas.map((exp: any) => (
                    <div
                      key={exp.id ?? exp.experienceId}
                      className={`bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-start shadow-lg transition duration-300 relative overflow-hidden transform hover:scale-[1.03]
                        min-w-[200px] max-w-[200px] h-[240px] p-3
                        sm:min-w-[240px] sm:max-w-[240px] sm:h-[280px] sm:p-4
                        ${selectedExperienceId === (exp.id ?? exp.experienceId) ? 'ring-4 ring-indigo-500/80 shadow-2xl' : 'hover:shadow-xl'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedExperienceId(exp.id ?? exp.experienceId)}
                    >
                      <div className="flex flex-col items-center justify-start flex-grow w-full h-full text-center">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center rounded-2xl bg-indigo-50 overflow-hidden flex-shrink-0 mb-3 p-4">
                          <img src="/carts.svg" alt="icono experiencia" className="w-full h-full object-contain text-indigo-500" />
                        </div>
                        <span
                          className="text-base sm:text-lg font-extrabold text-gray-800 line-clamp-2 w-full mt-2"
                          title={exp.nameExperiences || exp.name || ''}
                        >
                          {exp.nameExperiences || exp.name || ''}
                        </span>
                        {selectedExperienceId === (exp.id ?? exp.experienceId) && (
                          <div className="absolute top-2 left-2 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                            Destacada
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    </div>
  );
};

export default starT;
