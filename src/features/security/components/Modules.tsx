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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.post("/api/Module", {
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
      setLoading(false);
      onAdded();
      onClose();
    } catch (err) {
      setError("Error al agregar módulo");
      setLoading(false);
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
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">{loading ? "Agregando..." : "Agregar"}</button>
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

  if (loading) return <div>Cargando módulos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Lista de Módulos</h2>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddModuleOpen(true)}
        >Agregar Módulo</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-sky-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Nombre</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Descripción</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {modules.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 px-4 text-center text-gray-500">No hay módulos para mostrar.</td>
              </tr>
            ) : (
              modules.map((module) => (
                <tr key={module.id} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{module.name}</td>
                  <td className="py-2 px-4 border-b">{module.description}</td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditModule(module)}
                    >Editar</button>
                    <button
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-700 text-sm"
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
                    >Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
  );
};

export default Modules;
