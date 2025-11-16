// src/components/Widgets.tsx
import React, { useState } from "react";

import ExperienceModal from "../../features/experience/components/ExperienceModal";

const Widgets: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [selectedEje, setSelectedEje] = useState<number | null>(null);
  const [experiencias, setExperiencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedEje === null) return;
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
          setExperiencias(data.data.filter((item: any) => item.lineThematicId === selectedEje));
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
  const [expanded, setExpanded] = useState(false);
  const VISIBLE_COUNT = 6; // cuántas pills mostrar en la fila superior
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
  return (
  <div>
      <div className="font-bold text-[#00aaff] text-[28.242px] w-full">
      </div>
      {/* Thematic lines as pill bar (no images).
          Top row: first VISIBLE_COUNT pills. Below: remaining pills hidden until expanded.
      */}
      <div className="w-full">
        <div className="relative bg-indigo-600 rounded-full px-4 py-6 shadow-md">
          {/* Top row */}
          <div className="flex gap-3 items-center justify-center flex-wrap mb-2">
            {ejes.slice(0, VISIBLE_COUNT).map(eje => (
              <button
                key={eje.id}
                onClick={() => setSelectedEje(eje.id)}
                className={`inline-flex items-center whitespace-nowrap px-4 py-2 rounded-full! text-sm font-medium transition-shadow duration-150 bg-white text-indigo-600 ${selectedEje === eje.id ? 'ring-2 ring-white/30 shadow-lg' : 'shadow-sm hover:shadow-md'}`}
              >
                <span className="leading-none">{eje.label}</span>
              </button>
            ))}
            {/* El control textual se ha eliminado: se usa solo la flecha inferior para desplegar/contraer */}
          </div>

          {/* Bottom row: hidden by default */}
          {ejes.length > VISIBLE_COUNT && (
            <div className={`overflow-hidden transition-[max-height] duration-300 ${expanded ? 'max-h-40' : 'max-h-0'}`}>
              <div className="flex gap-3 items-center justify-center flex-wrap mt-2">
                {ejes.slice(VISIBLE_COUNT).map(eje => (
                  <button
                    key={eje.id}
                    onClick={() => setSelectedEje(eje.id)}
                    className={`inline-flex items-center whitespace-nowrap px-4 py-2 rounded-full! text-sm font-medium transition-shadow duration-150 bg-white text-indigo-600 ${selectedEje === eje.id ? 'ring-2 ring-white/30 shadow-lg' : 'shadow-sm hover:shadow-md'}`}
                  >
                    <span className="leading-none">{eje.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Small chevron indicator bottom-left */}
          {ejes.length > VISIBLE_COUNT && (
            <button
              onClick={() => setExpanded(prev => !prev)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Cerrar ejes adicionales' : 'Abrir ejes adicionales'}
              className="absolute left-3 bottom-3 p-1 rounded-full text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg
                className={`w-4 h-4 transform transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 8l5 5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="mt-10 font-bold text-[#00aaff] text-[28.359px] w-full">
        <p>Experiencias</p>
      </div>
      {selectedEje && (
        <div className="mt-4">
          {loading ? (
            <div>Cargando experiencias...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : experiencias.length === 0 ? (
            <div className="text-gray-500">No hay experiencias para este eje temático.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {experiencias.map(exp => (
                <div
                  key={exp.id}
                  className="relative border rounded-xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-lg transition duration-200 cursor-pointer bg-white w-70 h-56"
                >
                  <img
                    src="/images/Experiencias.png"
                    alt="icono"
                    className="w-40 h-16 mb-3"
                  />
                  <div className="mb-2 font-semibold text-sky-700 text-base"></div>
                  <button
                    className="bg-gray-100 rounded px-4 py-2 mt-2 text-sm font-semibold"
                    onClick={() => {
                      setSelectedExperienceId(exp.experienceId);
                      setModalOpen(true);
                    }}
                  >
                    Visitar Experiencia
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
