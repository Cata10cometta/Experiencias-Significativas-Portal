import React, { useEffect, useState } from 'react';
import Joyride from 'react-joyride';
import axios from 'axios';
import { securitySummaryTourSteps, securityTourLocale, securityTourStyles } from '../../onboarding/securityTour';

interface RawPerm { id: number; role?: string; form?: string; permission?: string; state?: boolean }

const pageSize = 5;

const Summary: React.FC = () => {
  const [items, setItems] = useState<RawPerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [runTour, setRunTour] = useState(false);

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

  useEffect(() => {
    if (!loading && !runTour && !localStorage.getItem('securitySummaryTourDone')) {
      const timer = window.setTimeout(() => setRunTour(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, [loading, runTour]);

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
    <div className="max-w-full mx-auto -mt-1! p-2 sm:p-6 security-summary-layout">
      <Joyride
        steps={securitySummaryTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={securityTourLocale}
        styles={securityTourStyles}
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            setRunTour(false);
            localStorage.setItem('securitySummaryTourDone', 'true');
          }
        }}
      />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 sm:p-6 security-summary-card">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-1 security-summary-header">
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
            <h2 className="text-2xl font-bold text-sky-700">Modelo de Seguridad</h2>
            <p className="text-sm text-gray-500 mb-6">Vista general de permisos por rol y formulario</p>
            <div className="mb-8"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 security-summary-cards">
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

        <div className="mb-4 flex flex-col sm:flex-row items-center gap-4 security-summary-search">
          <div className="flex-1 w-full">
            <div className="relative">
              <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Buscar en el modelo de seguridad..." className="pl-10 pr-4 h-12 border rounded-full w-full bg-gray-50 shadow-sm" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 p-2 sm:p-4 overflow-x-auto overflow-y-auto max-h-[60vh] security-summary-table">
          <table className="min-w-[700px] w-full table-auto">
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

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500 security-summary-pagination">
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
      </div>
    </div>
  );
};

export default Summary;
