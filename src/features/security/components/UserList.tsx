import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import axios from "axios";
import { securityTourLocale, securityTourStyles, securityUsersTourSteps } from "../../onboarding/securityTour";
import { Person } from "../types/Person";
import { User } from "../types/user";


// helper para formatear fechas a DD/MM/YYYY (año completo)
const formatDateLong = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear());
    return `${day}/${month}/${year}`;
  } catch (e) {
    return "";
  }
};


interface EditUserFormProps {
  user: User;
  onClose: () => void;
  onUpdated: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onClose, onUpdated }) => {
  const [username, setUsername] = useState(user.username);
  const [password] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/User`, {
        id: user.id,
        code: user.code,
        username,
        password,
        state: user.state ?? true,
        createdAt: user.createdAt ?? new Date().toISOString(),
        deletedAt: user.deletedAt ?? null,
        personId: user.personId ?? 0,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      onUpdated();
      onClose();
    } catch (err) {
      setError("Error al actualizar usuario");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 pt-20 px-4 sm:px-6">
      <div className="w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-sky-700">Editar Usuario</h3>
              <p className="text-sm text-gray-500">Actualiza la información del usuario seleccionado.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block mb-2 font-semibold">Código</label>
              <input value={user.code} disabled className="w-full p-2 border rounded bg-gray-100" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Nombre de Usuario</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border rounded" />
            </div>
          </div>

          {error && <div className="text-red-500 mt-3">{error}</div>}
          <div className="flex gap-4 justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700">{loading ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface AddUserFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onClose, onAdded }) => {
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [personId, setPersonId] = useState<number | null>(null); // Estado para la persona seleccionada
  const [persons, setPersons] = useState<Person[]>([]); // Lista de personas disponibles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Obtener la lista de personas desde la API
    const fetchPersons = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("/api/Person/getAll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPersons(response.data.data || []);
      } catch (err) {
        console.error("Error al obtener personas:", err);
      }
    };
    fetchPersons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    const userData = {
      code,
      username,
      password,
      state: true,
      createdAt: new Date().toISOString(),
      deletedAt: null,
      personId, // Vincular con la persona seleccionada
    };

    console.log("Datos enviados al backend:", userData); // Verificar el cuerpo de la solicitud

    try {
      await axios.post("/api/User/register", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      onAdded();
      onClose();
    } catch (err) {
      console.error("Error al agregar usuario:", err);
      setError("Error al agregar usuario");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 pt-20 px-4 sm:px-6">
      <div className="w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl! shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-sky-700">Crear Usuario</h3>
              <p className="text-sm text-gray-500">Completa los datos para crear un nuevo usuario.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block mb-2 font-semibold">Código</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ingrese el código"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Nombre de Usuario</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ingrese el nombre de usuario"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ingrese la contraseña"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Persona</label>
              <select
                value={personId || ""}
                onChange={(e) => setPersonId(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value="" disabled>Seleccione una persona</option>
                {persons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.firstLastName} {person.secondLastName ? person.secondLastName : ""} ({person.firstName} {person.firstLastName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="text-red-500 mt-3">{error}</div>}
          <div className="flex gap-4 justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700">{loading ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [addUser, setAddUser] = useState(false); // Estado para mostrar el formulario de agregar usuario
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [rolesMap, setRolesMap] = useState<Record<number, string>>({});
  const [personsMap, setPersonsMap] = useState<Record<number, Person>>({});
  // Estado para filtrar la lista: 'active' | 'inactive' | 'registered'
  const [filter, setFilter] = useState<'active' | 'inactive' | 'registered'>('registered');
  // UI states for search and pagination (must be top-level hooks)
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [runTour, setRunTour] = useState(false);

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/User/getAll", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          // Keep returned users as-is and filter client-side
          setUsers(res.data.data as User[]);
        } else {
          setUsers([]);
        }
        setLoading(false);
        // refresh roles mapping after users loaded
        fetchUserRoles().catch(() => {});
      })
      .catch(() => {
        setError("Error al cargar usuarios");
        setLoading(false);
      });
  };

  const fetchUserRoles = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/UserRole/getAll', { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const map: Record<number, string> = {};
      const roleIds: Set<number> = new Set();
      data.forEach((ur: any) => {
        if (ur.userId != null) {
          if (ur.roleName) map[ur.userId] = ur.roleName;
          else if (ur.roleId != null) {
            // we will resolve roleId -> name later
            (map as any)[ur.userId] = String(ur.roleId);
            roleIds.add(ur.roleId);
          }
        }
      });

      // If some entries store roleId instead of roleName, fetch roles to resolve names
      if (roleIds.size > 0) {
        const rolesRes = await axios.get('/api/Role/getAll', { headers: { Authorization: `Bearer ${token}` } });
        const rolesData = Array.isArray(rolesRes.data.data) ? rolesRes.data.data : [];
        const roleById: Record<number, string> = {};
        rolesData.forEach((r: any) => { roleById[r.id] = r.name; });
        // replace numeric ids in map with names
        Object.keys(map).forEach((k) => {
          const v = map[k as any];
          const num = Number(v);
          if (!isNaN(num) && roleById[num]) map[Number(k)] = roleById[num];
        });
      }

      setRolesMap(map);
    } catch (err) {
      console.error('Error al cargar roles de usuario:', err);
    }
  };

  // Cargar personas para resolver personId cuando user.person no viene embebido
  const fetchPersons = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/Person/getAll', { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const map: Record<number, Person> = {};
      data.forEach((p: any) => {
        if (p && p.id != null) map[p.id] = p;
      });
      setPersonsMap(map);
    } catch (err) {
      console.error('Error al cargar persons:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]); // Refrescar cuando cambie el filtro

  useEffect(() => {
    // cargar personas al montar
    fetchPersons();
  }, []);

  useEffect(() => {
    if (!loading && !runTour && !localStorage.getItem("securityUsersTourDone")) {
      const timer = window.setTimeout(() => setRunTour(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, [loading, runTour]);

  // derived states for pagination and helpers (defined before any early return to keep hook order stable)
  const pageSize = 5;

  const activeCount = users.filter((u) => u.state).length;
  const inactiveCount = users.filter((u) => !u.state).length;
  const registeredCount = users.filter((u) => { const inv = (u as any).invited ?? (u as any).isInvited ?? false; return !inv; }).length;

  const filtered = users.filter((u) => {
    // filter by search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!(`${u.username}`.toLowerCase().includes(q) || `${u.code}`.toLowerCase().includes(q))) return false;
    }
    // filter by selected filter state
    const invited = (u as any).invited ?? (u as any).isInvited ?? false;
    switch (filter) {
      case 'active':
        return !!u.state;
      case 'inactive':
        return !u.state;
      case 'registered':
        return !invited;
      default:
        return true;
    }
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // Keep currentPage within bounds when filtered/totalPages change
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filtered.length, totalPages]);


  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      // Prefer explicit deactivate endpoint; fallback to delete if not available
      try {
        await axios.post(`/api/User/deactivate/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        // fallback: try delete
        await axios.delete(`/api/User/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchUsers(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar usuario:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      // Try the new activate endpoint first, fallback to restore
      try {
        // Swagger shows PUT /api/User/activate/{userId} — use PUT to match server implementation
        const resp = await axios.put(`/api/User/activate/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        console.debug('activate resp', resp?.data);
      } catch (err) {
        // fallback: if PUT fails, try POST (legacy) so we still attempt activation
        try {
          const resp2 = await axios.post(`/api/User/activate/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
          console.debug('activate (post fallback) resp', resp2?.data);
        } catch (err2) {
          console.error('activate fallback failed', err2);
          throw err2;
        }
      }
      fetchUsers(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar usuario:", err);
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>{error}</div>;


  return (
    <div className="w-full max-w-7xl mx-auto mt-8 security-users-layout">
      <Joyride
        steps={securityUsersTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={securityTourLocale}
        styles={securityTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunTour(false);
            localStorage.setItem("securityUsersTourDone", "true");
          }
        }}
      />
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between security-users-header">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 -mt-8!">
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
              <h1 className="text-2xl font-semibold">Administración de usuario</h1>
              <p className="text-sm text-gray-500 mt-1">Optimiza la eficiencia y seguridad de tus usuarios.</p>
            </div>
          </div>
          <div className="security-users-create">
            <button
              onClick={() => setAddUser(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-2xl! shadow hover:bg-sky-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear usuario
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 security-users-filters">
          {/* Filter buttons: Habilitados / Registrados / Inhabilitados */}
          <button onClick={() => setFilter('active')} className={`px-34 py-2 rounded-full! text-sm flex items-center gap-2 ${filter === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-700 border'}`}>
            <span>Habilitados</span>
            <span className="bg-emerald-200 px-2 rounded-full text-xs">{activeCount}</span>
          </button>
          <button onClick={() => setFilter('registered')} className={`px-34 py-2 rounded-full! text-sm ${filter === 'registered' ? 'bg-yellow-100 text-gray-800' : 'bg-white text-gray-700 border'}`}>
            Registrados <span className="ml-2 bg-yellow-50 px-2 rounded-full text-xs">{registeredCount}</span>
          </button>
          <button onClick={() => setFilter('inactive')} className={`px-34    py-2 rounded-full! text-sm ${filter === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-700 border'}`}>
            Inhabilitados <span className="ml-2 bg-red-200 px-2 rounded-full text-xs">{inactiveCount}</span>
          </button>
        </div>
  <div className="mt-4 flex items-center gap-4 security-users-search">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
            </span>
            <input
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar roles..."
              className="pl-10 pr-4 h-12 border rounded-full w-full bg-white shadow-sm"
              style={{ minWidth: 0 }}
            />
          </div>
        </div>

  <div className="mt-6 pt-6">
          <div className="overflow-x-auto">
            {/* outer card like example: rounded box with subtle border and header bg */}
            <div className="rounded-lg border border-gray-100 bg-white shadow-sm security-users-table">
              <table className="min-w-full">
                <thead className="text-left text-sm text-gray-600 bg-gray-50">
                  <tr className="border-b">
                    <th className="py-3 px-4">Correo</th>
                    <th className="py-3 px-4">Tipo de usuario</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 px-4 text-center text-gray-500">No hay usuarios para mostrar.</td>
                    </tr>
                  ) : (
                    paginated.map((user) => {
                      const person = user.personId ? personsMap[user.personId as number] : undefined;
                      const correo = user.username || user.code || (person?.email) || "";
                      const role = rolesMap[user.id] || (user as any).roleName || (user as any).role || "Administrador";
                      return (
                        <tr key={user.id} className="border-b last:border-b-0">
                          <td className="py-4 px-4 text-gray-500">{correo}</td>
                          <td className="py-4 px-4">{role}</td>
                          <td className="py-4 px-4">
                            {user.state ? <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Activo</span> : <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">Inactivo</span>}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <button className="text-gray-400 hover:text-sky-600" onClick={() => setEditUser(user)} title="Editar">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464L14.586 2.586a2 2 0 012.828 0z"/></svg>
                              </button>
                              {user.state ? (
                                <button className="text-red-400 hover:text-red-600" onClick={() => handleDeactivate(user.id)} title="Desactivar">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v9a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 10-2 0v7a1 1 0 102 0V7z" clipRule="evenodd"/></svg>
                                </button>
                              ) : (
                                <button className="text-emerald-500 hover:text-emerald-600" onClick={() => handleActivate(user.id)} title="Activar">
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
            </div>

          {/* pagination */}
          <div className="mt-4 flex items-center justify-between security-users-pagination">
            <div className="text-sm text-gray-500">
              {filtered.length === 0 ? (
                <>Mostrando 0 usuarios</>
              ) : (
                (() => {
                  const start = (currentPage - 1) * pageSize + 1;
                  const end = Math.min(filtered.length, currentPage * pageSize);
                  return <>Mostrando {start}-{end} de {filtered.length} usuarios</>;
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
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-3 py-1 rounded ${currentPage === p ? 'bg-sky-600 text-white' : 'bg-white border'}`}
                  >{p}</button>
                ));
              })()}
              <button className="px-3 py-1 rounded border" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      {editUser && (
        <EditUserForm
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={() => {
            setLoading(true);
            fetchUsers();
          }}
        />
      )}
      {addUser && (
        <AddUserForm
          onClose={() => setAddUser(false)}
          onAdded={() => {
            setLoading(true);
            fetchUsers();
          }}
        />
      )}

      {/* Modal de error al eliminar usuario */}
      {deleteError && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-2 sm:p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
            <h3 className="text-xl font-bold mb-4 text-red-700">Error</h3>
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

export default UserList;
