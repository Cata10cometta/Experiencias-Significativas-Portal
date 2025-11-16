import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface RawPerm { id: number; role?: string; form?: string; permission?: string; state?: boolean }

const pageSize = 5;

const Summary: React.FC = () => {
  const [items, setItems] = useState<RawPerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetch = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/RoleFormPermission/getAll', { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setItems(data.map((d: any) => ({ id: d.id, role: d.role || d.roleName || d.roleNameText, form: d.form || d.formName || d.formText, permission: d.permission || d.permissionName, state: d.state ?? true })));
    } catch (err) {
      console.error('Error fetching resumen:', err);
      setError('Error cargando resumen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  // aggregate per (role, form)
  const grouped = React.useMemo(() => {
    const map = new Map<string, any>();
    items.forEach((it) => {
      const role = (it.role || 'Sin rol').toString();
      const form = (it.form || 'Sin formulario').toString();
      const key = role + '|' + form;
      const entry = map.get(key) || { role, form, visualizar: false, editar: false, eliminar: false, habilitar: false, total: 0, state: false };
      const perm = (it.permission || '').toString().toLowerCase();
      if (/visual|view|ver|listar/.test(perm)) entry.visualizar = true;
      if (/edit|editar|update|modif/.test(perm)) entry.editar = true;
      if (/delete|eliminar|remove|borrar/.test(perm)) entry.eliminar = true;
      if (/habilit|enable|restore|inactiv/.test(perm)) entry.habilitar = true;
      entry.total += 1;
      entry.state = entry.state || !!it.state;
      map.set(key, entry);
    });
    return Array.from(map.values());
  }, [items]);

  const rolesSummary = React.useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((it) => { const r = it.role || 'Sin rol'; counts[r] = (counts[r] || 0) + 1; });
    return counts;
  }, [items]);

  const filtered = grouped.filter((g) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (g.role + ' ' + g.form).toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [filtered.length, totalPages]);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <div>Cargando resumen...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-full mx-auto -mt-1! p-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-sky-700">Modelo de Seguridad</h2>
        <p className="text-sm text-gray-500 mb-6">Vista general de permisos por rol y formulario</p>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.keys(rolesSummary).length === 0 ? (
            <div className="text-gray-500">No hay roles</div>
          ) : (
            Object.entries(rolesSummary).slice(0,4).map(([role, cnt]) => (
              <div key={role} className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM4 20v-1c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">{role}</div>
                  <div className="text-xs text-gray-500">{cnt} permisos</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Buscar en el modelo de seguridad..." className="pl-10 pr-4 h-12 border rounded-full w-full bg-gray-50 shadow-sm" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
              </div>
            </div>
          </div>
          <div>
            <button className="px-4 py-2 rounded bg-white border text-sm">Filtrar</button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 p-2 overflow-auto">
          <table className="min-w-full w-full table-auto">
            <thead className="text-left text-sm text-gray-600 bg-gray-50">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700">Rol</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Formulario</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Visualizar</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Editar</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Eliminar</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Inhabilitar / Habilitar</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="py-6 px-4 text-center text-gray-500">No hay permisos para mostrar.</td></tr>
              ) : (
                paginated.map((row: any, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM4 20v-1c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{row.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top text-sm text-gray-600">{row.form}</td>
                    <td className="py-3 px-4 align-top">{row.visualizar ? <span className="text-emerald-600">✓</span> : <span className="text-red-400">✕</span>}</td>
                    <td className="py-3 px-4 align-top">{row.editar ? <span className="text-emerald-600">✓</span> : <span className="text-red-400">✕</span>}</td>
                    <td className="py-3 px-4 align-top">{row.eliminar ? <span className="text-emerald-600">✓</span> : <span className="text-red-400">✕</span>}</td>
                    <td className="py-3 px-4 align-top whitespace-nowrap">{row.state ? <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm">Activo</span> : <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">Inactivo</span>}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
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

          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`px-3 py-1 rounded-full border ${currentPage === 1 ? 'text-gray-300 border-gray-200 bg-white' : 'text-gray-700 border-gray-200 bg-white hover:bg-gray-50'}`}>Anterior</button>
            {(() => {
              const pages: number[] = [];
              let start = Math.max(1, currentPage - 2);
              let end = Math.min(totalPages, start + 4);
              if (end - start < 4) start = Math.max(1, end - 4);
              for (let i = start; i <= end; i++) pages.push(i);
              return pages.map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)} aria-current={p === currentPage} className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm ${p === currentPage ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
              ));
            })()}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`px-3 py-1 rounded-full border ${currentPage === totalPages ? 'text-gray-300 border-gray-200 bg-white' : 'text-gray-700 border-gray-200 bg-white hover:bg-gray-50'}`}>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
