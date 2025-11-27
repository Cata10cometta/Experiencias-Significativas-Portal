import React, { useEffect, useState } from "react";
import axios from "axios";
import { State } from "../types/state";


interface EditStateFormProps {
  stateItem: State;
  onClose: () => void;
  onUpdated: () => void;
}

const EditStateForm: React.FC<EditStateFormProps> = ({ stateItem, onClose, onUpdated }) => {
  const [name, setName] = useState(stateItem.name);
  const [code, setCode] = useState(stateItem.code);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/StateExperience`,
        {
          id: stateItem.id,
          name,
          code,
          state: stateItem.state ?? true,
          createdAt: stateItem.createdAt ?? new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onUpdated();
      onClose();
    } catch {
      setError("Error al actualizar estado");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Estado</h3>
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

interface AddStateFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddStateForm: React.FC<AddStateFormProps> = ({ onClose, onAdded }) => {
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
        `/api/StateExperience`,
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
      setError("Error al agregar estado");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Estado</h3>
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

const StateList: React.FC = () => {
  const [states, setStates] = useState<State[]>([]);
  const [editState, setEditState] = useState<State | null>(null);
  const [addStateOpen, setAddStateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyState, setOnlyState] = useState(true); // Estado para filtrar activos/inactivos (OnlyState)
  const [modal, setModal] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({ open: false, type: 'success', message: '' });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const fetchStates = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    axios
      .get(`/api/StateExperience/getAll`, {
        params: { OnlyState: onlyState }, // Usar el filtro OnlyState
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const statesNormalized = res.data.data.map((stateItem: State) => ({
            ...stateItem,
            state: onlyState, // Asignar el estado basado en el filtro OnlyState
          }));
          setStates(statesNormalized);
        } else {
          setStates([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar estados");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStates();
  }, [onlyState]); // Refrescar cuando cambie el filtro

  const filtered = states.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (`${s.code || ''} ${s.name || ''}`).toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filtered.length, totalPages]);

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  if (loading) return <div>Cargando estados...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/StateExperience/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStates(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar estado:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/StateExperience/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStates(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar estado:", err);
    }
  };

  return (
    <div className="max-w-full mx-auto mt-10 p-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-sky-700">Lista de Estados</h2>
            <p className="text-sm text-gray-500 mt-1">Administra los estados del sistema</p>
          </div>
          <div>
            <button onClick={() => setAddStateOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-600 text-white hover:bg-sky-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
              <span>Agregar Estado</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Buscar estados..." className="pl-10 pr-4 h-12 border rounded-full w-full bg-gray-50 shadow-sm" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
              </div>
            </div>
          </div>
          {/* Botones de filtro activos/inactivos, estilo login modal, verde/rojo */}
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded font-semibold ${onlyState ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-black'}`}
              onClick={() => { setOnlyState(true); setCurrentPage(1); }}
              type="button"
            >
              Mostrar Activos
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold ${!onlyState ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-black'}`}
              onClick={() => { setOnlyState(false); setCurrentPage(1); }}
              type="button"
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
                  <td colSpan={4} className="py-6 px-4 text-center text-gray-500">No hay estados para mostrar.</td>
                </tr>
              ) : (
                paginated.map((stateItem) => (
                  <tr key={stateItem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-4 border-b">{stateItem.code}</td>
                    <td className="py-2 px-4 border-b">{stateItem.name}</td>
                    <td className="py-2 px-4 border-b">
                      {stateItem.state ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">Activo</span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-500 border border-red-200 px-3 py-1 rounded-full text-xs sm:text-sm">Inactivo</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b flex gap-2">
                      <button className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm" onClick={() => setEditState(stateItem)}>Editar</button>
                      {stateItem.state ? (
                        <button className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm" onClick={() => handleDeactivate(stateItem.id)}>Desactivar</button>
                      ) : (
                        <button className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm" onClick={() => handleActivate(stateItem.id)}>Activar</button>
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
              <>Mostrando 0 estados</>
            ) : (
              (() => {
                const start = (currentPage - 1) * pageSize + 1;
                const end = Math.min(filtered.length, currentPage * pageSize);
                return <>Mostrando {start}-{end} de {filtered.length} estados</>;
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

      {editState && (
        <EditStateForm
          stateItem={editState}
          onClose={() => setEditState(null)}
          onUpdated={() => {
            setLoading(true);
            fetchStates();
          }}
        />
      )}
      {addStateOpen && (
        <AddStateForm
          onClose={() => setAddStateOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchStates();
          }}
        />
      )}
    </div>
  );
};

export default StateList;