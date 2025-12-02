import React, { useState, useEffect } from "react";
import Joyride from "react-joyride";
import axios from "axios";
import { securityPermissionsTourSteps, securityTourLocale, securityTourStyles } from "../../onboarding/securityTour";
import { RolFormPermission } from "../types/rolFormPermission";



const RolFormPermissionList: React.FC = () => {
  const [permissions, setPermissions] = useState<RolFormPermission[]>([]);
  const [editPermission, setEditPermission] = useState<RolFormPermission | null>(null);
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true); // Estado para filtrar activos/inactivos
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [runTour, setRunTour] = useState(false);

  const fetchPermissions = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token no encontrado. El usuario no está autenticado.");
      setError("Usuario no autenticado. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }

    axios
      .get("/api/RoleFormPermission/getAll", {
        params: { OnlyActive: onlyActive }, // Usar el filtro OnlyActive
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          // Ensure state field exists and is boolean
          const normalized = res.data.data.map((p: any) => ({ ...p, state: (p?.state ?? onlyActive) }));
          setPermissions(normalized);
        } else {
          setPermissions([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar permisos:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          setError("No autorizado. Por favor, verifica tus credenciales.");
        } else {
          setError("Error al cargar permisos.");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPermissions();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  useEffect(() => {
    if (!loading && !runTour && !localStorage.getItem("securityPermissionsTourDone")) {
      const timer = window.setTimeout(() => setRunTour(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, [loading, runTour]);

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/RoleFormPermission/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(true);
      fetchPermissions(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar permiso:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/RoleFormPermission/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoading(true);
      fetchPermissions(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar permiso:", err);
    }
  };

  // filtering and pagination
  const filtered = permissions.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (`${p.role || ''} ${p.form || ''} ${p.permission || ''}`).toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, filtered.length, totalPages]);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // show loading or error states after hooks are established (avoid changing hooks order)
  if (loading) return <div>Cargando permisos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-full mx-auto mt-10 p-6 security-rol-permission-layout">
      <Joyride
        steps={securityPermissionsTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={securityTourLocale}
        styles={securityTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunTour(false);
            localStorage.setItem("securityPermissionsTourDone", "true");
          }
        }}
      />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 security-rol-permission-card">
        <div className="flex items-start justify-between mb-4 security-rol-permission-header">
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
              <h2 className="text-2xl font-bold text-sky-700">Permisos de Roles</h2>
              <p className="text-sm text-gray-500 mt-1">Administra la asignación de formularios y permisos por rol</p>
            </div>
          </div>
          <div className="security-rol-permission-create">
            <button onClick={() => setAddPermissionOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full! bg-sky-600 text-white hover:bg-sky-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>
              <span>Agregar permiso</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4 security-rol-permission-search">
          <div className="flex-1">
            <div className="relative">
              <input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Buscar permisos..." className="pl-10 pr-4 h-12 border rounded-full w-full bg-gray-50 shadow-sm" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
              </div>
            </div>
          </div>
          <div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 p-2 overflow-auto security-rol-permission-table">
          <table className="min-w-full w-full table-auto">
            <thead className="text-left text-sm text-gray-600 bg-gray-50">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700">Rol</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Formulario</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Permiso</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 px-4 text-center text-gray-500">No hay permisos para mostrar.</td>
                </tr>
              ) : (
                paginated.map((permission) => (
                  <tr key={permission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM4 20v-1c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{permission.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top text-sm text-gray-600">{permission.form}</td>
                    <td className="py-3 px-4 align-top">{permission.permission}</td>
                    <td className="py-3 px-4 align-top whitespace-nowrap">
                      {permission.state ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">Activo</span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">Inactivo</span>
                      )}
                    </td>
                    <td className="py-3 px-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <button
                          className="text-gray-400 hover:text-sky-600"
                          onClick={() => setEditPermission(permission)}
                          title="Editar"
                        >
                          {/* Filled pencil icon (like PersonsList) */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464L14.586 2.586a2 2 0 012.828 0z" />
                          </svg>
                        </button>
                        {permission.state ? (
                          <button
                            className="text-red-400 hover:text-red-600"
                            onClick={() => handleDeactivate(permission.id)}
                            title="Desactivar"
                          >
                            {/* Filled trash icon (like PersonsList) */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v9a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 10-2 0v7a1 1 0 102 0V7z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        ) : (
                          <button
                            className="text-emerald-500 hover:text-emerald-600"
                            onClick={() => handleActivate(permission.id)}
                            title="Activar"
                          >
                            {/* Filled check icon (like PersonsList) */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M3 10a7 7 0 1114 0 1 1 0 102 0 9 9 0 10-18 0 1 1 0 102 0z"/>
                              <path d="M10 6v5l3 3"/>
                            </svg>
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

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 security-rol-permission-pagination">
          <div>
            {filtered.length === 0 ? (
              <>Mostrando 0 permisos</>
            ) : (
              (() => {
                const start = (currentPage - 1) * pageSize + 1;
                const end = Math.min(filtered.length, currentPage * pageSize);
                return <>Mostrando {start}-{end} de {filtered.length} permisos</>;
              })()
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-1 rounded border ${currentPage === 1 ? 'text-gray-400 border-gray-200 bg-white' : 'text-gray-700 border-gray-200 bg-white hover:bg-gray-50'}`}
            >
              Anterior
            </button>
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
                  aria-current={p === currentPage}
                  className={`w-8 h-8 flex items-center justify-center rounded border text-sm transition-colors duration-150
                    ${p === currentPage ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ));
            })()}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-1 rounded border ${currentPage === totalPages ? 'text-gray-400 border-gray-200 bg-white' : 'text-gray-700 border-gray-200 bg-white hover:bg-gray-50'}`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modals - rendered inside component so JSX stays valid */}
      {editPermission && (
        <EditRolFormPermission
          permission={editPermission}
          onClose={() => setEditPermission(null)}
          onUpdated={() => {
            setLoading(true);
            fetchPermissions();
          }}
        />
      )}
      {addPermissionOpen && (
        <AddRolFormPermission
          onClose={() => setAddPermissionOpen(false)}
          onCreated={() => {
            setLoading(true);
            fetchPermissions();
          }}
        />
      )}
    </div>
  );
};

interface EditRolFormPermissionProps {
  permission: RolFormPermission;
  onClose: () => void;
  onUpdated: () => void;
}

const EditRolFormPermission: React.FC<EditRolFormPermissionProps> = ({ permission, onClose, onUpdated }) => {
  const [roleId, setRoleId] = useState(permission.roleId);
  const [formId, setFormId] = useState(permission.formId);
  const [permissionId, setPermissionId] = useState(permission.permissionId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/RoleFormPermission`,
        {
          id: permission.id,
          roleId,
          formId,
          permissionId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdated(); // Refrescar la lista
      onClose(); // Cerrar el formulario
    } catch (err: any) {
      setError("Error al actualizar el permiso. Por favor, verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4 text-sky-700">Editar Permiso</h3>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Rol</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={roleId || ""}
                onChange={(e) => setRoleId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un rol</option>
                {/* Aquí deberías mapear los roles disponibles */}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Formulario</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={formId || ""}
                onChange={(e) => setFormId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un formulario</option>
                {/* Aquí deberías mapear los formularios disponibles */}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Permiso</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={permissionId || ""}
                onChange={(e) => setPermissionId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un permiso</option>
                {/* Aquí deberías mapear los permisos disponibles */}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddRolFormPermissionProps {
  onClose: () => void;
  onCreated: () => void;
}

const AddRolFormPermission: React.FC<AddRolFormPermissionProps> = ({ onClose, onCreated }) => {
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [forms, setForms] = useState<{ id: number; name: string }[]>([]);
  const [permissions, setPermissions] = useState<{ id: number; name: string }[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [formId, setFormId] = useState<number | null>(null);
  const [permissionId, setPermissionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewPermissionForm, setShowNewPermissionForm] = useState(false);
  const [newPermName, setNewPermName] = useState("");
  const [newPermDescription, setNewPermDescription] = useState("");
  const [creatingPerm, setCreatingPerm] = useState(false);
  const [newPermError, setNewPermError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [rolesRes, formsRes, permissionsRes] = await Promise.all([
          axios.get("/api/Role/getAll", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/Form/getAll", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/Permission/getAll", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setRoles(rolesRes.data.data || []);
        setForms(formsRes.data.data || []);
        setPermissions(permissionsRes.data.data || []);
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
        `/api/RoleFormPermission`,
        {
          roleId,
          formId,
          permissionId,
          state: true, // Por defecto, el permiso se crea activo
          createdAt: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onCreated(); // Refrescar la lista
      onClose(); // Cerrar el formulario
    } catch (err: any) {
      setError("Error al crear el permiso. Por favor, verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  const createPermission = async () => {
    setCreatingPerm(true);
    setNewPermError(null);
    const token = localStorage.getItem("token");
    if (!newPermName || !token) {
      setNewPermError("Nombre de permiso requerido");
      setCreatingPerm(false);
      return;
    }
    try {
      const res = await axios.post('/api/Permission', { id: 0, name: newPermName, description: newPermDescription, createdAt: new Date().toISOString(), state: true }, { headers: { Authorization: `Bearer ${token}` } });
      const created = res.data?.data ?? res.data ?? null;
      let createdId = created?.id ?? created?.permissionId ?? null;
      if (!createdId && res?.headers?.location) {
        const loc: string = res.headers.location;
        const m = loc.match(/[?&]id=(\d+)|\/(\d+)$/);
        if (m) createdId = Number(m[1] ?? m[2]);
      }
      // If still no id, ignore but try to use returned object
      const createdObj = createdId ? { id: createdId, name: newPermName, description: newPermDescription } : { id: (created && created.id) || Date.now(), name: newPermName, description: newPermDescription };
      setPermissions((prev) => [...prev, createdObj]);
      setPermissionId(createdObj.id);
      setShowNewPermissionForm(false);
      setNewPermName("");
      setNewPermDescription("");
    } catch (err: any) {
      console.error('Error creando permiso nuevo:', err?.response ?? err);
      setNewPermError(err?.response?.data?.message ?? 'Error al crear permiso');
    } finally {
      setCreatingPerm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-4">
      <div className="bg-white p-6 rounded-2xl! shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4 text-sky-700">Agregar Permiso</h3>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Rol</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={roleId || ""}
                onChange={(e) => setRoleId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Formulario</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={formId || ""}
                onChange={(e) => setFormId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un formulario</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Permiso</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={permissionId || ""}
                onChange={(e) => setPermissionId(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un permiso</option>
                {permissions.map((permission) => (
                  <option key={permission.id} value={permission.id}>
                    {permission.name}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" onClick={() => setShowNewPermissionForm((s) => !s)} className="px-3 py-1 text-sm rounded bg-white border">
                  {showNewPermissionForm ? 'Cancelar' : 'Crear permiso nuevo'}
                </button>
                {showNewPermissionForm && (
                  <div className="flex flex-col gap-2 w-full">
                    <input className="w-full px-3 py-2 border rounded" placeholder="Nombre del permiso" value={newPermName} onChange={(e) => setNewPermName(e.target.value)} />
                    <input className="w-full px-3 py-2 border rounded" placeholder="Descripción (opcional)" value={newPermDescription} onChange={(e) => setNewPermDescription(e.target.value)} />
                    <div className="flex gap-2">
                      <button type="button" disabled={creatingPerm} onClick={createPermission} className="px-3 py-2 rounded bg-sky-600 text-white">
                        {creatingPerm ? 'Creando...' : 'Crear'}
                      </button>
                      <button type="button" onClick={() => { setShowNewPermissionForm(false); setNewPermName(''); setNewPermDescription(''); setNewPermError(null); }} className="px-3 py-2 rounded bg-gray-100">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                {newPermError && <div className="text-sm text-red-600">{newPermError}</div>}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolFormPermissionList;