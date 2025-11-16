import React, { useEffect, useState } from "react";
import axios from "axios";
import { Permission } from "../types/permissions";

interface AddPermissionFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddPermissionForm: React.FC<AddPermissionFormProps> = ({ onClose, onAdded }) => {
  const [code, setCode] = useState("");
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
      await axios.post("/api/Permission", {
        id: 0,
        code,
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
      setError("Error al agregar permiso");
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Permiso</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={code} onChange={e => setCode(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
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

interface EditPermissionFormProps {
  permission: Permission;
  onClose: () => void;
  onUpdated: () => void;
}

const EditPermissionForm: React.FC<EditPermissionFormProps> = ({ permission, onClose, onUpdated }) => {
  const [name, setName] = useState(permission.name);
  const [description, setDescription] = useState(permission.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/Permission`, {
        id: permission.id,
        code: permission.code,
        name,
        description,
        state: permission.state ?? true,
        createdAt: permission.createdAt ?? new Date().toISOString(),
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
      setError("Error al actualizar permiso");
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Permiso</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={permission.code} disabled className="w-full mb-4 p-2 border rounded bg-gray-100" />
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

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [editPermission, setEditPermission] = useState<Permission | null>(null);
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar permisos activos/inactivos

  const fetchPermissions = () => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/Permission/getAll", {
        params: { OnlyActive: onlyActive }, // Usar el filtro OnlyActive
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const permissionsNormalized = res.data.data.map((permission: Permission) => ({
            ...permission,
            state: onlyActive, // Asignar el estado basado en el filtro OnlyActive
          }));
          setPermissions(permissionsNormalized);
        } else {
          setPermissions([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar permisos");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPermissions();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  if (loading) return <div>Cargando permisos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Lista de Permisos</h2>
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddPermissionOpen(true)}
        >
          Agregar Permiso
        </button>
        <div className="flex justify-between mb-4">
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
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-sky-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Código</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Nombre</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Descripción</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Estado</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {permissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-center text-gray-500">
                  No hay permisos para mostrar.
                </td>
              </tr>
            ) : (
              permissions.map((permission) => (
                <tr key={permission.code} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{permission.code}</td>
                  <td className="py-2 px-4 border-b">{permission.name}</td>
                  <td className="py-2 px-4 border-b">{permission.description}</td>
                  <td className="py-2 px-4 border-b">
                    {permission.state ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditPermission(permission)}
                    >
                      Editar
                    </button>
                    {permission.state ? (
                      <button
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm"
                        onClick={async () => {
                          const token = localStorage.getItem("token");
                          try {
                            await axios.delete(`/api/Permission/${permission.id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            fetchPermissions(); // Refrescar lista
                          } catch (err: any) {
                            if (err?.response?.status === 400 && err?.response?.data?.message) {
                              setDeleteError(err.response.data.message);
                            } else {
                              setDeleteError(
                                "No se puede eliminar este Permiso porque todavía tiene registros relacionados activos. Por favor, desactiva primero sus datos asociados antes de eliminarlo."
                              );
                            }
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm"
                        onClick={() => {
                          // Lógica para activar el permiso si es necesario
                        }}
                      >
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editPermission && (
        <EditPermissionForm
          permission={editPermission}
          onClose={() => setEditPermission(null)}
          onUpdated={() => {
            setLoading(true);
            fetchPermissions();
          }}
        />
      )}
      {addPermissionOpen && (
        <AddPermissionForm
          onClose={() => setAddPermissionOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchPermissions();
          }}
        />
      )}
      {deleteError && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-2 sm:p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
            <h3 className="text-xl font-bold mb-4 text-red-700">No se puede eliminar el Permiso</h3>
            <p className="mb-6 text-gray-700">{deleteError}</p>
            <button
              className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
              onClick={() => setDeleteError(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
