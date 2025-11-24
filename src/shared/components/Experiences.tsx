import React, { useEffect, useState } from 'react';
import Evaluation from '../../features/evaluation/components/Evaluation';
import Swal from 'sweetalert2';
import type { Experience } from '../../features/experience/types/experienceTypes';
import AddExperience from '../../features/experience/components/AddExperience';

type ExperiencesProps = {
	onAgregar?: () => void;
};

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
	// State for the evaluation modal and currently selected evaluation experience id
	const [showEvalModal, setShowEvalModal] = useState<boolean>(false);
	const [evalExpId, setEvalExpId] = useState<number | null>(null);

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

  const handleClose = () => {
    setShowModal(false);
    setSelectedExperienceId(null);
  };

  const handleCloseEvaluation = () => {
    setShowEvaluation(false);
    setShowEvaluationFromIcon(false);
  };

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
    const endpoint = `${API_BASE}/api/Experience/List`;
    const token = localStorage.getItem("token");

    const fetchExperiencias = async () => {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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

				<div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
					<div className="text-left text-sm text-gray-600 bg-gray-50 rounded-t-md px-4 py-3 font-semibold">
						<div className="grid grid-cols-7 gap-4 items-center">
							<div className="text-center font-semibold">Nombre de la experiencia</div>
							<div className="text-center font-semibold">Área aplicada</div>
							<div className="text-center font-semibold">Tiempo</div>
							<div className="text-center font-semibold">PDF</div>
							<div className="text-center font-semibold">Aplicar Evaluación</div>
							<div className="text-center font-semibold">Edición</div>
							<div className="text-center font-semibold">Estado</div>
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
												<div className="grid grid-cols-7 gap-4 items-center">
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
																		className="px-4 py-2 bg-red-600 text-white rounded-md! font-medium hover:bg-red-700"
																	>
																		Ver PDF
																	</button>
																);
															}
															return (
																<div className="px-3 py-2 rounded-md! bg-gray-100 text-gray-400 text-sm" title="Sin PDF">Sin PDF</div>
															);
														})()}
													</div>
													{/* Aplicar Evaluación */}
													<div className="text-center">
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
																{/* Modal de Evaluación (fuera del map) */}
																{showEvalModal && evalExpId && (
																	<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
																		<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto relative">
																			<button
																				className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
																				onClick={() => { setShowEvalModal(false); setEvalExpId(null); }}
																				aria-label="Cerrar"
																			>
																				×
																			</button>
																			<div className="p-6">
																				<Evaluation experienceId={evalExpId} onClose={() => { setShowEvalModal(false); setEvalExpId(null); }} />
																			</div>
																		</div>
																	</div>
																)}
													{/* Edición */}
													<div className="text-center">
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
	);
};

export default Experiences;
