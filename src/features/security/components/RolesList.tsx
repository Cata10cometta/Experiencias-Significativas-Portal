import React, { useEffect, useState } from "react";
import axios from "axios";
import { Role } from "../types/rol";


interface EditRoleFormProps {
  role: Role;
  onClose: () => void;
  onUpdated: () => void;
}

const EditRoleForm: React.FC<EditRoleFormProps> = ({ role, onClose, onUpdated }) => {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/Role`, {
        id: role.id,
        code: role.code,
        name,
        description,
        state: role.state ?? true,
        createdAt: role.createdAt ?? new Date().toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(false);
      onUpdated();
      onClose();
    } catch {
      setError("Error al actualizar rol");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Rol</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={role.code} disabled className="w-full mb-4 p-2 border rounded bg-gray-100" />
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Descripción</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

interface AddRoleFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddRoleForm: React.FC<AddRoleFormProps> = ({ onClose, onAdded }) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(() => {
    try {
      const id = localStorage.getItem('userId');
      return id ? Number(id) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post("/api/Role", {
        id: 0,
        code,
        name,
        description,
        state: true,
        createdAt: new Date().toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // try to extract created role id from response
      const created = res.data?.data ?? res.data ?? res;
      const newRoleId = created?.id ?? created?.roleId ?? created?.data?.id ?? null;

      // if we have a logged user id, assign this new role to that user
      try {
        // prefer selected user from form, fallback to current logged user in localStorage
        const selected = selectedUserId ? Number(selectedUserId) : null;
        const currentUserIdRaw = localStorage.getItem('userId');
        const currentUserId = currentUserIdRaw ? Number(currentUserIdRaw) : null;
        const userToAssign = selected || currentUserId;
        if (userToAssign && newRoleId) {
          await axios.post('/api/UserRole', { id: 0, userId: Number(userToAssign), roleId: Number(newRoleId), state: true, createdAt: new Date().toISOString() }, { headers: { Authorization: `Bearer ${token}` } });
        }
      } catch (assignErr) {
        // if assignment fails, continue — role was created but assignment didn't succeed
        console.warn('No se pudo asignar rol al usuario seleccionado:', assignErr);
      }

      setLoading(false);
      onAdded();
      onClose();
    } catch {
      setError("Error al agregar rol");
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch users for select dropdown
    const token = localStorage.getItem('token');
    axios.get('/api/User/getAll', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setUsers(data || []);
      })
      .catch(() => {
        // ignore
      });
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Rol</h3>
        <label className="block mb-2 font-semibold">Código</label>
        <input value={code} onChange={e => setCode(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Descripción</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full mb-4 p-2 border rounded" required />

        <label className="block mb-2 font-semibold">Asignar a Usuario</label>
        <select value={selectedUserId ?? ''} onChange={e => setSelectedUserId(e.target.value ? Number(e.target.value) : null)} className="w-full mb-4 p-2 border rounded">
          <option value="">-- No asignar ahora --</option>
          {users.map(u => {
              const display = (
                u?.person?.firstName || u?.firstName || u?.nombre || u?.name || u?.userName || u?.username
              );
              const displayLast = (
                u?.person?.firstLastName || u?.firstLastName || u?.apellido || u?.lastName || ''
              );
              const label = display ? `${display} ${displayLast}`.trim() : (u?.username || u?.email || `#${u?.id}`);
              return <option key={u.id} value={u.id}>{label}</option>;
            })}
        </select>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">
            {loading ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
};

const RolesList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [usersCountById, setUsersCountById] = useState<Record<string, number>>({});
  const [usersCountByCode, setUsersCountByCode] = useState<Record<string, number>>({});
  const [permsCountById, setPermsCountById] = useState<Record<string, number>>({});
  const [permsCountByCode, setPermsCountByCode] = useState<Record<string, number>>({});
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onlyActive = true; // Estado para filtrar roles activos/inactivos (const since UI toggle not present here)
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // fetch user-role mappings to compute number of users per role
  const fetchUserRoles = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`/api/UserRole/getAll`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const data = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        const byId: Record<string, number> = {};
        const byCode: Record<string, number> = {};
        data.forEach((ur: any) => {
          if (ur == null) return;
          if (ur.roleId != null) {
            const k = String(ur.roleId);
            byId[k] = (byId[k] || 0) + 1;
          }
          if (ur.roleCode) {
            const kc = String(ur.roleCode);
            byCode[kc] = (byCode[kc] || 0) + 1;
          }
        });
        setUsersCountById(byId);
        setUsersCountByCode(byCode);
      })
      .catch(() => {
        // ignore errors for counts, leave zeros
      });
  };

  // fetch role-form-permission mappings to compute number of permissions per role
  const fetchRoleFormPermissions = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`/api/RoleFormPermission/getAll`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const data = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        const byId: Record<string, number> = {};
        const byCode: Record<string, number> = {};
        data.forEach((rp: any) => {
          if (rp == null) return;
          if (rp.roleId != null) {
            const k = String(rp.roleId);
            byId[k] = (byId[k] || 0) + 1;
          }
          if (rp.roleCode) {
            const kc = String(rp.roleCode);
            byCode[kc] = (byCode[kc] || 0) + 1;
          }
        });
        setPermsCountById(byId);
        setPermsCountByCode(byCode);
      })
      .catch(() => {
        // ignore errors for permission counts
      });
  };

  const fetchRoles = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`/api/Role/getAll`, {
        params: { OnlyActive: onlyActive }, // Usar el filtro OnlyActive
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const rolesNormalized = res.data.data.map((role: Role) => ({
            ...role,
            state: onlyActive, // Asignar el estado basado en el filtro OnlyActive
          }));
          setRoles(rolesNormalized);
        } else {
          setRoles([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar roles");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRoles();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  // get user-role mappings once on mount to calculate users-per-role
  useEffect(() => {
    fetchUserRoles();
    fetchRoleFormPermissions();
  }, []);

  // Resolve a sensible created/fecha value from multiple possible fields
  // fecha removed: column was intentionally omitted

  // derived: filter + search + pagination
  const filteredRoles = roles.filter(r => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (`${r.name}`.toLowerCase().includes(q) || `${r.description || ''}`.toLowerCase().includes(q));
  });
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // Ensure current page is always within bounds when filteredRoles changes
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filteredRoles.length, totalPages]);

  if (loading) return <div>Cargando roles...</div>;
  if (error) return <div>{error}</div>;

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/Role/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRoles(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar rol:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/Role/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRoles(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar rol:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-sky-700">Gestión de Roles</h2>
          <p className="text-sm text-gray-500 mt-1">Administra los roles y permisos del sistema</p>
        </div>
        <div>
          <button
            onClick={() => setAddRoleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-2xl!   shadow hover:bg-sky-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Crear rol
          </button>
        </div>
      </div>

      {/* Search row below header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar roles..."
              className="pl-10 pr-3 py-2 border rounded-2xl! w-full bg-gray-50"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
            </div>
          </div>
        </div>
        <div>
          <button className="px-4 py-2 rounded bg-white border text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" aria-hidden>
              <path d="M1.5 1.5C1.5 1.22386 1.72386 1 2 1H14C14.2761 1 14.5 1.22386 14.5 1.5V3.5C14.5 3.62352 14.4543 3.74267 14.3716 3.83448L10 8.69187V13.5C10 13.7152 9.86228 13.9063 9.65811 13.9743L6.65811 14.9743C6.50564 15.0252 6.33803 14.9996 6.20764 14.9056C6.07726 14.8116 6 14.6607 6 14.5V8.69187L1.62835 3.83448C1.54572 3.74267 1.5 3.62352 1.5 3.5V1.5ZM2.5 2V3.30813L6.87165 8.16552C6.95428 8.25733 7 8.37648 7 8.5V13.8063L9 13.1396V8.5C9 8.37648 9.04572 8.25733 9.12835 8.16552L13.5 3.30813V2H2.5Z" fill="currentColor"/>
            </svg>
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <table className="min-w-full rounded-lg overflow-hidden">
          <thead className="text-left text-sm text-gray-600 bg-gray-50">
            <tr>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Descripción</th>
              <th className="py-3 px-4">Usuarios</th>
              <th className="py-3 px-4">Permisos</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {paginatedRoles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 px-4 text-center text-gray-500">No hay roles para mostrar.</td>
              </tr>
            ) : (
              paginatedRoles.map((role) => {
                const usersCount = usersCountById[String((role as any).id)] ?? usersCountByCode[String((role as any).code)] ?? (role as any).usersCount ?? (role as any).users?.length ?? 0;
                const permsCount = permsCountById[String((role as any).id)] ?? permsCountByCode[String((role as any).code)] ?? (role as any).permissionsCount ?? (role as any).permissions?.length ?? 0;
                
                return (
                  <tr key={role.code} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 ring-1 ring-sky-100"> 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a4 4 0 00-2 7.5A6 6 0 104 18h12a6 6 0 00-6-8 4 4 0 000-8z"/></svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{role.name}</div>
                        <div className="text-xs text-gray-400">{role.code}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{role.description}</td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z"/><path fillRule="evenodd" d="M2 13.5A5.5 5.5 0 0110 8h0a5.5 5.5 0 018 5.5v.5H2v-.5z" clipRule="evenodd"/></svg>
                        <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs">{usersCount}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs">{permsCount}</span>
                    </td>
                    <td className="py-4 px-4">
                      {role.state ? <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Activo</span> : <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Inactivo</span>}
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-sky-600" onClick={() => setEditRole(role)} title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464L14.586 2.586a2 2 0 012.828 0z"/></svg>
                        </button>
                        {role.state ? (
                          <button className="text-red-400 hover:text-red-600" onClick={() => handleDeactivate(role.id)} title="Desactivar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v9a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 10-2 0v7a1 1 0 102 0V7z" clipRule="evenodd"/></svg>
                          </button>
                        ) : (
                          <button className="text-emerald-500 hover:text-emerald-600" onClick={() => handleActivate(role.id)} title="Activar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 10a7 7 0 1114 0 1 1 0 102 0 9 9 0 10-18 0 1 1 0 102 0z"/><path d="M10 6v5l3 3"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {filteredRoles.length === 0 ? (
            <>Mostrando 0 roles</>
          ) : (
            (() => {
              const start = (currentPage - 1) * pageSize + 1;
              const end = Math.min(filteredRoles.length, currentPage * pageSize);
              return <>Mostrando {start}-{end} de {filteredRoles.length} roles</>;
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

      {editRole && (
        <EditRoleForm
          role={editRole}
          onClose={() => setEditRole(null)}
          onUpdated={() => {
            setLoading(true);
            fetchRoles();
          }}
        />
      )}
      {addRoleOpen && (
        <AddRoleForm
          onClose={() => setAddRoleOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchRoles();
            // refresh counts for users and permissions as well
            fetchUserRoles();
            fetchRoleFormPermissions();
          }}
        />
      )}
    </div>
  );

};

export default RolesList;
