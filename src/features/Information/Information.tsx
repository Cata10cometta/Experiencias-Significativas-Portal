import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import type { Experience } from '../../features/experience/types/experienceTypes';
import AddExperience from '../experience/components/AddExperience';
import Evaluation from '../evaluation/components/Evaluation';

const Information: React.FC = () => {
  const [list, setList] = useState<Experience[]>([]);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [evaluationExpId, setEvaluationExpId] = useState<number | null>(null);
  // Counts for the evaluation summary cards (consumidos desde la API)
  const [initialCount, setInitialCount] = useState<number | null>(null);
  const [finalCount, setFinalCount] = useState<number | null>(null);
  const [sinCount, setSinCount] = useState<number | null>(null);

  // Fetch counts for the three evaluation filters (inicial, final, sin-evaluacion)
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    const envBase = API_BASE || 'https://localhost:7263';

    const getCountFromResponse = (data: any) => {
      if (data == null) return 0;
      if (Array.isArray(data)) return data.length;
      if (typeof data === 'object') {
        if (typeof data.count === 'number') return data.count;
        if (typeof data.total === 'number') return data.total;
      }
      if (typeof data === 'number') return data;
      return 0;
    };

    const fetchCount = async (path: string) => {
      try {
        // try relative first
        const r = await axios.get(path, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        return getCountFromResponse(r.data);
      } catch (err) {
        try {
          const full = `${envBase.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
          const r2 = await axios.get(full, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
          return getCountFromResponse(r2.data);
        } catch (err2) {
          console.debug('fetchCount failed for', path, err2);
          return 0;
        }
      }
    };

    (async () => {
      try {
        const [a, b, c] = await Promise.all([
          fetchCount('/api/Evaluation/filter/inicial'),
          fetchCount('/api/Evaluation/filter/final'),
          fetchCount('/api/Evaluation/filter/sin-evaluacion'),
        ]);
        if (!mounted) return;
        setInitialCount(a);
        setFinalCount(b);
        setSinCount(c);
      } catch (err) {
        console.debug('error fetching evaluation filter counts', err);
      }
    })();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active card filter state: 'all' | 'inicial' | 'final' | 'sin'
  const [activeCardFilter, setActiveCardFilter] = useState<'all' | 'inicial' | 'final' | 'sin'>('all');

  const fetchFilteredEvaluations = async (filter: 'inicial' | 'final' | 'sin') => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    const envBase = API_BASE || 'https://localhost:7263';
    const pathMap: Record<string, string> = {
      inicial: '/api/Evaluation/filter/inicial',
      final: '/api/Evaluation/filter/final',
      sin: '/api/Evaluation/filter/sin-evaluacion',
    };
    const p = pathMap[filter];
    try {
      // try relative
      let r = null as any;
      try { r = await axios.get(p, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }); }
      catch (e) {
        const full = `${envBase.replace(/\/$/, '')}${p.startsWith('/') ? p : '/' + p}`;
        r = await axios.get(full, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      }

      const data = r?.data;
      // normalize to an array of experiences if possible
      if (Array.isArray(data)) {
        setList(data as Experience[]);
      } else if (data && Array.isArray(data.items)) {
        setList(data.items as Experience[]);
      } else if (data && Array.isArray(data.data)) {
        setList(data.data as Experience[]);
      } else {
        // fallback: empty
        setList([]);
      }
      setCurrentPage(1);
      setActiveCardFilter(filter);
    } catch (err: any) {
      console.error('fetchFilteredEvaluations error', err);
      setError('Error al cargar evaluaciones filtradas');
    } finally {
      setLoading(false);
    }
  };

  const clearCardFilter = async () => {
    setActiveCardFilter('all');
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
      const endpoint = `${API_BASE}/api/Experience/List`;
      const token = localStorage.getItem('token');
      const res = await fetch(endpoint, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      if (!res.ok) throw new Error('Error al obtener experiencias');
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('clearCardFilter error', err);
      setError('Error al restaurar lista');
    } finally {
      setLoading(false);
    }
  };

  const getUserIdFromToken = (): number | null => {
    const token = localStorage.getItem('token');
    try {
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = decodeURIComponent(atob(payload).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const parsed = JSON.parse(decoded) as any;
      const candidates = ['sub','id','userId','user_id','nameid','http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      for (const k of candidates) {
        const v = parsed[k];
        if (v !== undefined && v !== null) {
          const num = Number(v);
          if (!Number.isNaN(num) && Number.isFinite(num) && num > 0) return Math.trunc(num);
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  // default to 'mine' view for professors
  React.useEffect(() => {
    try {
      // isProfessor is declared later in this file
      if ((isProfessor && typeof isProfessor === 'function') && isProfessor()) setViewMode('mine');
    } catch {}
  }, []);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    const endpoint = `${API_BASE}/api/Experience/List`;
    const token = localStorage.getItem('token');

    const fetchData = async () => {
      try {
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error('Error al obtener experiencias');
        const data = await res.json();
        setList(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // lightweight polling so newly created experiences appear shortly after creation
  useEffect(() => {
    const id = setInterval(() => {
      // Only refresh the full list when no card filter is active
      if (activeCardFilter !== 'all') return;

      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
      const endpoint = `${API_BASE}/api/Experience/List`;
      const token = localStorage.getItem('token');
      fetch(endpoint, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => { if (Array.isArray(d)) setList(d); })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(id);
  }, [activeCardFilter]);

  

  

  

  // renderStatusBadge: accept either a numeric state id or an experience object
  // and resolve common backend field names so UI reflects the true state.
  const renderStatusBadge = (stateOrExp?: number | any) => {
    let stateId: number | null = null;
    if (typeof stateOrExp === 'number') {
      stateId = stateOrExp;
    } else if (stateOrExp && typeof stateOrExp === 'object') {
      // try several common field names returned by different endpoints
      const candidates = [
        'stateExperienceId', 'StateExperienceId', 'stateId', 'StateId',
        'state', 'State', 'StateExperience', 'stateExperience'
      ];
      for (const k of candidates) {
        const v = stateOrExp[k];
        if (v !== undefined && v !== null && v !== '') {
          const num = Number(v);
          if (!Number.isNaN(num)) { stateId = num; break; }
        }
      }
    }

    const isActive = stateId === 1;
    return (
      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  const formatDevelopmentTime = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  };

  

  const openModal = (id?: number) => {
    if (!id) return;
    setSelectedExperienceId(id);
    setShowModal(true);
  };

  // Helpers to inspect token for roles/userId. Reused by render and requestEdit.
  const parseJwt = (t: string | null) => {
    if (!t) return null;
    try {
      const parts = t.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = decodeURIComponent(atob(payload).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  };

  const getUserRoles = (): string[] => {
    const token = localStorage.getItem('token');
    const parsed = parseJwt(token ?? null) as any;
    if (!parsed) return [];
    // common claim names
    const candidates = [
      'role', 'roles', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'
    ];
    for (const k of candidates) {
      const v = parsed[k];
      if (!v) continue;
      if (Array.isArray(v)) return v.map(String).map(s => s.toLowerCase());
      if (typeof v === 'string') return v.split(',').map(s => s.trim().toLowerCase());
    }
    // also try 'roles' nested or other shapes
    if (parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
      const v = parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (Array.isArray(v)) return v.map(String).map(s => s.toLowerCase());
      if (typeof v === 'string') return v.split(',').map(s => s.trim().toLowerCase());
    }
    return [];
  };

  const isProfessor = (): boolean => {
    const roles = getUserRoles();
    if (!roles || roles.length === 0) return false;
    return roles.some(r => ['profesor', 'profesora', 'teacher', 'docente'].includes(r));
  };

  // Robust helper to locate a PDF URL in several possible shapes the API might return
  const getPdfUrlFromExp = (exp?: Experience | any): string | null => {
    if (!exp) return null;

    try {
      // 1) documents array (common pattern used elsewhere)
      if (exp.documents && Array.isArray(exp.documents) && exp.documents.length > 0) {
        const doc = exp.documents[0];
        if (!doc) return null;
        // handle variations inside document object
        if (typeof doc.urlPdf === 'string' && doc.urlPdf.trim()) return doc.urlPdf;
        if (typeof doc.UrlPdf === 'string' && doc.UrlPdf.trim()) return doc.UrlPdf;
        if (typeof doc.url === 'string' && doc.url.trim()) return doc.url;
        // nested shape like { urlPdf: { url: '...' } }
        if (doc.urlPdf && typeof doc.urlPdf === 'object' && typeof doc.urlPdf.url === 'string') return doc.urlPdf.url;
      }

      // 2) top-level variations returned by some endpoints
      if (typeof exp.urlPdf === 'string' && exp.urlPdf.trim()) return exp.urlPdf;
      if (typeof exp.UrlPdf === 'string' && exp.UrlPdf.trim()) return exp.UrlPdf;
      if (typeof exp.url === 'string' && exp.url.trim()) return exp.url;
      if (typeof exp.pdfUrl === 'string' && exp.pdfUrl.trim()) return exp.pdfUrl;

      // 3) sometimes the API returns an object with UrlPdf property
      if (exp.UrlPdf && typeof exp.UrlPdf === 'object' && typeof exp.UrlPdf.url === 'string') return exp.UrlPdf.url;

      // nothing found
      console.debug('getPdfUrlFromExp: no PDF url found for experience', exp?.id ?? exp);
      return null;
    } catch (err) {
      console.warn('getPdfUrlFromExp error', err, exp?.id ?? exp);
      return null;
    }
  };

  // cache of evaluation PDF urls found for experiences (keyed by experience id)
  const [evaluationPdfMap, setEvaluationPdfMap] = useState<Record<number, string>>({});

  // Try to locate an evaluation-record PDF URL for a given experience id
  const fetchEvaluationPdfUrl = async (expId?: number): Promise<string | null> => {
    if (!expId) return null;
    const token = localStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    const envBase = API_BASE || 'https://localhost:7263';
    const tryPaths = [
      `/api/Evaluation/getByExperience/${expId}`,
      `/api/Evaluation/by-experience/${expId}`,
      `/api/Evaluation/GetByExperience/${expId}`,
      `/api/Evaluation?experienceId=${expId}`,
      `/api/Evaluation?ExperienceId=${expId}`,
      `/api/Evaluation/${expId}`,
    ];

    try {
      for (const p of tryPaths) {
        // try relative first (vite proxy)
        try {
          const r = await axios.get(p, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
          console.debug('fetchEvaluationPdfUrl: tried', p, 'status', r?.status);
          if (r && (r.status === 200 || r.status === 201) && r.data) {
            const d = r.data;
            const candidate = Array.isArray(d) ? d[0] : d;
            if (!candidate) continue;
            const possible = [
              candidate?.UrlEvaPdf,
              candidate?.urlEvaPdf,
              candidate?.UrlPdf,
              candidate?.urlPdf,
              candidate?.UrlEvaPdf?.url,
              candidate?.url,
              candidate?.pdfUrl,
              candidate?.resultUrl,
            ];
            for (const v of possible) {
              if (typeof v === 'string' && v.trim()) {
                console.debug('fetchEvaluationPdfUrl: found via relative', p, v);
                return v.trim();
              }
            }
          }
        } catch (e) {
          // if relative fails (405 or CORS), try absolute next
          try {
            const full = `${envBase.replace(/\/$/, '')}${p.startsWith('/') ? p : '/' + p}`;
            const r2 = await axios.get(full, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
            console.debug('fetchEvaluationPdfUrl: tried absolute', full, 'status', r2?.status);
            if (r2 && (r2.status === 200 || r2.status === 201) && r2.data) {
              const d2 = r2.data;
              const candidate2 = Array.isArray(d2) ? d2[0] : d2;
              if (!candidate2) continue;
              const possible2 = [
                candidate2?.UrlEvaPdf,
                candidate2?.urlEvaPdf,
                candidate2?.UrlPdf,
                candidate2?.urlPdf,
                candidate2?.UrlEvaPdf?.url,
                candidate2?.url,
                candidate2?.pdfUrl,
                candidate2?.resultUrl,
              ];
              for (const v of possible2) {
                if (typeof v === 'string' && v.trim()) {
                  console.debug('fetchEvaluationPdfUrl: found via absolute', full, v);
                  return v.trim();
                }
              }
            }
          } catch (e2) {
            // ignore and continue
            console.debug('fetchEvaluationPdfUrl: both relative and absolute failed for', p, e2);
          }
        }
      }
    } catch (err) {
      console.debug('fetchEvaluationPdfUrl error', err);
    }
    return null;
  };

  // Helper to compare experience id flexibly (handles id, Id, experienceId, ExperienceId)
  const matchesExperienceId = (exp: any, id?: number | null) => {
    if (!id) return false;
    const candidates = [exp?.id, exp?.Id, exp?.experienceId, exp?.ExperienceId];
    return candidates.some((v) => Number(v) === Number(id));
  };

  // Open PDF link with token-aware fetch first (for private files), then fallback
  const openPdfWithAuth = async (raw?: string | null) => {
    if (!raw) return;
    const token = localStorage.getItem('token');
    try {
      if ((/^https?:\/\//i.test(raw) || raw.startsWith('/')) && token) {
        try {
          const resp = await fetch(raw, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
          if (resp.ok) {
            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);
            const opened = window.open(blobUrl, '_blank');
            if (!opened) {
              const a = document.createElement('a');
              a.href = blobUrl;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
              a.remove();
            } else {
              try { opened.focus(); } catch {}
            }
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
            return;
          }
        } catch (err) {
          console.warn('Fetch con token falló, intentando abrir URL directamente', err);
        }
      }

      // fallback: try open raw URL directly
      const opened = window.open(String(raw), '_blank');
      if (!opened) {
        const a = document.createElement('a');
        a.href = String(raw);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
        Swal.fire({
          title: 'Abrir PDF',
          html: `Si no se abrió una nueva pestaña, <a href="${String(raw)}" target="_blank" rel="noopener noreferrer">haz clic aquí para abrir el PDF</a>.<br/><br/>Si usas un bloqueador de ventanas emergentes, permite popups para este sitio.`,
          icon: 'info',
          confirmButtonText: 'Entendido'
        });
      } else {
        try { opened.focus(); } catch {}
      }
    } catch (err) {
      console.error('Error al abrir PDF', err);
      try { window.location.href = String(raw); } catch {}
    }
  };

  // Attempt to find evaluation PDF for an experience and show it (no generation)
  const generatePdfForExperience = async (expId?: number) => {
    if (!expId) return;
    Swal.fire({ title: 'Buscando PDF', html: 'Por favor espere...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
    try {
      // first check if the experience itself already has a PDF
      const expObj = list.find(it => Number((it as any)?.id || (it as any)?.Id || (it as any)?.experienceId || (it as any)?.ExperienceId) === Number(expId));
      const local = getPdfUrlFromExp(expObj as any);
      if (local) {
        await openPdfWithAuth(local);
        return;
      }

      // check cached evaluation map
      if (evaluationPdfMap[expId]) {
        await openPdfWithAuth(evaluationPdfMap[expId]);
        return;
      }

      // try to discover on the evaluation endpoints
      const found = await fetchEvaluationPdfUrl(expId);
      if (found) {
        // cache it
        setEvaluationPdfMap(prev => ({ ...prev, [expId]: found }));
        // also update local list documents so UI reflects it
        setList(prev => prev.map(it => {
          const idMatch = Number((it as any)?.id || (it as any)?.Id || (it as any)?.experienceId || (it as any)?.ExperienceId) === Number(expId);
          if (!idMatch) return it;
          const docs = Array.isArray((it as any).documents) ? (it as any).documents.slice() : [];
          if (docs.length === 0) docs[0] = { urlPdf: found } as any;
          else docs[0] = { ...(docs[0] || {}), urlPdf: found } as any;
          return { ...(it as any), documents: docs } as Experience;
        }));

        await openPdfWithAuth(found);
        return;
      }

      await Swal.fire({ title: 'No se encontró PDF', text: 'No se encontró una URL de PDF en la evaluación asociada a esta experiencia.', icon: 'warning', confirmButtonText: 'Aceptar' });
    } catch (err: any) {
      console.error('fetch/show evaluation pdf error', err);
      await Swal.fire({ title: 'Error', text: err?.message || 'Error buscando el PDF', icon: 'error', confirmButtonText: 'Aceptar' });
    } finally {
      try { Swal.close(); } catch {}
    }
  };

  // When the list changes, try to discover evaluation PDF urls for experiences that don't have a PDF yet
  useEffect(() => {
    if (!list || list.length === 0) return;
    // discover for the first page items only to avoid spamming the backend
    const toCheck = list.slice(0, 20);
    let cancelled = false;
    (async () => {
      for (const exp of toCheck) {
        try {
          const expId = Number((exp as any)?.id || (exp as any)?.Id || (exp as any)?.experienceId || (exp as any)?.ExperienceId);
          if (!expId || evaluationPdfMap[expId]) continue;
          const hasExpPdf = getPdfUrlFromExp(exp as any);
          if (hasExpPdf) continue;
          const found = await fetchEvaluationPdfUrl(expId);
          if (found && !cancelled) {
            setEvaluationPdfMap(prev => ({ ...prev, [expId]: found }));
            // also update local list so UI shows the PDF button immediately
            setList(prev => prev.map(it => {
              const idMatch = Number((it as any)?.id || (it as any)?.Id || (it as any)?.experienceId || (it as any)?.ExperienceId) === expId;
              if (!idMatch) return it;
              const docs = Array.isArray((it as any).documents) ? (it as any).documents.slice() : [];
              if (docs.length === 0) docs[0] = { urlPdf: found } as any;
              else docs[0] = { ...(docs[0] || {}), urlPdf: found } as any;
              return { ...(it as any), documents: docs } as Experience;
            }));
          }
        } catch (e) {
          // ignore per-row errors
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

    // Listen for global event dispatched by Evaluation when a PDF URL is saved
    useEffect(() => {
      const handler = async (ev: any) => {
        try {
          const detail = ev?.detail ?? null;
          let expId: number | null = null;
          let url: string | null = null;

          if (detail) {
            if (typeof detail === 'object') {
              expId = detail.experienceId ?? detail.experienceid ?? detail.id ?? null;
              url = detail.url ?? detail.pdfUrl ?? detail.UrlEvaPdf ?? detail.UrlPdf ?? null;
            } else if (typeof detail === 'number') {
              expId = detail;
            }
          }

          if (!expId) return;

          // If no URL was provided in the event, try to discover it via evaluation endpoints
          if (!url) {
            const found = await fetchEvaluationPdfUrl(expId);
            url = found;
          }

          if (url) {
            // cache it
            setEvaluationPdfMap(prev => ({ ...prev, [expId as number]: url as string }));

            // update the in-memory list so the UI shows "Ver PDF" immediately
            setList(prev => prev.map(it => {
              if (matchesExperienceId(it, expId)) {
                const docs = Array.isArray((it as any).documents) ? [...(it as any).documents] : [];
                if (docs.length > 0) {
                  docs[0] = { ...docs[0], urlPdf: url };
                } else {
                  docs.unshift({ urlPdf: url } as any);
                }
                return { ...it, documents: docs, UrlPdf: url, urlPdf: url } as any;
              }
              return it;
            }));
          }
        } catch (err) {
          console.debug('experiencePdfUpdated handler error', err);
        }
      };

      window.addEventListener('experiencePdfUpdated', handler as EventListener);
      return () => window.removeEventListener('experiencePdfUpdated', handler as EventListener);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const requestEdit = async (id?: number) => {
    if (!id) return;
    if (!isProfessor()) {
      await Swal.fire({ title: 'No autorizado', text: 'Solo los usuarios con rol de profesor pueden solicitar edición.', icon: 'warning', confirmButtonText: 'Aceptar' });
      return;
    }
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    // send userId as query param to match backend swagger example
    const endpointBase = `${API_BASE}/api/Experience/${id}/request-edit`;
    const token = localStorage.getItem('token');
    // try to extract numeric userId from token or fallback to localStorage
    const tryExtractUserId = (t?: string | null) => {
      if (!t) return null;
      const parsed = parseJwt(t);
      if (!parsed || typeof parsed !== 'object') return null;
      const candidates = ['sub','id','userId','user_id','nameid','http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      for (const k of candidates) {
        const v = (parsed as any)[k];
        if (v !== undefined && v !== null) {
          const num = Number(v);
          if (!Number.isNaN(num) && Number.isFinite(num) && num > 0) return Math.trunc(num);
        }
      }
      return null;
    };
    const extractedFromToken = tryExtractUserId(token ?? null);
    const storedUserId = Number(localStorage.getItem('userId')) || null;
    const userIdToSend = extractedFromToken ?? (storedUserId && Number.isFinite(storedUserId) && storedUserId > 0 ? storedUserId : null);
    if (!userIdToSend) {
      await Swal.fire({ title: 'Error', text: 'No se pudo determinar el userId. Por favor inicie sesión.', icon: 'error', confirmButtonText: 'Aceptar' });
      return;
    }
    try {
      const endpoint = `${endpointBase}?userId=${encodeURIComponent(String(userIdToSend))}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Try to parse JSON body first, fallback to text
      let body: any = null;
      try { body = await res.clone().json(); } catch { body = await res.clone().text().catch(() => null); }

      const backendMsg = (body && (body.message || body.msg || body.error || (typeof body === 'string' ? body : null))) || null;

      if (res.ok) {
        await Swal.fire({ title: 'Solicitud enviada', text: backendMsg ?? 'La solicitud de edición fue enviada correctamente.', icon: 'success', confirmButtonText: 'Aceptar' });
      } else {
        const text = backendMsg ?? `Error al solicitar edición (HTTP ${res.status})`;
        await Swal.fire({ title: 'Error', text, icon: 'error', confirmButtonText: 'Aceptar' });
      }
    } catch (err: any) {
      console.error('requestEdit error', err);
      await Swal.fire({ title: 'Error', text: err?.message || 'Error desconocido al solicitar edición', icon: 'error', confirmButtonText: 'Aceptar' });
    }
  };

  // Fetch detail and show it in a read-only modal using the same general layout as the create form
  const [viewData, setViewData] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);

  // Prevent background/body scroll when modals are open to avoid double scrollbars.
  // Use fixed positioning on body and store scroll position so the page doesn't jump
  // and the browser scrollbar is removed reliably across browsers.
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    let scrollY = 0;

    const lock = () => {
      scrollY = window.scrollY || window.pageYOffset || 0;
      // set fixed positioning to prevent background scroll and remove scrollbar
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      // also hide html overflow as a fallback for some layouts
      document.documentElement.style.overflow = 'hidden';
    };

    const unlock = () => {
      // restore previous inline styles
      document.body.style.position = prevBodyPosition || '';
      document.body.style.top = prevBodyTop || '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = prevBodyOverflow || '';
      document.documentElement.style.overflow = prevHtmlOverflow || '';
      // restore scroll position
      try { window.scrollTo(0, scrollY); } catch {}
    };

    if (showViewModal || showAddModal || showEvaluationModal) {
      lock();
    } else {
      // ensure we restore styles if no modal is open
      unlock();
    }

    return () => {
      unlock();
    };
  }, [showViewModal, showAddModal, showEvaluationModal]);

  const fetchAndShowDetail = async (id?: number) => {
    if (!id) return;
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    const endpoint = `${API_BASE}/api/Experience/detail/Form/${id}`;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(endpoint, { method: 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      if (!res.ok) {
        const text = await res.text().catch(() => `HTTP ${res.status}`);
        await Swal.fire({ title: 'Error', text: `No se pudo obtener el detalle: ${text}`, icon: 'error', confirmButtonText: 'Aceptar' });
        return;
      }
      const data = await res.json();
      // debug: log the raw response so we can inspect server shape when data isn't showing
      console.debug('fetchAndShowDetail: received data for id', id, data);

      // Use shared normalizer helper to map backend JSON to the AddExperience shape
      const { normalizeToInitial } = await import('../experience/utils/normalizeExperience');
      const initialData = normalizeToInitial(data);
      console.debug('fetchAndShowDetail: normalized identificacionInstitucional', initialData?.identificacionInstitucional);
      console.debug('fetchAndShowDetail: normalized seguimientoEvaluacion', initialData?.seguimientoEvaluacion);
      console.debug('fetchAndShowDetail: normalized informacionApoyo', initialData?.informacionApoyo);
      setViewData(initialData);
      setShowViewModal(true);
    } catch (err: any) {
      console.error('fetchAndShowDetail error', err);
      await Swal.fire({ title: 'Error', text: err?.message || 'Error al obtener detalle', icon: 'error', confirmButtonText: 'Aceptar' });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedExperienceId(null);
    // refresh list once when closing modal
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    const endpoint = `${API_BASE}/api/Experience/List`;
    const token = localStorage.getItem('token');
    fetch(endpoint, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { if (Array.isArray(d)) setList(d); })
      .catch(() => {});
  };

  return (
    <div className="p-8 min-h-[70vh]">
      <div className="bg-gray-50 rounded-lg p-8 shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Gestion de Evaluación</h1>
            <p className="text-sm text-gray-500">Optimiza la eficiencia de la evaluación</p>
          </div>
          <div>

          </div>
        </div>

        {/* Evaluation summary cards (diseño) */}
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => fetchFilteredEvaluations('inicial')}
              className={`w-full text-left flex items-center justify-between p-4 rounded-xl! border ${activeCardFilter === 'inicial' ? 'border-sky-600 bg-sky-50' : 'border-gray-200 bg-white'} shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 2.21-3 4-3 4s-3-1.79-3-4a3 3 0 116 0zM12 7a3 3 0 100 6 3 3 0 000-6z"/></svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">Evaluacion inicial</div>
                  <div className="text-xs text-gray-500">{initialCount !== null ? `${initialCount} evaluaciones` : 'Cargando...'}</div>
                </div>
              </div>
              <div className="ml-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold">{initialCount ?? 0}</div>
              </div>
            </button>

            <button
              onClick={() => fetchFilteredEvaluations('final')}
              className={`w-full text-left flex items-center justify-between p-4 rounded-xl! border ${activeCardFilter === 'final' ? 'border-sky-600 bg-sky-50' : 'border-gray-200 bg-white'} shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 2.21-3 4-3 4s-3-1.79-3-4a3 3 0 116 0zM12 7a3 3 0 100 6 3 3 0 000-6z"/></svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">Evaluacion final</div>
                  <div className="text-xs text-gray-500">{finalCount !== null ? `${finalCount} evaluaciones` : 'Cargando...'}</div>
                </div>
              </div>
              <div className="ml-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold">{finalCount ?? 0}</div>
              </div>
            </button>

            <button
              onClick={() => fetchFilteredEvaluations('sin')}
              className={`w-full text-left flex items-center justify-between p-4 rounded-xl! border ${activeCardFilter === 'sin' ? 'border-sky-600 bg-sky-50' : 'border-gray-200 bg-white'} shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 2.21-3 4-3 4s-3-1.79-3-4a3 3 0 116 0zM12 7a3 3 0 100 6 3 3 0 000-6z"/></svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">Sin evaluar</div>
                  <div className="text-xs text-gray-500">{sinCount !== null ? `${sinCount} evaluaciones` : 'Cargando...'}</div>
                </div>
              </div>
              <div className="ml-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold">{sinCount ?? 0}</div>
              </div>
            </button>
          </div>
          <div className="mt-2 text-right">
            {activeCardFilter !== 'all' && (
              <button onClick={clearCardFilter} className="text-sm text-sky-600 hover:underline">Limpiar filtro</button>
            )}
          </div>
        </div>
        {/* Mostrar AddExperience (formulario) en modo lectura para reutilizar diseño */}
        {showViewModal && viewData && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-8">
            <div className="w-[96%] max-w-6xl p-0 max-h-[90vh] flex flex-col">
              {/* Debug panel removed at user's request */}
              <div className="p-4 flex-1 overflow-auto">
                <AddExperience {...({
                  initialData: viewData,
                  /* abrir en modo editable para permitir navegación entre secciones */
                  readOnly: false,
                  disableValidation: true,
                  onVolver: () => { setShowViewModal(false); setViewData(null); }
                } as any)} />
              </div>
            </div>
          </div>
        )}

        {showEvaluationModal && evaluationExpId != null && (
          <div className="fixed inset-0 z-[2000] flex items-start justify-center bg-black/50 pt-8 px-4">
            <div className="w-[96%] max-w-6xl p-0 max-h-[90vh] flex flex-col">
              <div className="p-4 ">
                <div className="mt-4">
                  <Evaluation
                    experienceId={evaluationExpId}
                    experiences={list}
                    onClose={() => setShowEvaluationModal(false)}
                    onExperienceUpdated={(id: number, url: string) => {
                      setList(prev => prev.map(it => {
                        if (matchesExperienceId(it as any, id)) {
                          const docs = Array.isArray((it as any).documents) ? (it as any).documents.slice() : [];
                          if (docs.length === 0) docs[0] = { urlPdf: url } as any;
                          else docs[0] = { ...(docs[0] || {}), urlPdf: url } as any;
                          return { ...(it as any), documents: docs } as Experience;
                        }
                        return it;
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search row */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar experiencias..."
                className="pl-10 pr-3 py-2 border rounded-2xl w-full bg-gray-50"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
              </div>
            </div>
          </div>
          {/* Filter button removed as requested */}
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="text-left text-sm text-gray-600 bg-gray-50 rounded-t-md px-4 py-3 font-semibold">
              <div className="grid grid-cols-6 gap-4 items-center">
              <div>Nombre de la experiencia</div>
              <div>Area aplicada</div>
              <div className="text-center">Nombre de usuario</div>
              <div className="text-center">Aplicar Evaluación</div>
              <div className="text-center">PDF</div>
              <div className="text-center">Inhabilitar/Habilitar</div>
            </div>
          </div>

          <div>
            {loading ? (
              <div className="p-6 text-gray-500">Cargando...</div>
            ) : error ? (
              <div className="p-6 text-red-500">{error}</div>
            ) : (
              (() => {
                const q = searchTerm.trim().toLowerCase();
                const filtered = q ? list.filter(exp => {
                  const name = String((exp as any).nameExperiences ?? (exp as any).name ?? '').toLowerCase();
                  const area = String((exp as any).areaApplied ?? (exp as any).thematicLocation ?? '').toLowerCase();
                  return name.includes(q) || area.includes(q);
                }) : list;
                const total = filtered.length;
                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                const start = (currentPage - 1) * pageSize;
                const paginated = filtered.slice(start, start + pageSize);

                return (
                  <div className="divide-y">
                    {paginated.map((exp, idx) => (
                      <div className="px-6 py-4" key={exp.id ?? idx}>
                        <div className="grid grid-cols-6 gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <button onClick={() => openModal(exp.id)} className="text-left text-sm font-medium text-gray-800 hover:underline">
                              {(exp as any).nameExperiences ?? (exp as any).name ?? 'Sin título'}
                            </button>
                          </div>

                          <div className="text-sm text-gray-600">{(exp as any).areaApplied ?? (exp as any).thematicLocation ?? (exp as any).code ?? '-'}</div>

                          <div className="text-center text-sm text-gray-600">
                            {(() => {
                              const e: any = exp as any;
                              // prefer nested user.username (matches src/features/security/types/user.ts)
                              const candidates = [
                                e?.user?.username,
                                e?.user?.name,
                                e?.ownerName,
                                e?.userName,
                                e?.username,
                                e?.createdBy,
                                e?.requestUser,
                              ];
                              for (const c of candidates) {
                                if (c !== undefined && c !== null && String(c).trim() !== '') return String(c);
                              }
                              return '-';
                            })()}
                          </div>

                          <div className="text-center">
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              title="Aplicar evaluación"
                              aria-label="Aplicar evaluación"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setEvaluationExpId(exp.id as number);
                                setShowEvaluationModal(true);
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline w-5 h-5">
                                <path d="M9.29289 0H4C2.89543 0 2 0.895431 2 2V14C2 15.1046 2.89543 16 4 16H12C13.1046 16 14 15.1046 14 14V4.70711C14 4.44189 13.8946 4.18754 13.7071 4L10 0.292893C9.81246 0.105357 9.55811 0 9.29289 0ZM9.5 3.5V1.5L12.5 4.5H10.5C9.94772 4.5 9.5 4.05228 9.5 3.5ZM4.5 9C4.22386 9 4 8.77614 4 8.5C4 8.22386 4.22386 8 4.5 8H11.5C11.7761 8 12 8.22386 12 8.5C12 8.77614 11.7761 9 11.5 9H4.5ZM4 10.5C4 10.2239 4.22386 10 4.5 10H11.5C11.7761 10 12 10.2239 12 10.5C12 10.7761 11.7761 11 11.5 11H4.5C4.22386 11 4 10.7761 4 10.5ZM4.5 13C4.22386 13 4 12.7761 4 12.5C4 12.2239 4.22386 12 4.5 12H8.5C8.77614 12 9 12.2239 9 12.5C9 12.7761 8.77614 13 8.5 13H4.5Z" fill="#0EA5E9"/>
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-center justify-center">
                            {(() => {
                              const expIdForRow = Number((exp as any)?.id || (exp as any)?.Id || (exp as any)?.experienceId || (exp as any)?.ExperienceId || idx);
                              const raw = getPdfUrlFromExp(exp as any) || (expIdForRow ? evaluationPdfMap[expIdForRow] : null);
                              if (raw) {
                                return (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      openPdfWithAuth(raw).catch(err => console.error('openPdfWithAuth error', err));
                                    }}
                                    aria-label="Ver PDF"
                                    title="Ver PDF"
                                    className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
                                  >
                                    Ver PDF
                                  </button>
                                );
                              }

                              return (
                                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md font-medium">Sin PDF</span>
                              );
                            })()}
                          </div>

                          <div className="text-center">
                            {renderStatusBadge(exp)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination footer */}
                    <div className="py-4 px-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {total === 0 ? (
                          <>Mostrando 0 experiencias</>
                        ) : (
                          (() => {
                            const startIdx = Math.min(total, start + 1);
                            const endIdx = Math.min(total, start + paginated.length);
                            return <>Mostrando {startIdx}-{endIdx} de {total} experiencias</>;
                          })()
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded border" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Anterior</button>
                        {(() => {
                          const pages: number[] = [];
                          let startPage = Math.max(1, currentPage - 2);
                          let endPage = Math.min(totalPages, startPage + 4);
                          if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
                          for (let i = startPage; i <= endPage; i++) pages.push(i);
                          return pages.map((p) => (
                            <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 rounded ${currentPage === p ? 'bg-sky-600 text-white' : 'bg-white border'}`}>{p}</button>
                          ));
                        })()}
                        <button className="px-3 py-1 rounded border" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Siguiente</button>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;