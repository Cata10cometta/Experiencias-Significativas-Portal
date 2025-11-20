// src/components/Widgets.tsx
import React, { useState, useRef, useMemo } from "react";

import ExperienceModal from "../../features/experience/components/ExperienceModal";

const Widgets: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [selectedEje, setSelectedEje] = useState<number | null>(null);
  const [experiencias, setExperiencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  React.useEffect(() => {
    // Fetch all experiences on mount, and refetch when selectedEje changes to update view.
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
          // The endpoint may return multiple rows per experience (one per thematic line).
          // Deduplicate by `experienceId` (or `id`) so each experience appears once.
          const all = data.data as any[];
          const uniqueMap = new Map<number | string, any>();
          all.forEach(item => {
            const key = item.experienceId ?? item.id ?? item.NameExperiences ?? JSON.stringify(item);
            if (!uniqueMap.has(key)) uniqueMap.set(key, item);
          });
          const unique = Array.from(uniqueMap.values());
          if (selectedEje) {
            setExperiencias(unique.filter((item: any) => item.lineThematicId === selectedEje));
          } else {
            setExperiencias(unique);
          }
        } else {
          setExperiencias([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar experiencias");
        setLoading(false);
      });
  }, [selectedEje]);
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
  // derived filtered list for carousel search
  const filteredExperiencias = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') return experiencias;
    const q = searchTerm.trim().toLowerCase();
    return experiencias.filter((exp: any) => {
      const name = String(exp.title ?? exp.name ?? exp.NameExperiences ?? '').toLowerCase();
      const area = String(exp.ThematicLocation ?? exp.thematicLocation ?? exp.area ?? exp.areaApplied ?? '').toLowerCase();
      const institution = String(
        exp.institutionName ?? exp.institution ?? exp.schoolName ?? exp.nombreInstitucion ?? exp.institutionalName ?? exp.organizacion ?? exp.entidad ?? ''
      ).toLowerCase();
      return name.includes(q) || area.includes(q) || institution.includes(q);
    });
  }, [experiencias, searchTerm]);
  return (
  <div>
      <div className="font-bold text-[#00aaff] text-[28.242px] w-full">
      </div>
      {/* Thematic lines as pill bar (no images).
          Top row: first VISIBLE_COUNT pills. Below: remaining pills hidden until expanded.
      */}
      <div className="w-full">
        <div className="relative bg-indigo-600 rounded-full px-4 py-6 shadow-md">
          {/* Carousel: horizontal scrollable list with left/right controls */}
          <div className="relative">

            <div
              ref={carouselRef}
              className="flex gap-3 items-center overflow-x-auto scrollbar-hide py-3 px-6"
              style={{ scrollBehavior: 'smooth' }}
            >
              {ejes.map(eje => (
                <button
                  key={eje.id}
                  onClick={() => setSelectedEje(eje.id)}
                  className={`inline-flex flex-shrink-0 items-center whitespace-nowrap px-4 py-2 rounded-full! text-sm font-medium transition-shadow duration-150 bg-white text-indigo-600 ${selectedEje === eje.id ? 'ring-2 ring-white/30 shadow-lg' : 'shadow-sm hover:shadow-md'}`}
                >
                  <span className="leading-none">{eje.label}</span>
                </button>
              ))}
            </div>

            {/* Arrow controls removed per request; users can swipe/scroll the carousel manually */}
          </div>
        </div>
      </div>
      {/* Featured orange card */}
      {experiencias.length > 0 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="w-full max-w-4xl bg-orange-400 rounded-2xl shadow-xl p-8 flex items-center gap-8">
            <img src="/images/Experiencias.png" alt="icono" className="w-28 h-28" />
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-[#1f2937]">{experiencias[0].title || experiencias[0].name || 'Nombre de la experiencia'}</h2>
              <p className="mt-2 text-lg text-[#1f2937]">{experiencias[0].ThematicLocation || experiencias[0].thematicLocation || experiencias[0].area || ''}</p>
            </div>
            <button
              onClick={() => { setSelectedExperienceId(experiencias[0].experienceId ?? experiencias[0].id); setModalOpen(true); }}
              className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-md"
              aria-label="Ver experiencia"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 font-bold text-[#00aaff] text-[28.359px] w-full flex items-center justify-between">
        <p>Experiencias</p>
      </div>

      {/* Large white container with carousel and action icons */}
      <div className="mt-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg relative">
          {/* action icons (search + notifications) */}
          <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
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
                  className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border border-white/40"
                  aria-label="Buscar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => { /* placeholder: open notifications */ }}
                  className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border border-white/40"
                  aria-label="Notificaciones"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118.6 14.6V11a6 6 0 10-12 0v3.6c0 .538-.214 1.055-.595 1.395L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* carousel inside container */}
          <div className="mt-2">
            {loading ? (
              <div className="py-8">Cargando experiencias...</div>
            ) : error ? (
              <div className="text-red-500 py-8">{error}</div>
            ) : experiencias.length === 0 ? (
              <div className="text-gray-500 py-8">No hay experiencias.</div>
            ) : (
              <div className="relative">
                <div ref={carouselRef} className="flex gap-4 overflow-x-auto scrollbar-hide py-6 px-2 pr-20">
                  {/** render filtered list when searching, otherwise all experiencias */}
                  { filteredExperiencias.map((exp: any) => (
                    <div key={exp.id ?? exp.experienceId} className="min-w-[260px] max-w-[260px] bg-white border rounded-xl p-4 flex flex-col items-start shadow-sm hover:shadow-lg transition duration-200 relative">
                      {/* small icon above the card */}
                      <div className="absolute -top-5 left-4 bg-white/80 rounded-full p-2 shadow-sm">
                        <img src="/images/Experiencias.png" alt="icono" className="w-8 h-8" />
                      </div>

                      {/* eye button (open modal) top-right */}
                      <button
                        onClick={() => { setSelectedExperienceId(exp.experienceId ?? exp.id); setModalOpen(true); }}
                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100"
                        aria-label="Ver experiencia"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <div className="mt-6 w-full text-left">
                        <h3 className="text-lg font-semibold text-sky-700 truncate">{exp.title || exp.name || ''}</h3>
                        <p className="text-sm text-gray-600 mt-2 truncate">{exp.ThematicLocation || exp.area || exp.thematicLocation || exp.areaApplied || ''}</p>
                        <p className="text-sm text-gray-500 mt-1 truncate">{exp.institutionName || exp.institution || exp.schoolName || exp.nombreInstitucion || exp.organizacion || exp.entidad || ''}</p>
                        <div className="mt-4">
                          <button className="bg-gray-100 rounded px-3 py-1 text-sm font-semibold text-sky-700" onClick={() => { setSelectedExperienceId(exp.experienceId ?? exp.id); setModalOpen(true); }}>Abrir</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Scroll controls removed to avoid overlapping notification icon; users can swipe/scroll manually */}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal de experiencia */}
      {modalOpen && selectedExperienceId && (
        <ExperienceModal
          show={modalOpen}
          onClose={() => setModalOpen(false)}
          experienceId={selectedExperienceId}
          mode="view" // Solo visualizar
        />
      )}
    </div>
  );
};

0+63
export default Widgets;
