import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import axios from "axios";
import { parameterGradesTourSteps, parameterTourLocale, parameterTourStyles } from "../../onboarding/parameterTour";
import { Grade } from "../types/grade";



interface EditGradeFormProps {
  grade: Grade;
  onClose: () => void;
  onUpdated: () => void;
}

const EditGradeForm: React.FC<EditGradeFormProps> = ({ grade, onClose, onUpdated }) => {
  const [name, setName] = useState(grade.name);
  const [code, setCode] = useState(grade.code);
  const [description, setDescription] = useState(grade.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/Grade`,
        {
          id: grade.id,
          name,
          code,
          description,
          state: grade.state ?? true,
          createdAt: grade.createdAt ?? new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onUpdated();
      onClose();
    } catch {
      setError("Error al actualizar grado");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Grado</h3>
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

interface AddGradeFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddGradeForm: React.FC<AddGradeFormProps> = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `/api/Grade`,
        {
          id: 0,
          name,
          code,
          description,
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
      setError("Error al agregar grado");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Grado</h3>
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

const GradeList: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [editGrade, setEditGrade] = useState<Grade | null>(null);
  const [addGradeOpen, setAddGradeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyState, setOnlyState] = useState(true); // Estado para filtrar activos/inactivos (OnlyState)
  const [modal, setModal] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({ open: false, type: 'success', message: '' });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;
  const [runTour, setRunTour] = useState(false);

  const fetchGrades = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    const attempts = [
      { url: `/api/Grade/getAll`, config: { params: { OnlyState: onlyState } } },
      { url: `/api/Grade`, config: { params: { OnlyState: onlyState } } },
      { url: `/api/Grade/GetAll`, config: { params: { OnlyState: onlyState } } },
      { url: `/api/Grade/getall`, config: { params: { OnlyState: onlyState } } },
    ];

    for (const attempt of attempts) {
      try {
        const res = await axios.get(attempt.url, {
          headers: { Authorization: `Bearer ${token}` },
          ...(attempt.config || {}),
        } as any);

        // Debug info to help diagnose shape in user's environment
        console.debug('[Grade] fetched from', attempt.url, 'status', res.status, 'payload sample', res.data && (Array.isArray(res.data) ? res.data[0] : res.data?.data?.[0] ?? res.data?.result?.[0]));

        // support multiple response shapes
        let items: any[] = [];
        if (Array.isArray(res.data)) items = res.data;
        else if (Array.isArray(res.data.data)) items = res.data.data;
        else if (res.data && Array.isArray(res.data.result)) items = res.data.result;

        if (!Array.isArray(items)) {
          // if backend responded but not with an array, try next
          console.debug('[Grade] unexpected payload shape from', attempt.url);
          continue;
        }

        // log a short sample for quick inspection
        console.debug('[Grade] items length:', items.length, 'first item sample:', items[0]);

        const gradesNormalized = items.map((g: any) => {
          const code = g.code ?? g.codigo ?? g.key ?? g.value ?? g.codigoGrade ?? "";
          const name = g.name ?? g.nombre ?? g.title ?? g.label ?? g.nombreGrade ?? "";
        
          return {
            ...g,
            code,
            name,
           
            state: typeof g.state === 'boolean' ? g.state : onlyState,
          } as Grade;
        });

        setGrades(gradesNormalized);
        setLoading(false);
        return;
      } catch (err: any) {
        const status = err?.response?.status;
        console.debug('[Grade] fetch error from', attempt.url, 'status', status);
        if (status === 404) continue; // try next
        console.error('fetchGrades error', err);
        setError("Error al cargar grados");
        setLoading(false);
        return;
      }
    }

    setError('Error al cargar grados (endpoint no disponible o payload inesperado)');
    setLoading(false);
  };

  useEffect(() => {
    fetchGrades();
  }, [onlyState]); // Refrescar cuando cambie el filtro

  useEffect(() => {
    if (!loading && !runTour && !localStorage.getItem("parameterGradesTourDone")) {
      const timer = window.setTimeout(() => setRunTour(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, [loading, runTour]);
  const filtered = grades.filter((g) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (`${g.code || ''} ${g.name || ''} ${g.description || ''}`).toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filtered.length, totalPages]);

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  if (loading) return <div>Cargando grados...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/Grade/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({ open: true, type: 'success', message: 'Grado desactivado correctamente.' });
      fetchGrades(); // Refrescar lista
    } catch (err) {
      setModal({ open: true, type: 'error', message: 'Error al desactivar grado.' });
      console.error("Error al desactivar grado:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/Grade/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({ open: true, type: 'success', message: 'Grado activado correctamente.' });
      fetchGrades(); // Refrescar lista
    } catch (err) {
      setModal({ open: true, type: 'error', message: 'Error al activar grado.' });
      console.error("Error al activar grado:", err);
    }
  };

  return (
    <div className="max-w-full mx-auto mt-10 p-6 parameter-grades-layout">
      <Joyride
        steps={parameterGradesTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={parameterTourLocale}
        styles={parameterTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunTour(false);
            localStorage.setItem("parameterGradesTourDone", "true");
          }
        }}
      />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4 parameter-grades-header">
          <div>
            <h2 className="text-2xl font-bold text-sky-700">Lista de Grados</h2>
            <p className="text-sm text-gray-500 mt-1">Administra los grados del sistema</p>
          </div>
          <div>
            <button onClick={() => setAddGradeOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full! bg-sky-600 text-white hover:bg-sky-700 parameter-grades-create">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
              <span>Agregar Grado</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4 parameter-grades-toolbar">
          <div className="flex-1">
            <div className="relative parameter-grades-search">
              <input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Buscar grados..." className="pl-10 pr-4 h-12 border rounded-full w-full bg-gray-50 shadow-sm" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
              </div>
            </div>
          </div>
          <div className="flex gap-4 parameter-grades-filters">
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

        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-4 parameter-grades-table">
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
                  <td colSpan={4} className="py-4 px-3 text-center text-gray-500">No hay grados para mostrar.</td>
                </tr>
              ) : (
                paginated.map((grade) => (
                  <tr key={grade.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-2 px-3 break-words max-w-xs">{grade.code}</td>
                    <td className="py-2 px-3 break-words max-w-xs">{grade.name}</td>
                    <td className="py-2 px-3">
                      {grade.state ? (
                        <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs sm:text-sm">Activo</span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-500 px-3 py-1 rounded-full text-xs sm:text-sm border border-red-200">Inactivo</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button className="text-gray-400 hover:text-sky-600 p-1 sm:p-1.5 rounded-full!" style={{minWidth:24}} onClick={() => setEditGrade(grade)} title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464L14.586 2.586a2 2 0 012.828 0z"/></svg>
                        </button>
                        {grade.state ? (
                          <button className="text-red-400 hover:text-red-600 p-1 sm:p-1.5 rounded-full" style={{minWidth:24}} onClick={() => handleDeactivate(grade.id)} title="Desactivar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v9a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 10-2 0v7a1 1 0 102 0V7z" clipRule="evenodd"/></svg>
                          </button>
                        ) : (
                          <button className="text-emerald-500 hover:text-emerald-600 p-1 sm:p-1.5 rounded-full" style={{minWidth:24}} onClick={() => handleActivate(grade.id)} title="Activar">
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

        <div className="mt-6 flex items-center justify-between parameter-grades-pagination">
          <div className="text-sm text-gray-500">
            {filtered.length === 0 ? (
              <>Mostrando 0 grados</>
            ) : (
              (() => {
                const start = (currentPage - 1) * pageSize + 1;
                const end = Math.min(filtered.length, currentPage * pageSize);
                return <>Mostrando {start}-{end} de {filtered.length} grados</>;
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

      {editGrade && (
        <EditGradeForm
          grade={editGrade}
          onClose={() => setEditGrade(null)}
          onUpdated={() => {
            setLoading(true);
            fetchGrades();
          }}
        />
      )}
      {addGradeOpen && (
        <AddGradeForm
          onClose={() => setAddGradeOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchGrades();
          }}
        />
      )}
    {/* Modal de éxito/error tipo inicio */}
    {modal.open && (
      <div className="fixed inset-0 flex items-center justify-center z-[2000]">
        <div className="bg-white rounded-2xl shadow-lg p-8 min-w-[340px] max-w-sm flex flex-col items-center">
          {modal.type === 'success' ? (
            <svg className="w-16 h-16 mb-4" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="#B7EFC2" strokeWidth="3" fill="#F6FFF9"/><path d="M16 25l6 6 10-14" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg className="w-16 h-16 mb-4" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="#FECACA" strokeWidth="3" fill="#FFF6F6"/><path d="M17 17l14 14M31 17l-14 14" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/></svg>
          )}
          <h3 className="text-2xl font-bold text-gray-700 mb-2">{modal.type === 'success' ? 'Éxito' : 'Error'}</h3>
          <p className="text-gray-600 mb-6 text-center">{modal.message}</p>
          <button
            className="px-6 py-2 rounded bg-[#7B6EF6] text-white font-semibold text-base hover:bg-[#5f54c7] transition"
            onClick={() => setModal({ ...modal, open: false })}
          >
            Continuar
          </button>
        </div>
      </div>
    )}
    </div>
  );
};

export default GradeList;