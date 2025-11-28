// src/components/Widgets.tsx
import React, { useState, useRef, useMemo } from "react";
import Joyride from "react-joyride";
import { MagnifyingGlassIcon, BellAlertIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Iconos modernos

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

  // Referencia para controlar el scroll del carrusel (se usa para ambos)
  const carouselRef = useRef<HTMLDivElement | null>(null);
  
  // --- Lógica de Carga de Datos (SIN CAMBIOS) ---
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
  // --- Fin Lógica de Carga de Datos ---

  // --- Lógica del Tour (SIN CAMBIOS) ---
  React.useEffect(() => {
    if (!hasTourBeenSeen(tourKey)) {
      const timer = window.setTimeout(() => setRunWidgetsTour(true), 800);
      return () => window.clearTimeout(timer);
    }
  }, [tourKey]);

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
  
  // derived filtered list for carousel search
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


  // Componente reutilizable para la tarjeta de experiencia en el carrusel
  const ExperienceCard: React.FC<{ exp: any; isSelected: boolean; onClick: () => void }> = ({ exp, isSelected, onClick }) => {
    const id = exp.id ?? exp.experienceId;
    const nombre = exp.nameExperiences || exp.title || exp.name || exp.NameExperiences || exp.experience?.nameExperiences || exp.experience?.title || 'Sin nombre';

    return (
      <div
        key={id}
        className={`
          bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-start shadow-lg transition duration-300 relative overflow-hidden transform hover:scale-[1.03]
          min-w-[200px] max-w-[200px] h-[240px] p-3
          sm:min-w-[240px] sm:max-w-[240px] sm:h-[280px] sm:p-4
          ${isSelected ? 'ring-4 ring-indigo-500/80 shadow-2xl' : 'hover:shadow-xl'}
        `}
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      >
        <div className="flex flex-col items-center justify-start flex-grow w-full h-full text-center">
          {/* Placeholder de Imagen / Icono */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center rounded-2xl bg-indigo-50 overflow-hidden flex-shrink-0 mb-3 p-4">
            <img src="/carts.svg" alt="icono experiencia" className="w-full h-full object-contain text-indigo-500" />
          </div>
          <span
            className="text-base sm:text-lg font-extrabold text-gray-800 line-clamp-2 w-full mt-2"
            title={nombre}
          >
            {nombre}
          </span>
          {isSelected && (
            <div className="absolute top-2 left-2 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
              Destacada
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 md:p-6 lg:p-8">
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

     

      {/* 1. Carrusel de Líneas Temáticas (Ejes) */}
      <div className="w-full mb-12 widgets-lineas">
        <div className="relative bg-indigo-700 rounded-3xl p-3 shadow-xl">
          <p className="text-sm font-semibold text-indigo-300 px-3 pt-1 pb-2">Filtrar por Eje Temático:</p>
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-4 items-center overflow-x-auto scrollbar-hide py-3 px-3"
              style={{ scrollBehavior: 'smooth' }}
            >
              {/* Botón para ver todas */}
              <button
                onClick={() => setSelectedEje(null)}
                className={`inline-flex flex-shrink-0 items-center whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200
                  ${selectedEje === null ? 'bg-white text-indigo-700 shadow-md ring-2 ring-indigo-300' : 'bg-indigo-600 text-white/90 hover:bg-indigo-500'}
                `}
              >
                <span className="leading-none">Todas las Experiencias</span>
              </button>
              
              {ejes.map(eje => (
                <button
                  key={eje.id}
                  onClick={() => setSelectedEje(eje.id)}
                  className={`inline-flex flex-shrink-0 items-center whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200
                    ${selectedEje === eje.id ? 'bg-white text-indigo-700 shadow-md ring-2 ring-indigo-300' : 'bg-indigo-600 text-white/90 hover:bg-indigo-500'}
                  `}
                >
                  <span className="leading-none">{eje.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tarjeta Destacada (Experiencia Seleccionada) */}
      <div className="mt-12 mb-16 flex justify-center widgets-feature-card">
        <div 
          className="w-full max-w-4xl bg-amber-500 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 transition-transform duration-300 ease-in-out transform hover:scale-[1.01]"
          // Estilo para la sombra de la tarjeta destacada
          style={{ boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.4), 0 10px 10px -5px rgba(245, 158, 11, 0.2)' }}
        >
          {/* Icono / Imagen */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-xl bg-white/30 p-2 flex-shrink-0">
            <img src="/carts.svg" alt="icono experiencia" className="w-full h-full text-white" />
          </div>
          
          {/* Título y Descripción */}
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
                : '¡Explora los ejes temáticos y el carrusel de abajo!'}
            </p>
          </div>
          
          {/* Botón de Acción */}
          {selectedExperience && (
            <button
              onClick={() => setModalOpen(true)}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white text-amber-700 flex items-center justify-center shadow-lg hover:bg-gray-100 transition duration-200 flex-shrink-0"

              aria-label="Ver detalle de la experiencia"
            >
              <EyeIcon className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Carrusel de Experiencias y Acciones */}
      <div className="mt-10 widgets-carousel-container">
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl relative">
          
          {/* Acciones (Búsqueda + Notificaciones) */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-20 widgets-action-icons">
            {searchOpen ? (
              <div className="flex items-center gap-1 bg-gray-100 rounded-full pl-4 pr-1 shadow-inner border border-gray-200 transition-all duration-300 w-full sm:w-64">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar experiencia..."
                  className="outline-none bg-transparent px-2 py-2 w-full text-sm"
                />
                <button onClick={() => { setSearchOpen(false); setSearchTerm(''); }} className="p-2 text-gray-500 hover:text-gray-700 transition">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setSearchOpen(true); }}
                  className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full shadow-md flex items-center justify-center hover:bg-indigo-100 transition"
                  aria-label="Abrir búsqueda"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => { setNotifModalOpen(true); }}
                  className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full shadow-md flex items-center justify-center hover:bg-indigo-100 transition relative"
                  aria-label="Notificaciones"
                >
                  <BellAlertIcon className="h-6 w-6" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold border-2 border-white animate-bounce">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Contenido del Carrusel de Experiencias */}
          <div className="pt-2">
            {loading ? (
              <div className="py-8 text-center text-gray-500">Cargando experiencias...</div>
            ) : error ? (
              <div className="text-red-600 py-8 text-center"> {error}</div>
            ) : selectedEje === null ? (
              /* Carrusel de TODAS las experiencias */
              <div className="relative">
                <div ref={carouselRef} className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-2">
                  {experiencias
                    .filter((exp: any) => {
                      if (!searchTerm.trim()) return true;
                      const nombre = (exp.nameExperiences || exp.title || exp.name || exp.NameExperiences || exp.experience?.nameExperiences || exp.experience?.title || '').toLowerCase();
                      return nombre.includes(searchTerm.trim().toLowerCase());
                    })
                    .map((exp: any) => (
                      <ExperienceCard 
                        key={exp.id ?? exp.experienceId}
                        exp={exp}
                        isSelected={selectedExperienceId === (exp.id ?? exp.experienceId)}
                        onClick={() => setSelectedExperienceId(exp.id ?? exp.experienceId)}
                      />
                    ))}
                </div>
              </div>
            ) : lineaExperiencias.length === 0 ? (
              <div className="text-gray-500 py-8 text-center">No hay experiencias registradas en este eje.</div>
            ) : (
              /* Carrusel de experiencias por EJE TEMÁTICO */
              <div className="relative">
                <div ref={carouselRef} className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-2">
                  {lineaExperiencias
                    .filter((exp: any) => {
                      // La lógica de filtrado de búsqueda es compleja aquí, pero la mantendremos.
                      if (!searchTerm.trim()) return true;
                      const id = exp.experienceId || exp.id;
                      const found = experiencias.find(e => (e.id || e.experienceId) === id);
                      const nombre = (found?.nameExperiences || found?.title || found?.name || found?.NameExperiences || exp.experience?.nameExperiences || exp.experience?.title || '').toLowerCase();
                      return nombre.includes(searchTerm.trim().toLowerCase());
                    })
                    .map((exp: any) => {
                      // Obtener datos de la experiencia completa para el card
                      const id = exp.experienceId || exp.id;
                      const foundExp = experiencias.find(e => (e.id || e.experienceId) === id) || exp;
                      
                      return (
                        <ExperienceCard
                          key={id}
                          exp={foundExp}
                          isSelected={selectedExperienceId === id}
                          onClick={() => setSelectedExperienceId(id)}
                        />
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de experiencia (SIN CAMBIOS EN LÓGICA) */}
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
