import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserRole } from "../types/userRol";
import type { User } from "../types/user";
import type { Role } from "../types/rol";

interface EditUserRoleFormProps {
  userRole: UserRole;
  onClose: () => void;
  onUpdated: () => void;
}

const EditUserRoleForm: React.FC<EditUserRoleFormProps> = ({ userRole, onClose, onUpdated }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userId, setUserId] = useState(userRole.userId);
  const [roleId, setRoleId] = useState(userRole.roleId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get("/api/User/getAll", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/Role/getAll", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUsers(usersRes.data.data || []);
        setRoles(rolesRes.data.data || []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Error al cargar datos para los dropdowns.");
      }
    };

    fetchDropdownData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/UserRole`,
        {
          id: userRole.id,
          userId,
          roleId,
          state: userRole.state ?? true,
          createdAt: userRole.createdAt ?? new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoading(false);
      onUpdated();
      onClose();
    } catch {
      setError("Error al actualizar rol de usuario");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Rol de Usuario</h3>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <label className="block mb-2 font-semibold">Usuario</label>
        <select
          value={userId || ""}
          onChange={(e) => setUserId(Number(e.target.value))}
          className="w-full mb-4 p-2 border rounded"
          required
        >
          <option value="">Seleccione un usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <label className="block mb-2 font-semibold">Rol</label>
        <select
          value={roleId || ""}
          onChange={(e) => setRoleId(Number(e.target.value))}
          className="w-full mb-4 p-2 border rounded"
          required
        >
          <option value="">Seleccione un rol</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
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

interface AddUserRoleFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddUserRoleForm: React.FC<AddUserRoleFormProps> = ({ onClose, onAdded }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get("/api/User/getAll", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/Role/getAll", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUsers(usersRes.data.data || []);
        setRoles(rolesRes.data.data || []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Error al cargar datos para los dropdowns.");
      }
    };

    fetchDropdownData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `/api/UserRole`,
        {
          id: 0,
          userId,
          roleId,
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
      setError("Error al agregar rol de usuario");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Rol de Usuario</h3>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <label className="block mb-2 font-semibold">Usuario</label>
        <select
          value={userId || ""}
          onChange={(e) => setUserId(Number(e.target.value))}
          className="w-full mb-4 p-2 border rounded"
          required
        >
          <option value="">Seleccione un usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <label className="block mb-2 font-semibold">Rol</label>
        <select
          value={roleId || ""}
          onChange={(e) => setRoleId(Number(e.target.value))}
          className="w-full mb-4 p-2 border rounded"
          required
        >
          <option value="">Seleccione un rol</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
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

const UserRoleList: React.FC = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [editUserRole, setEditUserRole] = useState<UserRole | null>(null);
  const [addUserRoleOpen, setAddUserRoleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar activos/inactivos

  const fetchUserRoles = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`/api/UserRole/getAll`, {
        params: { OnlyActive: onlyActive },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const userRolesNormalized = res.data.data.map((userRole: UserRole) => ({
            ...userRole,
            state: onlyActive, // Asignar el estado basado en el filtro OnlyActive
          }));
          setUserRoles(userRolesNormalized);
        } else {
          setUserRoles([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar roles de usuario");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserRoles();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  if (loading) return <div>Cargando roles de usuario...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/UserRole/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserRoles(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar rol de usuario:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/UserRole/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserRoles(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar rol de usuario:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Lista de Roles de Usuario</h2>
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddUserRoleOpen(true)}
        >
          Agregar Rol de Usuario
        </button>
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
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-sky-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Usuario</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Rol</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Estado</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {userRoles.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-center text-gray-500">
                  No hay roles de usuario para mostrar.
                </td>
              </tr>
            ) : (
              userRoles.map((userRole) => (
                <tr key={userRole.id} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{userRole.user}</td>
                  <td className="py-2 px-4 border-b">{userRole.role}</td>
                  <td className="py-2 px-4 border-b">
                    {userRole.state ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditUserRole(userRole)}
                    >
                      Editar
                    </button>
                    {userRole.state ? (
                      <button
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-700 text-white text-sm"
                        onClick={() => handleDeactivate(userRole.id)}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded bg-green-500 hover:bg-green-700 text-white text-sm"
                        onClick={() => handleActivate(userRole.id)}
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

      {editUserRole && (
        <EditUserRoleForm
          userRole={editUserRole}
          onClose={() => setEditUserRole(null)}
          onUpdated={() => {
            setLoading(true);
            fetchUserRoles();
          }}
        />
      )}
      {addUserRoleOpen && (
        <AddUserRoleForm
          onClose={() => setAddUserRoleOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchUserRoles();
          }}
        />
      )}
    </div>
  );
};

export default UserRoleList;
