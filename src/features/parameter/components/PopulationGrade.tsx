import React, { useEffect, useState } from "react";
import axios from "axios";
import { PopulationGrade } from "../types/populationGrade";


interface EditPopulationGradeFormProps {
  populationGrade: PopulationGrade;
  onClose: () => void;
  onUpdated: () => void;
}

const EditPopulationGradeForm: React.FC<EditPopulationGradeFormProps> = ({ populationGrade, onClose, onUpdated }) => {
  const [name, setName] = useState(populationGrade.name);
  const [code, setCode] = useState(populationGrade.code);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/PopulationGrade`,
        {
          id: populationGrade.id,
          name,
          code,
          state: populationGrade.state ?? true,
          createdAt: populationGrade.createdAt ?? new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onUpdated();
      onClose();
    } catch {
      setError("Error al actualizar grado de población");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Grado de Población</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

interface AddPopulationGradeFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddPopulationGradeForm: React.FC<AddPopulationGradeFormProps> = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `/api/PopulationGrade`,
        {
          id: 0,
          name,
          code,
          state: true,
          createdAt: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onAdded();
      onClose();
    } catch {
      setError("Error al agregar grado de población");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Grado de Población</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">
            {loading ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
};

const PopulationGradeList: React.FC = () => {
  const [populationGrades, setPopulationGrades] = useState<PopulationGrade[]>([]);
  const [editPopulationGrade, setEditPopulationGrade] = useState<PopulationGrade | null>(null);
  const [addPopulationGradeOpen, setAddPopulationGradeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar activos/inactivos
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const fetchPopulationGrades = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`/api/PopulationGrade/getAll`, {
        params: { OnlyActive: onlyActive }, // Usar el filtro OnlyActive
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const populationGradesNormalized = res.data.data.map((populationGrade: PopulationGrade) => ({
            ...populationGrade,
            state: onlyActive, // Asignar el estado basado en el filtro OnlyActive
          }));
          setPopulationGrades(populationGradesNormalized);
        } else {
          setPopulationGrades([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar grados de población");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPopulationGrades();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  const filtered = populationGrades.filter((pg) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (`${pg.code || ''} ${pg.name || ''}`).toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filtered.length, totalPages]);

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  if (loading) return <div>Cargando grados de población...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/PopulationGrade/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPopulationGrades(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar grado de población:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/PopulationGrade/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPopulationGrades(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar grado de población:", err);
    }
  };

  return (
    <div className="max-w-full mx-auto mt-10 p-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-sky-700">Lista de Grados de Población</h2>
            <p className="text-sm text-gray-500 mt-1">Administra los grados de población del sistema</p>
          </div>
          <div>
            <button onClick={() => setAddPopulationGradeOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 text-white hover:bg-sky-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
              <span>Agregar Grado de Población</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Buscar grados de población..." className="pl-10 pr-4 h-12 border rounded-full w-full bg-gray-50 shadow-sm" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded font-semibold ${
                onlyActive ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"
              }`}
              onClick={() => setOnlyActive(true)} // Mostrar activos
            >
              Mostrar Activos
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold ${
                !onlyActive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"
              }`}
              onClick={() => setOnlyActive(false)} // Mostrar inactivos
            >
              Mostrar Inactivos
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 p-2 overflow-auto">
          <table className="min-w-full border-collapse w-full table-auto">
            <thead className="text-left text-sm text-gray-600 bg-gray-50">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700">Código</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 px-4 text-center text-gray-500">No hay grados de población para mostrar.</td>
                </tr>
              ) : (
                paginated.map((populationGrade) => (
                  <tr key={populationGrade.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-4 border-b">{populationGrade.code}</td>
                    <td className="py-2 px-4 border-b">{populationGrade.name}</td>
                    <td className="py-2 px-4 border-b">
                      {populationGrade.state ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">Activo</span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-500 px-3 py-1 rounded-full text-xs sm:text-sm border border-red-200">Inactivo</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b flex gap-2">
                      <button className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm" onClick={() => setEditPopulationGrade(populationGrade)}>Editar</button>
                      {populationGrade.state ? (
                        <button className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm" onClick={() => handleDeactivate(populationGrade.id)}>Desactivar</button>
                      ) : (
                        <button className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm" onClick={() => handleActivate(populationGrade.id)}>Activar</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div>
            {filtered.length === 0 ? (
              <>Mostrando 0 grados de población</>
            ) : (
              (() => {
                const start = (currentPage - 1) * pageSize + 1;
                const end = Math.min(filtered.length, currentPage * pageSize);
                return <>Mostrando {start}-{end} de {filtered.length} grados de población</>;
              })()
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1 rounded-full border ${currentPage === 1 ? 'text-gray-300 border-gray-200 bg-white' : 'text-gray-700 border-gray-200 bg-white hover:bg-gray-50'}`}>Anterior</button>

            {(() => {
              const pages: number[] = [];
              let start = Math.max(1, currentPage - 2);
              let end = Math.min(totalPages, start + 4);
              if (end - start < 4) start = Math.max(1, end - 4);
              for (let i = start; i <= end; i++) pages.push(i);
              return pages.map((p) => (
                <button key={p} onClick={() => goToPage(p)} aria-current={p === currentPage} className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm ${p === currentPage ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
              ));
            })()}

            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1 rounded-full border ${currentPage === totalPages ? 'text-gray-300 border-gray-200 bg-white' : 'text-gray-700 border-gray-200 bg-white hover:bg-gray-50'}`}>Siguiente</button>
          </div>
        </div>
      </div>

      {editPopulationGrade && (
        <EditPopulationGradeForm
          populationGrade={editPopulationGrade}
          onClose={() => setEditPopulationGrade(null)}
          onUpdated={() => {
            setLoading(true);
            fetchPopulationGrades();
          }}
        />
      )}
      {addPopulationGradeOpen && (
        <AddPopulationGradeForm
          onClose={() => setAddPopulationGradeOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchPopulationGrades();
          }}
        />
      )}
    </div>
  );
};

export default PopulationGradeList;