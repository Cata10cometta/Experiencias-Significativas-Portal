import "bootstrap/dist/css/bootstrap.min.css";
import  { useEffect, useState } from "react";
import ExperienceModal from "../../features/experience/components/ExperienceModal";
import Evaluation from "../../features/evaluation/components/Evaluation";
import configApi from "../../Api/Config/Config";
import type { Experience } from "../../features/experience/types/experienceTypes";
import type { FollowUp } from "../types/FollowUp";

interface ExperiencesProps {
  onAgregar: () => void;
}

const Experiences: React.FC<ExperiencesProps> = ({ onAgregar }) => {
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

	// Cache of discovered evaluation PDF URLs by experience id
	const [evaluationPdfMap, setEvaluationPdfMap] = useState<Record<number, string>>({});
	// Negative cache to avoid retrying failing evaluation lookups too frequently
	const failedEvalRef = React.useRef<Map<number, number>>(new Map());
	const EVAL_NEGATIVE_TTL = 1000 * 60 * 5; // 5 minutes

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

	// For the current visible page, try to discover evaluation PDF URLs when missing.
	useEffect(() => {
		let cancelled = false;
		const discoverForVisible = async () => {
			const q = searchTerm.trim().toLowerCase();
			const filtered = q ? list.filter(exp => {
				const name = String((exp as any).nameExperiences ?? (exp as any).name ?? '').toLowerCase();
				const area = String((exp as any).areaApplied ?? (exp as any).thematicLocation ?? '').toLowerCase();
				return name.includes(q) || area.includes(q);
			}) : list;
			const start = (currentPage - 1) * pageSize;
			const paginated = filtered.slice(start, start + pageSize);
			for (let i = 0; i < paginated.length; i++) {
				if (cancelled) return;
				const exp = paginated[i];
				const id = exp?.id;
				if (!id) continue;
				// skip if already known or present in experience
				const known = evaluationPdfMap[id] || getPdfUrlFromExp(exp as any);
				if (known) {
					if (known && !evaluationPdfMap[id]) {
						setEvaluationPdfMap(prev => ({ ...prev, [id]: known }));
					}
					continue;
				}
				// if negative cached, skip
				const failedTs = failedEvalRef.current.get(id);
				if (failedTs && (Date.now() - failedTs) < EVAL_NEGATIVE_TTL) continue;
				// fetch and store
				const url = await fetchEvaluationPdfForExperience(id);
				if (cancelled) return;
				if (url) {
					setEvaluationPdfMap(prev => ({ ...prev, [id]: url }));
					// small delay between discoveries
					await new Promise(res => setTimeout(res, 120));
				}
			}
		};
		discoverForVisible();
		return () => { cancelled = true; };
	}, [list, currentPage, searchTerm]);

	// lightweight polling so newly created experiences appear shortly after creation
	useEffect(() => {
		const id = setInterval(() => {
			// refresh list in background
			const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
			const endpoint = `${API_BASE}/api/Experience/List`;
			const token = localStorage.getItem('token');
			fetch(endpoint, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } })
				.then(r => r.ok ? r.json() : Promise.reject())
				.then(d => { if (Array.isArray(d)) setList(d); })
				.catch(() => {});
		}, 8000);
		return () => clearInterval(id);
	}, []);

  

  

	const renderStatusBadge = (stateOrExp?: number | any) => {
		// Accept multiple shapes returned by different endpoints:
		// - numeric state id (1 means active)
		// - boolean `state` true/false
		// - object with keys like stateExperienceId, stateId, State, state
		// - string values like 'Activo' / 'Inactivo'
		let stateId: number | null = null;

		if (typeof stateOrExp === 'number') {
			stateId = stateOrExp;
		} else if (typeof stateOrExp === 'boolean') {
			stateId = stateOrExp ? 1 : 0;
		} else if (typeof stateOrExp === 'string') {
			const s = stateOrExp.trim().toLowerCase();
			if (s === 'activo' || s === 'active') stateId = 1;
			else if (s === 'inactivo' || s === 'inactive') stateId = 0;
			else {
				const n = Number(stateOrExp);
				if (!Number.isNaN(n)) stateId = n;
			}
		} else if (stateOrExp && typeof stateOrExp === 'object') {
			// prefer boolean 'state' if present
			if (typeof stateOrExp.state === 'boolean') return (
				<span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${stateOrExp.state ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
					{stateOrExp.state ? 'Activo' : 'Inactivo'}
				</span>
			);

			const candidates = [
				'stateExperienceId', 'StateExperienceId', 'stateId', 'StateId',
				'state', 'State', 'StateExperience', 'stateExperience', 'status', 'Status'
			];
			for (const k of candidates) {
				const v = stateOrExp[k];
				if (v === undefined || v === null || v === '') continue;
				if (typeof v === 'boolean') { stateId = v ? 1 : 0; break; }
				if (typeof v === 'number') { stateId = v; break; }
				if (typeof v === 'string') {
					const s = v.trim().toLowerCase();
					if (s === 'activo' || s === 'active') { stateId = 1; break; }
					if (s === 'inactivo' || s === 'inactive') { stateId = 0; break; }
					const n = Number(v);
					if (!Number.isNaN(n)) { stateId = n; break; }
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
			// evaluation-level PDF (some endpoints store the generated PDF under an evaluation resource)
			if (exp.evaluation && typeof exp.evaluation === 'object') {
				if (typeof exp.evaluation.urlEvaPdf === 'string' && exp.evaluation.urlEvaPdf.trim()) return exp.evaluation.urlEvaPdf;
				if (typeof exp.evaluation.UrlEvaPdf === 'string' && exp.evaluation.UrlEvaPdf.trim()) return exp.evaluation.UrlEvaPdf;
			}
			if (exp.Evaluation && typeof exp.Evaluation === 'object') {
				if (typeof exp.Evaluation.urlEvaPdf === 'string' && exp.Evaluation.urlEvaPdf.trim()) return exp.Evaluation.urlEvaPdf;
				if (typeof exp.Evaluation.UrlEvaPdf === 'string' && exp.Evaluation.UrlEvaPdf.trim()) return exp.Evaluation.UrlEvaPdf;
			}
			// sometimes API returns the evaluation/pdf URL at the top-level under UrlEvaPdf
			if (typeof exp.urlEvaPdf === 'string' && exp.urlEvaPdf.trim()) return exp.urlEvaPdf;
			if (typeof exp.UrlEvaPdf === 'string' && exp.UrlEvaPdf.trim()) return exp.UrlEvaPdf;
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

	// Try to obtain evaluation PDF URL by querying evaluation endpoints for a given experience id.
	const fetchEvaluationPdfForExperience = async (expId?: number): Promise<string | null> => {
		if (!expId) return null;
		// negative cache check
		const failedTs = failedEvalRef.current.get(expId);
		if (failedTs && (Date.now() - failedTs) < EVAL_NEGATIVE_TTL) {
			console.debug('fetchEvaluationPdfForExperience: skipping recently-failed expId', expId);
			return null;
		}
		const token = localStorage.getItem('token');
		const base = import.meta.env.VITE_API_BASE_URL ?? '';
		const tryPaths = [
			`${base}/api/Evaluation/getByExperience/${expId}`,
			`${base}/api/Evaluation/by-experience/${expId}`,
			`${base}/api/Evaluation/${expId}`,
			`${base}/api/Evaluation?experienceId=${expId}`,
			`/api/Evaluation/getByExperience/${expId}`,
			`/api/Evaluation/by-experience/${expId}`,
			`/api/Evaluation/${expId}`,
			`/api/Evaluation?experienceId=${expId}`,
		];
		for (const url of tryPaths) {
			try {
				const res = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
				if (!res.ok) continue;
				let data: any = null;
				try { data = await res.json(); } catch { data = null; }
				if (!data) continue;
				// normalize shapes: if wrapper object, pick first array or data field
				if (Array.isArray(data)) {
					// find matching by experience id
					const found = data.find((d: any) => d?.experienceId === expId || d?.ExperienceId === expId || d?.experience?.id === expId);
					if (found) data = found;
				} else if (data?.data && (Array.isArray(data.data) || typeof data.data === 'object')) {
					if (Array.isArray(data.data)) {
						const found = data.data.find((d: any) => d?.experienceId === expId || d?.ExperienceId === expId || d?.experience?.id === expId);
						if (found) data = found;
					} else {
						data = data.data;
					}
				}
				// try to extract URL from common fields
				const candidate = data?.UrlEvaPdf || data?.urlEvaPdf || data?.url || data?.pdfUrl || data?.resultUrl || data?.data?.url || null;
				if (candidate && typeof candidate === 'string' && candidate.trim()) {
					console.debug('fetchEvaluationPdfForExperience: found url for exp', expId, candidate);
					return candidate;
				}
			} catch (err) {
				// ignore and continue
				console.debug('fetchEvaluationPdfForExperience: attempt failed for', url, err);
			}
			// small natural delay to avoid burst
			await new Promise(res => setTimeout(res, 220));
		}

		// Fallback: fetch all evaluations and cross by experienceId
		try {
			const allUrl = `${base}/api/Evaluation/getAll`;
			const res = await fetch(allUrl, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
			if (res.ok) {
				let data: any = null;
				try { data = await res.json(); } catch { data = null; }
				if (data && Array.isArray(data.data)) {
					const found = data.data.find((d: any) => d?.experienceId === expId && d?.urlEvaPdf && typeof d.urlEvaPdf === 'string' && d.urlEvaPdf.trim());
					if (found) {
						console.debug('fetchEvaluationPdfForExperience: found urlEvaPdf in getAll for exp', expId, found.urlEvaPdf);
						return found.urlEvaPdf;
					}
				}
			}
		} catch (err) {
			console.debug('fetchEvaluationPdfForExperience: getAll fallback failed', err);
		}
		// mark negative
		failedEvalRef.current.set(expId, Date.now());
		return null;
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

	const requestEdit = async (idOrExp?: number | any) => {
		// accept either an id or the full experience object
		const localExp = (idOrExp && typeof idOrExp === 'object') ? idOrExp : null;
		const id = (typeof idOrExp === 'number') ? idOrExp : (localExp?.id ?? null);
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

      if (!res.ok) throw new Error("Error al obtener experiencias");

      let data = await res.json();
      console.debug('Fetched experiencias:', data);
      setExperienceList(data);
    };

    fetchExperiencias();
  }, []);

  useEffect(() => {
    const fetchTrackingSummary = async () => {
      try {
        const body = {
          pageSize: 0,
          pageNumber: 0,
          filter: "",
          columnFilter: "",
          columnOrder: "",
          directionOrder: "",
          foreignKey: 0,
          nameForeignKey: "",
          aplyPagination: true,
        };
        const response = await configApi.post("/HistoryExperience/tracking-summary", body);
        setTrackingData(response.data);
      } catch (err) {
        setError("Error al obtener datos");
      }
    };
    fetchTrackingSummary();
  }, []);

  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!trackingData) return <div className="text-center py-10 text-gray-500">Cargando...</div>;

  // Seleccionar las tarjetas específicas para el profesor
  const professorCards = [
    {
      title: "Número de experiencias con plan de mejoramiento",
      value: trackingData?.totalExperiencesWithComments ?? "Dato no disponible",
      icon: (
        <div className="bg-orange-100 p-2 rounded-lg w-12 h-12 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Número de experiencias registradas en la vigencia",
      value: trackingData?.totalExperiencesRegistradas ?? "Dato no disponible",
      icon: (
        <div className="bg-blue-100 p-2 rounded-lg w-12 h-12 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Participación de eventos SEM",
      value: trackingData?.totalExperiencesTestsKnow ?? "Dato no disponible",
      icon: (
        <div className="bg-green-100 p-2 rounded-lg w-12 h-12 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v5h8v-5c0-2.21-1.79-4-4-4z"
            />
          </svg>
        </div>
      ),
    },
  ];

  // helper para renderizar las tarjetas estilo maqueta
  const renderTiles = (list: Experience[]) => {
    if (!list || list.length === 0) {
      return <div className="text-gray-500">No hay experiencias para mostrar.</div>;
    }

    const colors = ['bg-indigo-600', 'bg-sky-500', 'bg-amber-500'];

    return list.slice(0, 3).map((exp, i) => {
      const title = (exp as any).nameExperiences ?? (exp as any).name ?? 'Sin título';
      const subtitle = (exp as any).thematicLocation ?? '';

      return (
        <div
          key={exp.id ?? i}
          role="button"
          aria-label={`Abrir evaluación de ${title}`}
          onClick={() => handleVisitarClick(exp.id ?? i)}
          className={`relative ${colors[i % colors.length]} text-white rounded-2xl w-64 h-36 p-6 flex flex-col justify-end shadow-lg cursor-pointer`}
        >

          <div className="absolute left-4 top-3 flex items-center gap-2">
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleIconClick(exp.id ?? i);
              }}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center cursor-pointer"
              aria-label="Ver experiencia"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 010 2.828L8.828 14l-3.536.707.707-3.536L14.586 2.586a2 2 0 012.828 0z" />
              </svg>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0016.586 6L12 1.414A2 2 0 0010.586 1H4z" />
              </svg>
            </div>
            {exp?.documents?.[0]?.urlPdf && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  // abrir PDF en nueva pestaña
                  try {
                    window.open(exp.documents[0].urlPdf, '_blank');
                  } catch (err) {
                    console.error('No se pudo abrir PDF', err);
                  }
                }}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
                title="Abrir PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2v4l3-1.5L12 2zm6 5v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7l6 3 6-3z" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm opacity-90 mt-1">{subtitle}</div>
        </div>
      );
    });
  };

  return (
    <div className="p-8 min-h-screen">
      {/* Perfil del usuario en la página de Experiencias (estilo tarjeta) */}
      {/* Render profile and, if present, an inline PDF report card for the first experience that has a saved PDF URL */}
  <div className="flex flex-col md:flex-row flex-wrap items-start gap-6 ml-4 md:ml-28 mb-8 pb-6">
  <div className="w-full md:w-auto md:max-w-md flex-shrink-0">
          <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-6 shadow-md text-center w-full">
              <div className="relative flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-base sm:text-lg md:text-xl font-bold text-gray-800 bg-gradient-to-br from-pink-200 via-indigo-100 to-sky-200">
                {getInitials(userName)}
              </div>
              <span className="absolute rounded-full border-4 border-dashed border-sky-300/80" style={{ width: '4rem', height: '4rem', top: '-4px' }} />
            </div>
            <div className="mt-4">
              <div className="text-gray-900 font-semibold text-base md:text-lg truncate">{userName}</div>
              <div className="text-gray-500 text-sm md:text-sm mt-1">{userRole}</div>
              {/* ID removed for production */}
            </div>
            <div className="mt-4 text-sm md:text-base text-gray-700">Visualizar experiencias por Evaluación</div>
            <div className="mt-3 flex flex-wrap gap-2 md:gap-3 justify-center">
              <span className="px-3 py-1 text-sm md:text-sm bg-sky-100 text-sky-800 rounded-full">Diagnostico</span>
              <span className="px-3 py-1 text-sm md:text-sm bg-violet-100 text-violet-800 rounded-full">Evaluación Inicial</span>
              <span className="px-3 py-1 text-sm md:text-sm bg-pink-100 text-pink-800 rounded-full">Evaluación Final</span>
              <span className="px-3 py-1 text-sm md:text-sm bg-amber-100 text-amber-800 rounded-full">Por Evaluar</span>
            </div>
          </div>
        </div>

        {/* Inline PDF card: take the first experience that has a documents[0].urlPdf */}
        {(() => {
          const pdfExp = experienceList.find((ex) => ex?.documents?.[0]?.urlPdf);
          if (!pdfExp) return null;
          const pdfUrl = pdfExp.documents[0].urlPdf;
          const title = (pdfExp as any).nameExperiences || (pdfExp as any).name || 'Reporte evaluación';
          const thematic = (pdfExp as any).thematicLineNames?.[0] || '';
          return (
            <div className="flex-1 min-w-0 w-full md:max-w-[520px]">
              <div className="bg-white rounded-lg shadow p-4 relative min-w-0">
                <h3 className="text-xl font-bold mb-3">Reporte de evaluación</h3>

                <div className="flex justify-center mb-3">
                  <div
                    role="button"
                    onClick={(e) => { e.stopPropagation(); try { window.open(pdfUrl, '_blank'); } catch (err) { console.error('No se pudo abrir PDF', err); } }}
                    className="w-[160px] h-[160px] bg-white rounded-lg flex items-center justify-center cursor-pointer hover:shadow-2xl transition-shadow"
                    aria-label="Abrir reporte PDF"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-20 h-20 text-red-700" fill="currentColor">
                      <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V8h4.5L13 3.5z" />
                    </svg>
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-xl font-semibold text-gray-800">{title}</div>
                  <div className="text-sm text-gray-600 mt-2">{thematic}</div>
                  <div className="text-xs text-gray-600 mt-2">{userName}</div>
                </div>

                {/* Trash icon */}
                <div className="absolute right-4 bottom-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeletePdf(pdfExp.id ?? 0); }}
                    aria-label="Eliminar PDF"
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 3h6l1 1h5v2H3V4h5l1-1zm1 6v8h2V9H10zm4 0v8h2V9h-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
      {/* Mostrar tarjetas solo para el rol de profesor */}
      {role && role.toLowerCase() === "profesor" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
          {professorCards.map((card, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-4 flex items-center space-x-4 w-full h-40">
              {card.icon}
              <div className="flex flex-col">
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sección de Experiencias estilo maqueta: título, tabs y tarjetas coloreadas */}
      <div className="rounded-lg p-6 bg-white">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Experiencias</h2>

        <div className="mb-4">
          <div className="flex items-center space-x-2 border-b">
            <button
              onClick={() => setSelectedTab('admin')}
              className={`px-3 py-1 text-sm ${selectedTab === 'admin' ? 'bg-white border-b-2 border-black' : 'text-gray-600'}`}
            >
              Administrador
            </button>
            <button
              onClick={() => setSelectedTab('profesor')}
              className={`px-3 py-1 text-sm ${selectedTab === 'profesor' ? 'bg-white border-b-2 border-black' : 'text-gray-600'}`}
            >
              Profesor
            </button>
            <button
              onClick={() => setSelectedTab('todas')}
              className={`px-3 py-1 text-sm ${selectedTab === 'todas' ? 'bg-white border-b-2 border-black' : 'text-gray-600'}`}
            >
              Todas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-6 py-4">
            {renderTiles(
              selectedTab === 'profesor'
                ? experienceList.filter((e) => e.userId === currentUserId)
                : selectedTab === 'admin'
                ? experienceList.filter((e) => e.userId !== currentUserId)
                : experienceList
            )}
          </div>
        </div>
      </div>
      {/* Modal para mostrar la experiencia seleccionada */}
      {showModal && (
        <ExperienceModal
          show={showModal}
          onClose={handleClose}
          experienceId={selectedExperienceId ?? undefined}
          mode={selectedModalMode} // Modo dinámico: 'edit' cuando se abre desde el lápiz
        />
      )}

      {/* Modal de Evaluation desde el icono */}
      {showEvaluationFromIcon && (
        <div className="fixed inset-0 flex justify-center items-center z-[1100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-2 md:mx-0 p-0 relative flex flex-col overflow-y-auto max-h-[90vh]">
            <button
              onClick={handleCloseEvaluation}
              className="absolute top-4 right-4 text-2xl text-[#00aaff] hover:text-sky-800 focus:outline-none"
              aria-label="Cerrar"
            >
              &times;
            </button>
            <Evaluation experienceId={selectedExperienceId ?? null} experiences={experienceList} onClose={handleCloseEvaluation} onExperienceUpdated={(id:number, url:string) => {
              setExperienceList(prev => prev.map(e => e.id === id ? { ...e, documents: [{ name: e.documents?.[0]?.name ?? '', urlPdf: url, urlLink: e.documents?.[0]?.urlLink ?? '' }] } : e));
            }} />
          </div>
        </div>
      )}

      {/* Floating add-experience button positioned next to the sidebar */}
      <button
        onClick={onAgregar}
        aria-label="Agregar Nueva Experiencia"
        className="fixed z-40 flex items-center cursor-pointer right-[calc(320px+0px)] top-[140px]"
      >
        <div className="flex items-center w-auto rounded-xl overflow-hidden">
          <div className="flex items-center justify-center w-14 h-14 bg-[#0b1220] rounded-lg">
            <span className="text-white text-2xl font-bold">+</span>
          </div>
        </div>
      </button>

      {/* Modal de Evaluación */}
      {showEvaluation && (
        <div className="fixed inset-0 flex justify-center items-center z-[1100]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-2 md:mx-0 p-0 relative flex flex-col overflow-y-auto max-h-[90vh]">
            <button
              onClick={handleCloseEvaluation}
              className="absolute top-4 right-4 text-2xl text-[#00aaff] hover:text-sky-800 focus:outline-none"
              aria-label="Cerrar"
            >
              &times;
            </button>
            <Evaluation onClose={handleCloseEvaluation} onExperienceUpdated={(id:number, url:string) => {
              setExperienceList(prev => prev.map(e => e.id === id ? { ...e, documents: [{ name: e.documents?.[0]?.name ?? '', urlPdf: url, urlLink: e.documents?.[0]?.urlLink ?? '' }] } : e));
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Experiences;
