import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { UpdateExperience } from "../types/updateExperience";

interface ExperienceModalProps {
  show: boolean;
  onClose: () => void;
  experienceId?: number;
  mode: "view" | "edit"; // Nuevo modo: "view" para visualizar, "edit" para actualizar
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({ show, onClose, experienceId, mode }) => {
  const [experience, setExperience] = useState<UpdateExperience | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (show && experienceId) {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      axios
        .get(`/api/Experience/${experienceId}/detail`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const data = res?.data ?? null;
          if (data) {
            // normalize nested objects to avoid undefined accesses in the UI
            const normalized = {
              ...data,
              institution: data.institution || {},
              experience: data.experience || {},
              documents: Array.isArray(data.documents) ? data.documents : [],
              criterias: Array.isArray(data.criterias) ? data.criterias : [],
            };
            setExperience(normalized);
          } else {
            setExperience(null);
          }
          setLoading(false);
        })
        .catch(() => {
          setExperience(null);
          setLoading(false);
          setError("Error al cargar la experiencia");
        });
    }
  }, [show, experienceId]);

  // Si estamos en modo edición y la experiencia ya cargó, enfocar el input del título
  useEffect(() => {
    if (show && mode === "edit" && experience) {
      // esperar un tick para asegurarnos que el input está en el DOM
      setTimeout(() => titleInputRef.current?.focus(), 0);
    }
  }, [show, mode, experience]);

  if (!show) return null;

  if (loading)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100]">
        <div className="bg-white rounded-2xl shadow-2xl p-8">Cargando...</div>
      </div>
    );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-6 relative flex flex-col"
        onClick={(e) => e.stopPropagation()} // Evitar que el clic cierre el modal
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-sky-700">
            {mode === "edit" ? "Editar Experiencia" : "Información de la Experiencia"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form
          className="flex-1 flex flex-col"
          onSubmit={async (e) => {
            e.preventDefault();
            if (mode === "view" || !experienceId || !experience) return; // Solo actualizar en modo "edit"
            setLoading(true);
            setError(null);
            try {
              const token = localStorage.getItem("token");
              await axios.patch("/api/Experience/patch", experience, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
              setLoading(false);
              onClose();
            } catch (err) {
              setError("Error al actualizar la experiencia");
              setLoading(false);
            }
          }}
        >
          {/* Campos del formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block font-semibold mb-1">Título de la experiencia:</label>
              {mode === "view" ? (
                <p className="w-full text-gray-800">{experience?.experience?.nameExperiences || "Sin información"}</p>
              ) : (
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ingrese el título de la experiencia"
                  ref={titleInputRef}
                  value={experience?.experience?.nameExperiences || ""}
                  onChange={(e) =>
                    mode === "edit" &&
                    setExperience((exp) =>
                      exp
                        ? { ...exp, experience: { ...exp.experience, nameExperiences: e.target.value } }
                        : exp
                    )
                  }
                />
              )}
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1">Nombre del establecimiento educativo:</label>
              {mode === "view" ? (
                <p className="w-full text-gray-800">{experience?.institution?.name || "Sin información"}</p>
              ) : (
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ingrese el nombre del establecimiento educativo"
                  value={experience?.institution?.name || ""}
                  onChange={(e) =>
                    mode === "edit" &&
                    setExperience((exp) =>
                      exp ? { ...exp, institution: { ...exp.institution, name: e.target.value } } : exp
                    )
                  }
                />
              )}
            </div>
            <div className="col-span-2">
              <label className="block font-semibold mb-1">Nombre Completo del líder:</label>
              {mode === "view" ? (
                <p className="w-full text-gray-800">{experience?.experience?.nameFirstLeader || "Sin información"}</p>
              ) : (
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ingrese el nombre completo del líder"
                  value={experience?.experience?.nameFirstLeader || ""}
                  onChange={(e) =>
                    mode === "edit" &&
                    setExperience((exp) =>
                      exp
                        ? { ...exp, experience: { ...exp.experience, nameFirstLeader: e.target.value } }
                        : exp
                    )
                  }
                />
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Departamento:</label>
              {mode === "view" ? (
                <p className="w-full text-gray-800">{experience?.institution?.department || "Sin información"}</p>
              ) : (
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ingrese el departamento"
                  value={experience?.institution?.department || ""}
                  onChange={(e) =>
                    mode === "edit" &&
                    setExperience((exp) =>
                      exp
                        ? { ...exp, institution: { ...exp.institution, department: e.target.value } }
                        : exp
                    )
                  }
                />
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Fecha:</label>
              {mode === "view" ? (
                <p className="w-full text-gray-800">{experience?.experience?.developmenttime?.slice(0, 10) || "Sin información"}</p>
              ) : (
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="dd/mm/aaaa"
                  value={experience?.experience?.developmenttime?.slice(0, 10) || ""}
                  onChange={(e) =>
                    mode === "edit" &&
                    setExperience((exp) =>
                      exp
                        ? { ...exp, experience: { ...exp.experience, developmenttime: e.target.value } }
                        : exp
                    )
                  }
                />
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Municipio:</label>
              {mode === "view" ? (
                <p className="w-full text-gray-800">{experience?.institution?.municipality || "Sin información"}</p>
              ) : (
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ingrese el municipio"
                  value={experience?.institution?.municipality || ""}
                  onChange={(e) =>
                    mode === "edit" &&
                    setExperience((exp) =>
                      exp
                        ? { ...exp, institution: { ...(exp.institution || {}), municipality: e.target.value } }
                        : exp
                    )
                  }
                />
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Criterios evaluados:</label>
              {mode === "view" ? (
                <p className="w-full text-gray-800">{experience?.criterias?.[0]?.name || "Sin información"}</p>
              ) : (
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  value={experience?.criterias?.[0]?.name || ""}
                  onChange={() => {}}
                >
                  {experience?.criterias?.map((c, index) => (
                    <option key={index} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Código DANE:</label>
              {mode === "view" ? (
                <p className="w-full text-gray-800">{experience?.institution?.codeDane || "Sin información"}</p>
              ) : (
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Ingrese el código DANE"
                  value={experience?.institution?.codeDane || ""}
                  onChange={(e) =>
                    mode === "edit" &&
                    setExperience((exp) =>
                      exp
                        ? { ...exp, institution: { ...(exp.institution || {}), codeDane: e.target.value } }
                        : exp
                    )
                  }
                />
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Estado actual:</label>
              <p className="w-full text-gray-800">{experience?.experience?.evaluationResult || "Naciente"}</p>
            </div>
            {mode === "view" && (
              <div>
                <label className="block font-semibold mb-1">Adjuntar PDF:</label>
                {experience?.documents?.[0]?.urlPdf ? (
                  <a
                    href={experience?.documents?.[0].urlPdf}
                    download="archivo.pdf" // Nombre del archivo al descargar
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-blue-600 hover:underline truncate"
                  >
                    {experience?.documents?.[0].urlPdf}
                  </a>
                ) : (
                  <p className="text-gray-500">No hay PDF adjunto</p>
                )}
              </div>
            )}
            <div>
              {mode === "view" && (
                <div>
                  <label className="block font-semibold mb-1">Enlace:</label>
                  {experience?.documents?.[0]?.urlLink ? (
                    <a
                      href={experience?.documents?.[0].urlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline truncate"
                    >
                      {experience?.documents?.[0].urlLink}
                    </a>
                  ) : (
                    <p className="text-gray-500">Sin información</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end items-center gap-4 mt-6">
            {error && <span className="text-red-500">{error}</span>}
            {mode === "edit" ? (
              <>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded hover:bg-gray-300"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-sky-500 text-white font-semibold px-4 py-2 rounded hover:bg-sky-600"
                >
                  Guardar
                </button>
              </>
            ) : (
              <button
                type="button"
                className="bg-sky-500 text-white font-semibold px-4 py-2 rounded hover:bg-sky-600"
                onClick={onClose}
              >
                Listo
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExperienceModal;
