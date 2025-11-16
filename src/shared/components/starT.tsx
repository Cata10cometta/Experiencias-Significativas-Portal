import React, { useState, useEffect } from "react";
import ExperienceModal from "../../features/experience/components/ExperienceModal";

const starT: React.FC = () => {
  const [experiencias, setExperiencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);

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
        console.log("Experiencias obtenidas:", data);

        setExperiencias(data); // Almacenar las experiencias obtenidas
      } catch (err) {
        console.error("Error al cargar experiencias:", err);
        setError("Error al cargar experiencias");
      } finally {
        setLoading(false);
      }
    };

    fetchExperiencias();
  }, []);

  return (
    <div
      className="w-full h-full rounded-3xl min-h-screen bg-cover bg-center relative"
    >
      {/* Cohete decorativo translúcido grande y centrado */}
      <img
        src="/images/coheteT.png"
        alt="Cohete"
        className="absolute ml-230 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 z-0 w-[900px] h-[900px] pointer-events-none select-none"
        style={{ filter: 'blur(0.5px)' }}
      />
      <div className="relative z-10 font-bold text-[#00aaff] text-7xl w-full">
        <p>“Un espacio digital para reconocer, compartir y potenciar las experiencias que construyen una educación más humana, inclusiva y significativa.”</p>
      </div>
      <div className="relative z-10 mt-10 font-bold text-[#00aaff] text-[28.359px] w-full">
        <p>Mis Experiencias</p>
      </div>
      <div className="relative z-10 mt-4">
        {loading ? (
          <div>Cargando experiencias...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : experiencias.length === 0 ? (
          <div className="text-gray-500">No hay experiencias para mostrar.</div>
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
                <div className="mb-2 font-semibold text-sky-700 text-base">{exp.name}</div>
                <button
                  className="bg-gray-100 rounded px-4 py-2 mt-2 text-sm font-semibold"
                  onClick={() => {
                    setSelectedExperienceId(exp.id);
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

export default starT;
