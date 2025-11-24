import React, { useEffect, useState } from "react";
import axios from "axios";
import { Module } from "../types/module";

interface AddModuleFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddModuleForm: React.FC<AddModuleFormProps> = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formId, setFormId] = useState("");
  const [forms, setForms] = useState<{ id: number; name: string }[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [creatingForm, setCreatingForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cargar formularios disponibles desde el endpoint correcto
    const token = localStorage.getItem("token");
    axios.get("https://localhost:7263/api/Form/getAll", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (Array.isArray(res.data.data)) setForms(res.data.data);
        else setForms([]);
      })
      .catch(() => setForms([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    let createdFormId = null;
    try {
      // Si el usuario quiere crear un nuevo formulario
      if (showNewForm && newFormName.trim()) {
        setCreatingForm(true);
        const formRes = await axios.post("https://localhost:7263/api/Form", {
          id: 0,
          name: newFormName.trim(),
          description: newFormName.trim(),
          state: true,
          createdAt: new Date().toISOString(),
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        createdFormId = formRes.data?.data?.id || formRes.data?.id;
        setCreatingForm(false);
      }
      // Crear módulo
      const modRes = await axios.post("/api/Module", {
        id: 0,
        name,
        description,
        state: true,
        createdAt: new Date().toISOString(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const moduleId = modRes.data?.data?.id || modRes.data?.id;
      // Si se seleccionó formulario o se creó uno nuevo, crear relación
      const selectedFormId = showNewForm ? createdFormId : formId;
      if (selectedFormId && moduleId) {
        await axios.post("https://localhost:7263/api/FormModule", {
          formId: Number(selectedFormId),
          moduleId: Number(moduleId),
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setLoading(false);
      onAdded();
      onClose();
    } catch (err) {
      setError("Error al agregar módulo o asignar formulario");
      setLoading(false);
      setCreatingForm(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Módulo</h3>
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Descripción</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Formulario</label>
        {!showNewForm ? (
          <>
            <select value={formId} onChange={e => setFormId(e.target.value)} className="w-full mb-2 p-2 border rounded">
              <option value="">-- Selecciona un formulario --</option>
              {forms.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <button type="button" className="text-blue-600 text-sm underline mb-4" onClick={() => { setShowNewForm(true); setFormId(""); }}>Crear nuevo formulario</button>
          </>
        ) : (
          <div className="mb-4">
            <input value={newFormName} onChange={e => setNewFormName(e.target.value)} className="w-full mb-2 p-2 border rounded" placeholder="Nombre del nuevo formulario" required />
            <button type="button" className="text-blue-600 text-sm underline" onClick={() => { setShowNewForm(false); setNewFormName(""); }}>Seleccionar uno existente</button>
          </div>
        )}
        {creatingForm && <div className="text-gray-500 mb-2">Creando formulario...</div>}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading || creatingForm} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">{loading ? "Agregando..." : "Agregar"}</button>
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

  const fetchModules = () => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/Module/getAll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          setModules(res.data.data);
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

  useEffect(() => {
    fetchModules();
  }, []);


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
    <div className="max-w-7xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Módulos</h1>
            <p className="text-sm text-gray-500 mt-1">Administra los módulos y funcionalidades del sistema</p>
          </div>
          <div>
            <button
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 text-base font-semibold"
              onClick={() => setAddModuleOpen(true)}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Crear módulo
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8 mb-4">
          <div className="flex-1 relative">
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar módulos..."
              className="pl-12 pr-4 h-12 border rounded-full w-full bg-gray-50 shadow-sm"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
            </div>
          </div>
          <button className="px-4 py-2 rounded bg-white border text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-gray-600"><path d="M3 5h18v2L13 13v6l-2-1v-5L3 7V5z" fill="currentColor"/></svg>
            Filtrar
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white p-0">
          <table className="min-w-full w-full table-auto">
            <thead className="text-left text-sm text-gray-600 bg-gray-50">
              <tr>
                <th className="py-4 px-6">Módulo</th>
                <th className="py-4 px-6">Descripción</th>
                {/* <th className="py-4 px-6">Categoría</th> */}
                {/* <th className="py-4 px-6">Roles</th> */}
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-center text-gray-500">No hay módulos para mostrar.</td>
                </tr>
              ) : (
                paginated.map((module) => (
                  <tr key={module.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                          {/* Icono de cubo/hexágono azul claro */}
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="#7CDDFE" strokeWidth="1.5" fill="#7CDDFE" fillOpacity="0.15"/></svg>
                        </div>
                        <span className="font-semibold text-gray-800">{module.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{module.description}</td>
                    {/* <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{(module.category || 'General')}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">{module.rolesCount ?? 0}</span>
                    </td> */}
                    <td className="py-4 px-6">
                      {Number(module.state) === 1 ? (
                        <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Activo</span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Inactivo</span>
                      )}
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <button
                        className="p-2 rounded hover:bg-gray-100"
                        onClick={() => setEditModule(module)}
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none"><path d="M4 21h4l11-11a2.828 2.828 0 10-4-4L4 17v4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button
                        className="p-2 rounded hover:bg-gray-100"
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
                            fetchModules();
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none"><path d="M3 6h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
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
                <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 rounded ${currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{p}</button>
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
              fetchModules();
            }}
          />
        )}
        {addModuleOpen && (
          <AddModuleForm
            onClose={() => setAddModuleOpen(false)}
            onAdded={() => {
              setLoading(true);
              fetchModules();
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
    </div>
  );
};

export default Modules;