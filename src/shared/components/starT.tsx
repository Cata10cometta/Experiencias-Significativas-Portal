import React, { useState, useEffect, useMemo, useRef } from "react";
import ExperienceModal from "../../features/experience/components/ExperienceModal";

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

  return (
    <div className="w-full h-full rounded-3xl min-h-screen bg-cover bg-center relative">
      {/* Barra de ejes temáticos eliminada */}

      {/* Tarjeta destacada de experiencia seleccionada */}
      <div className="mt-12 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-orange-400 rounded-2xl shadow-xl p-8 flex items-center gap-8">
          <img src="/carts.svg" alt="icono experiencia" className="w-28 h-28" />
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold text-[#1f2937]">
              {selectedExperience
                ? (selectedExperience.nameExperiences || selectedExperience.title || selectedExperience.name)
                : 'Selecciona una experiencia'}
            </h2>
            <p className="mt-2 text-lg text-[#1f2937]">
              {selectedExperience
                ? (selectedExperience.thematicLocation || selectedExperience.ThematicLocation || selectedExperience.area || '')
                : ''}
            </p>
          </div>
          {selectedExperience && (
            <button
              onClick={() => setModalOpen(true)}
              className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-md"
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

      {/* Carrusel de tarjetas de experiencias */}
      <div className="mt-16">
        <div className="bg-white rounded-2xl p-6 shadow-lg relative">
          {/* Buscador */}
          <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
            {searchOpen ? (
              <div className="flex items-center gap-2 bg-white rounded-full px-2 shadow-md">
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por experiencia..."
                  className="outline-none px-3 py-1 w-64"
                />
                <button onClick={() => { setSearchOpen(false); setSearchTerm(''); }} className="p-2 text-gray-600">
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 bg-white rounded-full! shadow-md flex items-center justify-center border border-white/40"
                aria-label="Buscar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#4343CD">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </button>
            )}
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="py-8">Cargando experiencias...</div>
            ) : error ? (
              <div className="text-red-500 py-8">{error}</div>
            ) : experienciasFiltradas.length === 0 ? (
              <div className="text-gray-500 py-8">No hay experiencias.</div>
            ) : (
              <div className="relative">
                <div ref={carouselRef} className="flex gap-4 overflow-x-auto scrollbar-hide py-6 px-2 pr-20">
                  {experienciasFiltradas.map((exp: any) => (
                    <div
                      key={exp.id ?? exp.experienceId}
                      className={`bg-white border rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-lg transition duration-200 relative
                        min-w-[200px] max-w-[200px] h-[240px] p-2
                        sm:min-w-[240px] sm:max-w-[240px] sm:h-[280px] sm:p-4
                        md:min-w-[280px] md:max-w-[280px] md:h-[320px] md:p-6
                        lg:min-w-[320px] lg:max-w-[320px] lg:h-[360px] lg:p-8
                        cursor-pointer
                        ${selectedExperienceId === (exp.id ?? exp.experienceId) ? 'ring-2 ring-orange-400' : ''}`}
                      onClick={() => setSelectedExperienceId(exp.id ?? exp.experienceId)}
                    >
                      <div className="flex flex-col items-center justify-center flex-grow w-full h-full">
                        {/* Imagen centrada */}
                        <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center rounded-xl bg-[#fff7e6] overflow-hidden">
                          <img src="/carts.svg" alt="icono experiencia" className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain" />
                        </div>
                        {/* Nombre de la experiencia */}
                        <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 text-center mt-4 mb-1 break-words w-full" title={exp.nameExperiences || exp.name || ''}>{exp.nameExperiences || exp.name || ''}</span>
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
