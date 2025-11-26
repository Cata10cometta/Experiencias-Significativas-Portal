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
        `/api/State`,
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
        `/api/State`,
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
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar activos/inactivos
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const fetchStates = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    // Try several possible endpoints / response shapes to be resilient to backend differences
    const attempts = [
      // server in your environment exposes StateExperience/getAll
      { url: `/api/StateExperience/getAll`, config: { params: { OnlyActive: onlyActive } } },
      { url: `/api/State/getAll`, config: { params: { OnlyActive: onlyActive } } },
      { url: `/api/State`, config: { params: { OnlyActive: onlyActive } } },
      { url: `/api/State/getAll`, config: {} },
      { url: `/api/State/GetAll`, config: { params: { OnlyActive: onlyActive } } },
    ];

    for (const attempt of attempts) {
      try {
        console.debug('[State] trying', attempt.url, attempt.config || {});
        const res = await axios.get(attempt.url, {
          headers: { Authorization: `Bearer ${token}` },
          ...(attempt.config || {}),
        } as any);

        console.debug('[State] fetched from', attempt.url, 'status', res.status);

        // Normalize possible response shapes:
        // - { data: [...] }
        // - [...] (array)
        // - { data: { data: [...] } } (some APIs wrap twice)
        let items: any[] = [];
        if (Array.isArray(res.data)) items = res.data;
        else if (Array.isArray(res.data.data)) items = res.data.data;
        else if (res.data && Array.isArray(res.data.data?.data)) items = res.data.data.data;

        if (!Array.isArray(items)) {
          // nothing usable, but backend didn't 404 — log payload and treat as empty
          console.debug('[State] unexpected payload shape from', attempt.url, 'payload sample', res.data);
          items = [];
        }

        const statesNormalized = items.map((stateItem: State) => ({
          ...stateItem,
          state: typeof stateItem.state === 'boolean' ? stateItem.state : onlyActive,
        }));

        setStates(statesNormalized);
        setLoading(false);
        return;
      } catch (err: any) {
        // if 404 try next candidate, otherwise surface error
        const status = err?.response?.status;
        if (status === 404) continue;
        console.error('Error fetching states from', attempt.url, err);
        setError('Error al cargar estados');
        setLoading(false);
        return;
      }
    }

    // If we reached here, all attempts failed with 404 or returned unusable payload
    setError('Error al cargar estados (endpoint no disponible)');
    setLoading(false);
  };

  useEffect(() => {
    fetchStates();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

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
      await axios.delete(`/api/State/${id}`, {
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
      await axios.patch(`/api/State/restore/${id}`, {}, {
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
            <button onClick={() => setAddStateOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full! bg-sky-600 text-white hover:bg-sky-700">
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

        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <table className="min-w-full rounded-lg overflow-hidden text-sm sm:text-base">
            <thead className="text-left text-sm sm:text-base text-gray-600 bg-gray-50">
              <tr>
                <th className="py-2 px-3 whitespace-break-spaces">Código</th>
                <th className="py-2 px-3 whitespace-break-spaces">Nombre</th>
                <th className="py-2 px-3 whitespace-break-spaces">Estado</th>
                <th className="py-2 px-3 whitespace-break-spaces">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm sm:text-base text-gray-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-3 text-center text-gray-500">No hay estados para mostrar.</td>
                </tr>
              ) : (
                paginated.map((stateItem) => (
                  <tr key={stateItem.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-2 px-3 break-words max-w-xs">{stateItem.code}</td>
                    <td className="py-2 px-3 break-words max-w-xs">{stateItem.name}</td>
                    <td className="py-2 px-3">
                      {stateItem.state ? (
                        <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs sm:text-sm">Activo</span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs sm:text-sm">Inactivo</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button className="text-gray-400 hover:text-sky-600 p-1 sm:p-1.5" style={{minWidth:24}} onClick={() => setEditState(stateItem)} title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464L14.586 2.586a2 2 0 012.828 0z"/></svg>
                        </button>
                        {stateItem.state ? (
                          <button className="text-red-400 hover:text-red-600 p-1 sm:p-1.5" style={{minWidth:24}} onClick={() => handleDeactivate(stateItem.id)} title="Desactivar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v9a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 10-2 0v7a1 1 0 102 0V7z" clipRule="evenodd"/></svg>
                          </button>
                        ) : (
                          <button className="text-emerald-500 hover:text-emerald-600 p-1 sm:p-1.5" style={{minWidth:24}} onClick={() => handleActivate(stateItem.id)} title="Activar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 10a7 7 0 1114 0 1 1 0 102 0 9 9 0 10-18 0 1 1 0 102 0z"/><path d="M10 6v5l3 3"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
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
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
            {(() => {
              const pages: number[] = [];
              let start = Math.max(1, currentPage - 2);
              let end = Math.min(totalPages, start + 4);
              if (end - start < 4) start = Math.max(1, end - 4);
              for (let i = start; i <= end; i++) pages.push(i);
              return pages.map((p) => (
                <button key={p} onClick={() => goToPage(p)} className={`px-3 py-1 rounded ${currentPage === p ? 'bg-sky-600 text-white' : 'bg-white border'}`}>{p}</button>
              ));
            })()}
            <button className="px-3 py-1 rounded border" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
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