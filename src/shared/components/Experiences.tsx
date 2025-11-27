import React, { useEffect, useMemo, useState } from 'react';
import Joyride from 'react-joyride';
import Evaluation from '../../features/evaluation/components/Evaluation';
import Swal from 'sweetalert2';
import type { Experience } from '../../features/experience/types/experienceTypes';
import AddExperience from '../../features/experience/components/AddExperience';
import { experiencesTourBaseSteps, experiencesTourLocale, experiencesTourStyles } from '../../features/onboarding/experiencesTour';
import { hasTourBeenSeen, markTourSeen } from '../utils/tourStorage';

type ExperiencesProps = {
	onAgregar?: () => void;
};

const Experiences: React.FC<ExperiencesProps> = ({ onAgregar }) => {
	const tourKey = 'experiencesTourDone';
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
	const [runTour, setRunTour] = useState(false);
	// State for the evaluation modal and currently selected evaluation experience id
	const [showEvalModal, setShowEvalModal] = useState<boolean>(false);
	const [evalExpId, setEvalExpId] = useState<number | null>(null);
	const [existingEditRequest, setExistingEditRequest] = useState<{ message: string; experienceId: number; experience: Experience | any | null } | null>(null);

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

	useEffect(() => {
		if (!hasTourBeenSeen(tourKey)) {
			const timer = window.setTimeout(() => setRunTour(true), 800);
			return () => window.clearTimeout(timer);
		}
	}, [tourKey]);

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
				<span className={`inline-block px-3 py-1 text-xs font-medium rounded-full experiences-status ${stateOrExp.state ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
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
			<span className={`inline-block px-3 py-1 text-xs font-medium rounded-full experiences-status ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
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

	const extractUserFacingMessage = (raw?: string | null): string | null => {
		if (!raw) return null;
		const trimmed = raw.trim();
		if (!trimmed) return null;
		const specific = trimmed.match(/ya existe una solicitud[^.]*\./i);
		if (specific && specific[0]) return specific[0].trim();
		const firstLine = trimmed.split(/\r?\n/)[0]?.trim();
		if (firstLine?.toLowerCase().startsWith('system.exception:')) {
			const afterColon = firstLine.split(':').slice(1).join(':').trim();
			if (afterColon) return afterColon;
		}
		return firstLine || trimmed;
	};

	const isProfessorUser = useMemo(() => isProfessor(), []);

	const tourSteps = useMemo(() => {
		if (isProfessorUser) {
			return experiencesTourBaseSteps.filter(step => step.target !== '.experiences-evaluation');
		}
		return experiencesTourBaseSteps;
	}, [isProfessorUser]);

	const showEvaluationColumn = !isProfessorUser;

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
		const localExp = (idOrExp && typeof idOrExp === 'object') ? idOrExp : null;
		const id = (typeof idOrExp === 'number') ? idOrExp : (localExp?.id ?? null);
		if (!id) return;

		if (!isProfessor()) {
			await Swal.fire({ title: 'No autorizado', text: 'Solo los usuarios con rol de profesor pueden solicitar edición.', icon: 'warning', confirmButtonText: 'Aceptar' });
			return;
		}

		const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
		const endpointBase = `${API_BASE}/api/Experience/${id}/request-edit`;
		const token = localStorage.getItem('token');

		const tryExtractUserId = (t?: string | null) => {
			if (!t) return null;
			const parsed = parseJwt(t);
			if (!parsed || typeof parsed !== 'object') return null;
			const candidates = ['sub', 'id', 'userId', 'user_id', 'nameid', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
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

			let body: any = null;
			try { body = await res.clone().json(); } catch { body = await res.clone().text().catch(() => null); }
			const backendMsgRaw = (body && (body.message || body.msg || body.error || (typeof body === 'string' ? body : null))) || null;
			const friendlyMsg = typeof backendMsgRaw === 'string' ? extractUserFacingMessage(backendMsgRaw) : null;

			if (res.ok) {
				await Swal.fire({ title: 'Solicitud enviada', text: friendlyMsg ?? backendMsgRaw ?? 'La solicitud de edición fue enviada correctamente.', icon: 'success', confirmButtonText: 'Aceptar' });
				setExistingEditRequest(null);
				return;
			}

			const defaultError = `Error al solicitar edición (HTTP ${res.status})`;
			const text = friendlyMsg ?? backendMsgRaw ?? defaultError;
			if (typeof text === 'string' && /ya existe una solicitud/i.test(text)) {
				setExistingEditRequest({
					message: friendlyMsg ?? (typeof text === 'string' ? text : defaultError),
					experienceId: id,
					experience: localExp ?? null,
				});
				return;
			}

			await Swal.fire({ title: 'Error', text: text || defaultError, icon: 'error', confirmButtonText: 'Aceptar' });
		} catch (err: any) {
			console.error('requestEdit error', err);
			await Swal.fire({ title: 'Error', text: err?.message || 'Error desconocido al solicitar edición', icon: 'error', confirmButtonText: 'Aceptar' });
		}
	};

	const [viewData, setViewData] = useState<any | null>(null);
	const [showViewModal, setShowViewModal] = useState<boolean>(false);

	const handleDismissExistingEditRequest = () => setExistingEditRequest(null);

	const handleContinueExistingEdit = async () => {
		if (!existingEditRequest) return;
		try {
			if (existingEditRequest.experience) {
				const { normalizeToInitial } = await import('../../features/experience/utils/normalizeExperience');
				const initialData = normalizeToInitial(existingEditRequest.experience);
				setViewData(initialData);
				setShowViewModal(true);
			} else {
				await fetchAndShowDetail(existingEditRequest.experienceId);
			}
		} catch (err) {
			console.error('Error al continuar con la edición existente', err);
			await Swal.fire({ title: 'Error', text: 'No se pudo abrir la experiencia. Intente nuevamente.', icon: 'error', confirmButtonText: 'Aceptar' });
		} finally {
			handleDismissExistingEditRequest();
		}
	};

	// Prevent background/body scroll when modals are open to avoid double scrollbars.
	useEffect(() => {
		const prevBodyOverflow = document.body.style.overflow;
		const prevBodyPosition = document.body.style.position;
		const prevBodyTop = document.body.style.top;
		const prevHtmlOverflow = document.documentElement.style.overflow;
		let scrollY = 0;

		const lock = () => {
			scrollY = window.scrollY || window.pageYOffset || 0;
			document.body.style.position = 'fixed';
			document.body.style.top = `-${scrollY}px`;
			document.body.style.left = '0';
			document.body.style.right = '0';
			document.body.style.overflow = 'hidden';
			document.documentElement.style.overflow = 'hidden';
		};

		const unlock = () => {
			document.body.style.position = prevBodyPosition || '';
			document.body.style.top = prevBodyTop || '';
			document.body.style.left = '';
			document.body.style.right = '';
			document.body.style.overflow = prevBodyOverflow || '';
			document.documentElement.style.overflow = prevHtmlOverflow || '';
			try { window.scrollTo(0, scrollY); } catch {}
		};

		if (showViewModal || showAddModal || existingEditRequest) {
			lock();
		} else {
			unlock();
		}

		return () => {
			unlock();
		};
	}, [showViewModal, showAddModal, existingEditRequest]);

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
			const { normalizeToInitial } = await import('../../features/experience/utils/normalizeExperience');
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
		<>
		<div className="p-8 min-h-[80vh]">
			<Joyride
				steps={tourSteps}
				run={runTour}
				continuous
				showSkipButton
				locale={experiencesTourLocale}
				styles={experiencesTourStyles}
				callback={(data) => {
					if (data.status === 'finished' || data.status === 'skipped') {
						setRunTour(false);
						markTourSeen(tourKey);
					}
				}}
			/>
			<div className="bg-gray-50 rounded-lg p-8 shadow experiences-card">
						 <div className="flex items-start justify-between mb-4 experiences-header">
						 	<div className="flex items-center gap-4">
									 {/* Icono eliminado por solicitud del usuario */}
									 <div>
										 <h1 className="text-2xl font-semibold text-gray-800 mb-2">Gestion de Experiencias significativas</h1>
										 <p className="text-sm text-gray-500">Optimiza la eficiencia de la experiencias</p>
			</div>
			</div>
							 	<div>
							 		{/* Botón flotante para agregar experiencia (tal cual) */}
							 		<button
							 			onClick={() => { if (onAgregar) { onAgregar(); } else { setShowAddModal(true); } }}
							 			title="Agregar experiencia"
							 			className="fixed bottom-[40rem] right-80 z-50 inline-flex items-center justify-center w-14 h-14 rounded-lg! bg-sky-600 text-white shadow-lg hover:bg-sky-700 experiences-add"
							 			aria-label="Agregar experiencia"
							 		>
										 <span className="text-white text-2xl font-bold">+</span>
									 </button>
								 </div>
							 </div>
				{/* Mostrar AddExperience (formulario) en modo lectura para reutilizar diseño */}
				{showViewModal && viewData && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
						<div className="w-[96%] max-w-6xl p-0 flex flex-col h-full">
							<div className="p-4 flex-1">
								<AddExperience
									initialData={viewData}
									readOnly={!isProfessor()}
									disableValidation={true}
									onVolver={() => { setShowViewModal(false); setViewData(null); }}
								/>
							</div>
						</div>
					</div>
				)}

				{/* Search row */}
				<div className="mb-6 flex items-center gap-4">
					<div className="flex-1">
						<div className="relative experiences-search">
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
				</div>

				<div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-4 experiences-table">
					<div className="text-left text-sm text-gray-600 bg-gray-50 rounded-t-md px-4 py-3 font-semibold">
						<div className={`grid ${showEvaluationColumn ? 'grid-cols-7' : 'grid-cols-6'} gap-4 items-center`}>
							<div className="text-center font-semibold">Nombre de la experiencia</div>
							<div className="text-center font-semibold">Área aplicada</div>
							<div className="text-center font-semibold">Tiempo</div>
							<div className="text-center font-semibold">PDF</div>
							{showEvaluationColumn && <div className="text-center font-semibold experiences-evaluation">Aplicar Evaluación</div>}
							<div className="text-center font-semibold">Edición</div>
							<div className="text-center font-semibold experiences-status">Estado</div>
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
												<div className={`grid ${showEvaluationColumn ? 'grid-cols-7' : 'grid-cols-6'} gap-4 items-center`}>
													{/* Nombre de la experiencia */}
													<div className="flex items-center gap-3 text-center">
														<button onClick={() => openModal(exp.id)} className="text-sm font-medium text-gray-800 hover:underline">
															{(exp as any).nameExperiences ?? (exp as any).name ?? 'Sin título'}
														</button>
													</div>
													{/* Área aplicada */}
													<div className="text-center text-sm text-gray-600">{(exp as any).areaApplied ?? (exp as any).thematicLocation ?? (exp as any).code ?? '-'}</div>
													{/* Tiempo */}
													<div className="text-center text-sm text-gray-600">
														{formatDevelopmentTime((exp as any).developmenttime)}
													</div>
													{/* PDF */}
													<div className="flex items-center justify-center">
														{(() => {
															const raw = evaluationPdfMap[exp.id] ?? getPdfUrlFromExp(exp as any);
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
																		className="px-4 py-2 bg-red-600 text-white rounded-md! font-medium hover:bg-red-700 experiences-pdf"
																	>
																		Ver PDF
																	</button>
																);
															}
															return (
																<div className="px-3 py-2 rounded-md! bg-gray-100 text-gray-400 text-sm experiences-pdf" title="Sin PDF">Sin PDF</div>
															);
														})()}
													</div>
													{/* Aplicar Evaluación: oculto para profesores */}
													{showEvaluationColumn && (
														<div className="text-center experiences-evaluation">
															<button
																className="px-4 py-2 bg-blue-600 text-white rounded-md! font-medium hover:bg-blue-700"
																title="Evaluación"
																onClick={() => {
																	setEvalExpId(exp.id);
																	setShowEvalModal(true);
																}}
															>
																Evaluación
															</button>
														</div>
													)}
																{/* Modal de Evaluación (fuera del map) */}
																{showEvalModal && evalExpId && (
																	<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
																		<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto relative">
																			<button
																				className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
																				onClick={() => { setShowEvalModal(false); setEvalExpId(null); }}
																				aria-label="Cerrar"
																			>
																				
																			</button>
																			<div className="p-6">
																				<Evaluation experienceId={evalExpId} onClose={() => { setShowEvalModal(false); setEvalExpId(null); }} />
																			</div>
																		</div>
																	</div>
																)}
													{/* Edición */}
													<div className="text-center experiences-edit">
														<button
															className="text-gray-500 hover:text-gray-700"
															title="Ver / Editar"
															onClick={async (e) => {
																e.stopPropagation();
																e.preventDefault();
																// Role-aware behavior: professors request edit, others open detail view
																try {
																	if (isProfessor && typeof isProfessor === 'function' && isProfessor()) {
																		// pass the full experience object so we can open modal without refetching
																		await requestEdit(exp as any);
																	} else {
																		await fetchAndShowDetail(exp.id as number);
																	}
																} catch (err) {
																	console.error('Error handling pencil click', err);
																}
															}}
														>
															<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 inline" viewBox="0 0 20 20" fill="currentColor">
																<path d="M17.414 2.586a2 2 0 010 2.828L8.828 14l-3.536.707.707-3.536L14.586 2.586a2 2 0 012.828 0z" />
															</svg>
														</button>
													</div>
													{/* Estado */}
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

		{existingEditRequest && (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4 py-10">
				<div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
					<div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-sky-500 via-sky-400 to-sky-600" />
					<button
						type="button"
						onClick={handleDismissExistingEditRequest}
						className="absolute right-5 top-5 text-gray-400 transition hover:text-gray-600"
						aria-label="Cerrar"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
							<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
						</svg>
					</button>
					<div className="flex flex-col items-center gap-2 px-8 pb-8 pt-10 text-center sm:px-14">
						<div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-600 shadow-inner">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-8 w-8">
								<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.4" />
								<path d="M8.75 9.75h6.5M8.75 13.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
							</svg>
						</div>
						<h2 className="text-2xl font-semibold text-gray-800">Solicitud ya registrada</h2>
						<p className="max-w-xl text-base leading-relaxed text-gray-600">
							{existingEditRequest.message || 'Ya existe una solicitud de edición aprobada para esta experiencia.'}
						</p>
						<div className="mt-7 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
							<button
								type="button"
								onClick={handleDismissExistingEditRequest}
								className="w-full rounded-xl! border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:w-40"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={() => { void handleContinueExistingEdit(); }}
								className="w-full rounded-xl! bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-700 sm:w-44"
							>
								Continuar con la edición
							</button>
						</div>
					</div>
				</div>
			</div>
		)}
		</>
	);
};

export default Experiences;
