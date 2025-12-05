import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import axios from "axios";
import { parameterCriteriaTourSteps, parameterTourLocale, parameterTourStyles } from "../../onboarding/parameterTour";
import { hasTourBeenSeen, markTourSeen } from "../../../shared/utils/tourStorage";
import { Criteria } from "../types/criteria";


interface EditCriteriaFormProps {
  criteria: Criteria;
  onClose: () => void;
  onUpdated: () => void;
}

const EditCriteriaForm: React.FC<EditCriteriaFormProps> = ({ criteria, onClose, onUpdated }) => {
  const [name, setName] = useState(criteria.name);
  const [code, setCode] = useState(criteria.code);
  const [descriptionContribution, setDescriptionContribution] = useState(criteria.descriptionContribution);
  const [descruotionType, setDescruotionType] = useState(criteria.descruotionType);
  const [evaluationValue, setEvaluationValue] = useState(criteria.evaluationValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/Criteria`,
        {
          id: criteria.id,
          name,
          code,
          descriptionContribution,
          descruotionType,
          evaluationValue,
          state: criteria.state ?? true,
          createdAt: criteria.createdAt ?? new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onUpdated();
      onClose();
    } catch {
      setError("Error al actualizar criterio");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Criterio</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Contribución</label>
        <input
          value={descriptionContribution}
          onChange={(e) => setDescriptionContribution(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <label className="block mb-2 font-semibold">Tipo</label>
        <input
          value={descruotionType}
          onChange={(e) => setDescruotionType(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <label className="block mb-2 font-semibold">Valor de Evaluación</label>
        <input
          value={evaluationValue}
          onChange={(e) => setEvaluationValue(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
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

interface AddCriteriaFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddCriteriaForm: React.FC<AddCriteriaFormProps> = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [descriptionContribution, setDescriptionContribution] = useState("");
  const [descruotionType, setDescruotionType] = useState("");
  const [evaluationValue, setEvaluationValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `/api/Criteria`,
        {
          id: 0,
          name,
          code,
          descriptionContribution,
          descruotionType,
          evaluationValue,
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
      setError("Error al agregar criterio");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl! shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Criterio</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Contribución</label>
        <input
          value={descriptionContribution}
          onChange={(e) => setDescriptionContribution(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <label className="block mb-2 font-semibold">Tipo</label>
        <input
          value={descruotionType}
          onChange={(e) => setDescruotionType(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <label className="block mb-2 font-semibold">Valor de Evaluación</label>
        <input
          value={evaluationValue}
          onChange={(e) => setEvaluationValue(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
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

const CriteriaList: React.FC = () => {
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [editCriteria, setEditCriteria] = useState<Criteria | null>(null);
  const [addCriteriaOpen, setAddCriteriaOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyState, setOnlyState] = useState<true | false>(true); // Mostrar activos por defecto
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [modal, setModal] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({ open: false, type: 'success', message: '' });
  const pageSize = 5;
  const [runTour, setRunTour] = useState(false);

  const fetchCriteria = () => {
    const token = localStorage.getItem("token");
    const params = { OnlyState: onlyState };
    axios
      .get(`/api/Criteria/getAll`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          // Si OnlyState es true y no viene el campo state, asumimos activo; si es false, inactivo
          const normalized = res.data.data.map((c: any) => ({
            ...c,
            state: c.state !== undefined ? (c.state === true || c.state === 1 || c.state === "1" || c.state === "true") : onlyState
          }));
          setCriteria(normalized);
        } else {
          setCriteria([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar criterios");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCriteria();
  }, [onlyState]); // Refrescar cuando cambie el filtro

  useEffect(() => {
    if (!loading && !runTour && !hasTourBeenSeen("parameterCriteriaTourDone")) {
      const timer = window.setTimeout(() => setRunTour(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, [loading, runTour]);

  const filtered = criteria.filter((c) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (`${c.code || ''} ${c.name || ''} ${c.descriptionContribution || ''} ${c.descruotionType || ''}`).toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filtered.length, totalPages]);

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  if (loading) return <div>Cargando criterios...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/Criteria/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({ open: true, type: 'success', message: 'Criterio desactivado correctamente.' });
      fetchCriteria();
    } catch (err) {
      setModal({ open: true, type: 'error', message: 'Error al desactivar criterio.' });
      console.error("Error al desactivar criterio:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/Criteria/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({ open: true, type: 'success', message: 'Criterio activado correctamente.' });
      fetchCriteria();
    } catch (err) {
      setModal({ open: true, type: 'error', message: 'Error al activar criterio.' });
      console.error("Error al activar criterio:", err);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto mt-6 px-2 sm:px-6 py-4 sm:py-6 parameter-criteria-layout">
      <Joyride
        steps={parameterCriteriaTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={parameterTourLocale}
        styles={parameterTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunTour(false);
            markTourSeen("parameterCriteriaTourDone");
          }
        }}
      />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 sm:p-6">
        <div className="flex items-start justify-between mb-4 parameter-criteria-header">
          <div>
            <h2 className="text-2xl font-bold text-sky-700">Lista de Criterios</h2>
            <p className="text-sm text-gray-500 mt-1">Administra los criterios del sistema</p>
          </div>
          <div>
            <button onClick={() => setAddCriteriaOpen(true)} className="inline-flex items-center gap-2 px-6 py-2 rounded-full! bg-sky-600 text-white hover:bg-sky-700 shadow-md transition-all parameter-criteria-create">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
              <span>Agregar Criterio</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 parameter-criteria-toolbar">
          <div className="flex-1 w-full">
            <div className="relative parameter-criteria-search">
              <input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Buscar criterios..." className="pl-10 pr-4 h-12 border rounded-full w-full bg-gray-50 shadow-sm" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
              </div>
            </div>
          </div>
          <div className="flex gap-4 parameter-criteria-filters w-full sm:w-auto">
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

        <div className="overflow-x-auto overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-2 sm:p-4 max-h-[60vh] parameter-criteria-table">
          <table className="min-w-[600px] w-full rounded-lg overflow-hidden text-sm sm:text-base">
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
                  <td colSpan={4} className="py-4 px-3 text-center text-gray-500">No hay criterios para mostrar.</td>
                </tr>
              ) : (
                paginated.map((criterion) => (
                  <tr key={criterion.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-2 px-3 break-words max-w-xs">{criterion.code}</td>
                    <td className="py-2 px-3 break-words max-w-xs">{criterion.name}</td>
                    <td className="py-2 px-3">
                      {(criterion.state === true || ['1', 'true'].includes(String(criterion.state))) ? (
                        <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs sm:text-sm">Activo</span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs sm:text-sm">Inactivo</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button className="text-gray-400 hover:text-sky-600 p-1 sm:p-1.5" style={{minWidth:24}} onClick={() => setEditCriteria(criterion)} title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464L14.586 2.586a2 2 0 012.828 0z"/></svg>
                        </button>
                        {criterion.state ? (
                          <button className="text-red-400 hover:text-red-600 p-1 sm:p-1.5" style={{minWidth:24}} onClick={() => handleDeactivate(criterion.id)} title="Desactivar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v9a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 10-2 0v7a1 1 0 102 0V7z" clipRule="evenodd"/></svg>
                          </button>
                        ) : (
                          <button className="text-emerald-500 hover:text-emerald-600 p-1 sm:p-1.5" style={{minWidth:24}} onClick={() => handleActivate(criterion.id)} title="Activar">
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

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 parameter-criteria-pagination">
          <div className="text-sm text-gray-500">
            {filtered.length === 0 ? (
              <>Mostrando 0 criterios</>
            ) : (
              (() => {
                const start = (currentPage - 1) * pageSize + 1;
                const end = Math.min(filtered.length, currentPage * pageSize);
                return <>Mostrando {start}-{end} de {filtered.length} criterios</>;
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

      {editCriteria && (
        <EditCriteriaForm
          criteria={editCriteria}
          onClose={() => setEditCriteria(null)}
          onUpdated={() => {
            setLoading(true);
            fetchCriteria();
          }}
        />
      )}
      {addCriteriaOpen && (
        <AddCriteriaForm
          onClose={() => setAddCriteriaOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchCriteria();
          }}
        />
      )}
    {/* Modal de éxito/error tipo inicio */}
    {modal.open && (
      <div className="fixed inset-0 flex items-center justify-center z-[2000] bg-black bg-opacity-40 p-2">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 min-w-[260px] max-w-sm w-full flex flex-col items-center">
          {modal.type === 'success' ? (
            <svg className="w-16 h-16 mb-4" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="#B7EFC2" strokeWidth="3" fill="#F6FFF9"/><path d="M16 25l6 6 10-14" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg className="w-16 h-16 mb-4" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" stroke="#FECACA" strokeWidth="3" fill="#FFF6F6"/><path d="M17 17l14 14M31 17l-14 14" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/></svg>
          )}
          <h3 className="text-2xl font-bold text-gray-700 mb-2">{modal.type === 'success' ? 'Éxito' : 'Error'}</h3>
          <p className="text-gray-600 mb-6 text-center">{modal.message}</p>
          <button
            className="px-6 py-2 rounded bg-[#7B6EF6] text-white font-semibold text-base hover:bg-[#5f54c7] transition w-full"
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

export default CriteriaList;