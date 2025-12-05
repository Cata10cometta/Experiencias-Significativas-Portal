import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import axios from "axios";
import { securityModulesTourSteps, securityTourLocale, securityTourStyles } from "../../onboarding/securityTour";
import { Module } from "../types/module";

interface AddModuleFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddModuleForm: React.FC<AddModuleFormProps> = ({ onClose, onAdded }) => {
  // Paso 1: Seleccionar o crear módulo
  const [modules, setModules] = useState<{ id: number; name: string; description: string }[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [showNewModule, setShowNewModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [creatingModule, setCreatingModule] = useState(false);

  // Paso 2: Seleccionar o crear formulario
  const [forms, setForms] = useState<{ id: number; name: string }[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormPath, setNewFormPath] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  const [newFormIcon, setNewFormIcon] = useState("");
  const [newFormOrder, setNewFormOrder] = useState(0);
  const [creatingForm, setCreatingForm] = useState(false);

  // Estado general
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar módulos y formularios existentes
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("/api/Module/getAll", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (Array.isArray(res.data.data)) setModules(res.data.data);
        else setModules([]);
      })
      .catch(() => setModules([]));
    axios.get("https://localhost:7263/api/Form/getAll", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (Array.isArray(res.data.data)) setForms(res.data.data);
        else setForms([]);
      })
      .catch(() => setForms([]));
  }, []);

  // Crear nuevo módulo
  const handleCreateModule = async () => {
    setCreatingModule(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("/api/Module", {
        id: 0,
        name: newModuleName.trim(),
        description: newModuleDescription.trim(),
        state: true,
        createdAt: new Date().toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const moduleId = res.data?.data?.id || res.data?.id;
      setModules(prev => [...prev, { id: moduleId, name: newModuleName.trim(), description: newModuleDescription.trim() }]);
      setSelectedModuleId(String(moduleId));
      setShowNewModule(false);
      setNewModuleName("");
      setNewModuleDescription("");
    } catch {
      setError("Error al crear módulo");
    }
    setCreatingModule(false);
  };

  // Crear nuevo formulario
  const handleCreateForm = async () => {
    setCreatingForm(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("https://localhost:7263/api/Form", {
        id: 0,
        name: newFormName.trim(),
        path: newFormPath.trim(),
        description: newFormDescription.trim(),
        icon: newFormIcon.trim(),
        order: Number(newFormOrder) || 0,
        state: true,
        createdAt: new Date().toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formId = res.data?.data?.id || res.data?.id;
      setForms(prev => [...prev, { id: formId, name: newFormName.trim() }]);
      setSelectedFormId(String(formId));
      setShowNewForm(false);
      setNewFormName("");
      setNewFormPath("");
      setNewFormDescription("");
      setNewFormIcon("");
      setNewFormOrder(0);
    } catch {
      setError("Error al crear formulario");
    }
    setCreatingForm(false);
  };

  // Relacionar módulo y formulario
  const handleRelate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Validar que ambos IDs sean válidos y numéricos
    if (!selectedModuleId || !selectedFormId || isNaN(Number(selectedModuleId)) || isNaN(Number(selectedFormId))) {
      setError("Debes seleccionar un módulo y un formulario válidos");
      setLoading(false);
      return;
    }
    const moduleIdNum = Number(selectedModuleId);
    const formIdNum = Number(selectedFormId);
    if (moduleIdNum <= 0 || formIdNum <= 0) {
      setError("Debes seleccionar un módulo y un formulario válidos");
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.post("https://localhost:7263/api/FormModule", {
        formId: formIdNum,
        moduleId: moduleIdNum,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);
      onAdded();
      onClose();
    } catch {
      setError("Error al asignar formulario al módulo");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleRelate} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Asignar Formulario a Módulo</h3>
        {/* Paso 1: Seleccionar o crear módulo */}
        <label className="block mb-2 font-semibold">Módulo</label>
        {!showNewModule ? (
          <>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedModuleId}
                onChange={e => setSelectedModuleId(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">-- Selecciona un módulo --</option>
                {modules.map(m => (
                  <option key={m.id} value={String(m.id)}>{m.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="px-3 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 whitespace-nowrap font-medium"
                onClick={() => { setShowNewModule(true); }}
              >
                Crear nuevo módulo
              </button>
            </div>
          </>
        ) : (
          <div className="mb-4">
            <input value={newModuleName} onChange={e => setNewModuleName(e.target.value)} className="w-full mb-2 p-2 border rounded" placeholder="Nombre del nuevo módulo" required />
            <input value={newModuleDescription} onChange={e => setNewModuleDescription(e.target.value)} className="w-full mb-2 p-2 border rounded" placeholder="Descripción del nuevo módulo" required />
            <button type="button" className="text-blue-600 text-sm underline" onClick={() => { setShowNewModule(false); setNewModuleName(""); setNewModuleDescription(""); }}>Seleccionar uno existente</button>
            <button type="button" className="ml-4 px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={handleCreateModule} disabled={creatingModule || !newModuleName.trim() || !newModuleDescription.trim()}>{creatingModule ? "Creando..." : "Crear módulo"}</button>
          </div>
        )}

        {/* Paso 2: Seleccionar o crear formulario */}
        <label className="block mb-2 font-semibold mt-4">Formulario</label>
        {!showNewForm ? (
          <>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedFormId}
                onChange={e => setSelectedFormId(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">-- Selecciona un formulario --</option>
                {forms.map(f => (
                  <option key={f.id} value={String(f.id)}>{f.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="px-3 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 whitespace-nowrap font-medium"
                onClick={() => { setShowNewForm(true); }}
              >
                Crear nuevo formulario
              </button>
            </div>
          </>
        ) : (
          <div className="mb-4">
            <input value={newFormName} onChange={e => setNewFormName(e.target.value)} className="w-full mb-2 p-2 border rounded" placeholder="Nombre del nuevo formulario" required />
            <input value={newFormPath} onChange={e => setNewFormPath(e.target.value)} className="w-full mb-2 p-2 border rounded" placeholder="Path del nuevo formulario" required />
            <input value={newFormDescription} onChange={e => setNewFormDescription(e.target.value)} className="w-full mb-2 p-2 border rounded" placeholder="Descripción del nuevo formulario" required />
            <input value={newFormIcon} onChange={e => setNewFormIcon(e.target.value)} className="w-full mb-2 p-2 border rounded" placeholder="Icono (URL o nombre)" required />
            <input type="number" value={newFormOrder} onChange={e => setNewFormOrder(Number(e.target.value))} className="w-full mb-2 p-2 border rounded" placeholder="Orden" min={0} required />
            <button type="button" className="text-blue-600 text-sm underline" onClick={() => { setShowNewForm(false); setNewFormName(""); setNewFormPath(""); setNewFormDescription(""); setNewFormIcon(""); setNewFormOrder(0); }}>Seleccionar uno existente</button>
            <button type="button" className="ml-4 px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={handleCreateForm} disabled={creatingForm || !newFormName.trim() || !newFormPath.trim() || !newFormDescription.trim() || !newFormIcon.trim() || isNaN(Number(newFormOrder))}>{creatingForm ? "Creando..." : "Crear formulario"}</button>
          </div>
        )}

        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading || creatingModule || creatingForm || !selectedModuleId || !selectedFormId} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">{loading ? "Asignando..." : "Asignar"}</button>
        </div>
      </form>
    </div>
  );
};

interface EditModuleFormProps {
  module: Module;
  onClose: () => void;
  onUpdated: () => void;
}

const EditModuleForm: React.FC<EditModuleFormProps> = ({ module, onClose, onUpdated }) => {
  const [name, setName] = useState(module.name);
  const [description, setDescription] = useState(module.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/Module`, {
        id: module.id,
        name,
        description,
        state: module.state ?? true,
        createdAt: module.createdAt ?? new Date().toISOString(),
  // ...eliminado deletedAt
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      onUpdated();
      onClose();
    } catch (err) {
      setError("Error al actualizar módulo");
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Módulo</h3>
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Descripción</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">{loading ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
};

const Modules: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [editModule, setEditModule] = useState<Module | null>(null);
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [runTour, setRunTour] = useState(false);

  const fetchModules = (onlyState: boolean | null) => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/Module/getAll", {
        params: { OnlyState: onlyState },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          // Si el filtro está activo, forzar el estado visual igual que en RolesList
          setModules((res.data.data as Module[]).map((mod: Module) => ({ ...mod, state: onlyState === null ? mod.state : onlyState })));
        } else {
          setModules([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar módulos");
        setLoading(false);
      });
  };


  // Estado para el filtro OnlyState (null = todos, true = activos, false = inactivos)
  const [onlyState, setOnlyState] = useState<boolean | null>(true);

  useEffect(() => {
    fetchModules(onlyState);
  }, [onlyState]);

  useEffect(() => {
    if (!loading && !runTour && !localStorage.getItem("securityModulesTourDone")) {
      const timer = window.setTimeout(() => setRunTour(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, [loading, runTour]);


  // Los hooks deben ir siempre al inicio del componente
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  // Simular filtrado y paginación
  const filtered = modules.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <div>Cargando módulos...</div>;
  if (error) return <div>{error}</div>;


  return (
    <div className="max-w-7xl mx-auto mt-10 p-2 sm:p-6 bg-white rounded-xl shadow-lg security-modules-layout">
      <Joyride
        steps={securityModulesTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={securityTourLocale}
        styles={securityTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunTour(false);
            localStorage.setItem("securityModulesTourDone", "true");
          }
        }}
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 security-modules-header">
        <div>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 -mt-8">
              <svg width="55" height="55" viewBox="0 0 48 48" className="w-11 h-11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <mask id="path-1-inside-1_2506_2260" fill="white">
                  <path d="M0 16C0 7.16344 7.16344 0 16 0H32C40.8366 0 48 7.16344 48 16V32C48 40.8366 40.8366 48 32 48H16C7.16344 48 0 40.8366 0 32V16Z"/>
                </mask>
                <path d="M0 16C0 7.16344 7.16344 0 16 0H32C40.8366 0 48 7.16344 48 16V32C48 40.8366 40.8366 48 32 48H16C7.16344 48 0 40.8366 0 32V16Z" fill="#7CDDFE" fillOpacity="0.1"/>
                <path d="M16 0V1H32V0V-1H16V0ZM48 16H47V32H48H49V16H48ZM32 48V47H16V48V49H32V48ZM0 32H1V16H0H-1V32H0ZM16 48V47C7.71573 47 1 40.2843 1 32H0H-1C-1 41.3888 6.61116 49 16 49V48ZM48 32H47C47 40.2843 40.2843 47 32 47V48V49C41.3888 49 49 41.3888 49 32H48ZM32 0V1C40.2843 1 47 7.71573 47 16H48H49C49 6.61116 41.3888 -1 32 -1V0ZM16 0V-1C6.61116 -1 -1 6.61116 -1 16H0H1C1 7.71573 7.71573 1 16 1V0Z" fill="#7CDDFE" fillOpacity="0.2" mask="url(#path-1-inside-1_2506_2260)"/>
                <path d="M32 25C32 30 28.5 32.5 24.34 33.95C24.1222 34.0238 23.8855 34.0202 23.67 33.94C19.5 32.5 16 30 16 25V18C16 17.7347 16.1054 17.4804 16.2929 17.2929C16.4804 17.1053 16.7348 17 17 17C19 17 21.5 15.8 23.24 14.28C23.4519 14.099 23.7214 13.9995 24 13.9995C24.2786 13.9995 24.5481 14.099 24.76 14.28C26.51 15.81 29 17 31 17C31.2652 17 31.5196 17.1053 31.7071 17.2929C31.8946 17.4804 32 17.7347 32 18V25Z" stroke="#7CDDFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-sky-700">Gestión de Módulos</h2>
              <p className="text-sm text-gray-500 mt-1">Administra los módulos y funcionalidades del sistema</p>
            </div>
          </div>
        </div>
        <div className="security-modules-create">
          <button
            onClick={() => setAddModuleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-2xl! shadow hover:bg-sky-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Crear módulo
          </button>
        </div>
      </div>

      {/* Search row below header */}
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 security-modules-filters">
        <div className="flex-1 w-full">
          <div className="relative">
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar módulos..."
              className="pl-10 pr-3 py-2 border rounded-2xl w-full bg-gray-50"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <label className="text-sm text-gray-600">Estado:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={onlyState === null ? '' : onlyState ? 'true' : 'false'}
            onChange={e => {
              const val = e.target.value;
              if (val === '') setOnlyState(null);
              else if (val === 'true') setOnlyState(true);
              else setOnlyState(false);
            }}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-2 sm:p-4 security-modules-table">
        <table className="min-w-[700px] w-full rounded-lg overflow-hidden">
          <thead className="text-left text-sm text-gray-600 bg-gray-50">
            <tr>
              <th className="py-3 px-4">Módulo</th>
              <th className="py-3 px-4">Descripción</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {paginated.map((module) => (
              <tr key={module.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="py-4 px-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 ring-1 ring-sky-100">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="#7CDDFE" strokeWidth="1.5" fill="#7CDDFE" fillOpacity="0.15"/></svg>
                  </div>
                  <span className="font-semibold text-gray-800">{module.name}</span>
                </td>
                <td className="py-4 px-4 text-gray-600">{module.description}</td>
                <td className="py-4 px-4">
                  {module.state ? (
                    <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Activo</span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Inactivo</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <button
                      className="text-gray-400 hover:text-sky-600"
                      onClick={() => setEditModule(module)}
                      title="Editar"
                    >
                      {/* Icono lápiz igual que RolesList */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464L14.586 2.586a2 2 0 012.828 0z"/>
                      </svg>
                    </button>
                    <button
                      className="text-red-400 hover:text-red-600"
                      onClick={async () => {
                        const token = localStorage.getItem("token");
                        try {
                          await axios.put(`/api/Module/${module.id}`, {
                            ...module,
                            state: false,
                            deletedAt: new Date().toISOString(),
                          }, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          setLoading(true);
                          fetchModules(onlyState);
                        } catch (err: any) {
                          if (err?.response?.status === 400 && err?.response?.data?.message) {
                            setDeleteError(err.response.data.message);
                          } else {
                            setDeleteError("No se puede eliminar este Módulo porque todavía tiene registros relacionados activos. Por favor, desactiva primero sus datos asociados antes de eliminarlo.");
                          }
                        }
                      }}
                      title="Eliminar"
                    >
                      {/* Icono basurero igual que RolesList */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v9a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 10-2 0v7a1 1 0 102 0V7z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 security-modules-pagination">
        <div className="text-sm text-gray-500">
          {filtered.length === 0 ? (
            <>Mostrando 0 módulos</>
          ) : (
            (() => {
              const start = (currentPage - 1) * pageSize + 1;
              const end = Math.min(filtered.length, currentPage * pageSize);
              return <>Mostrando {start}-{end} de {filtered.length} módulos</>;
            })()
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Anterior</button>
          {(() => {
            const pages: number[] = [];
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + 4);
            if (end - start < 4) start = Math.max(1, end - 4);
            for (let i = start; i <= end; i++) pages.push(i);
            return pages.map((p) => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 rounded ${currentPage === p ? 'bg-sky-600 text-white' : 'bg-white border'}`}>{p}</button>
            ));
          })()}
          <button className="px-3 py-1 rounded border" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Siguiente</button>
        </div>
      </div>

        {editModule && (
          <EditModuleForm
            module={editModule}
            onClose={() => setEditModule(null)}
            onUpdated={() => {
              setLoading(true);
              fetchModules(onlyState);
            }}
          />
        )}
        {addModuleOpen && (
          <AddModuleForm
            onClose={() => setAddModuleOpen(false)}
            onAdded={() => {
              setLoading(true);
              fetchModules(onlyState);
            }}
          />
        )}
        {/* Modal de error al eliminar módulo */}
        {deleteError && (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-2 sm:p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
              <h3 className="text-xl font-bold mb-4 text-red-700">No se puede eliminar el Módulo</h3>
              <p className="mb-6 text-gray-700">{deleteError}</p>
              <button
                className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
                onClick={() => setDeleteError(null)}
              >Cerrar</button>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default Modules;