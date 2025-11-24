import { useEffect, useState } from 'react';
import { FiShield, FiSearch, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import { Evaluation as EvaluationBase } from '../evaluation/types/evaluation';

// Extiende el tipo para aceptar los campos que llegan del backend
type Evaluation = EvaluationBase & {
	id?: number;
	experience?: { name?: string } | null;
};

// Tipo para experiencia
type Experience = {
  id: number;
  name: string;
};

const Information = () => {
	const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
	const [filtered, setFiltered] = useState<Evaluation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const pageSize = 6;
	const [initialCount, setInitialCount] = useState(0);
	const [finalCount, setFinalCount] = useState(0);
	const [sinCount, setSinCount] = useState(0);
	const [active, setActive] = useState<'inicial'|'final'|'sin'|'all'>('all');
	const [experiences, setExperiences] = useState<Experience[]>([]);

	// Nuevo: función para filtrar y consumir endpoint según la tarjeta
	const fetchFilteredEvaluations = async (type: 'inicial'|'final'|'sin'|'all') => {
		setActive(type);
		setPage(1);
		setLoading(true);
		setError(null);
		try {
			const token = localStorage.getItem('token');
			const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
			if (type === 'all') {
				// Mostrar todas las evaluaciones
				setFiltered(evaluations);
			} else {
				let url = '';
				if (type === 'inicial') url = '/api/Evaluation/filter/inicial';
				else if (type === 'final') url = '/api/Evaluation/filter/final';
				else url = '/api/Evaluation/filter/sin-evaluacion';
				const res = await fetch(`${API_BASE}${url}`, {
					headers: {
						'Content-Type': 'application/json',
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
				});
				if (!res.ok) throw new Error('Error al filtrar');
				const response = await res.json();
				// Si la respuesta viene en .data, úsala, si no, usa el array directo
				const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
				setFiltered(data);
			}
		} catch (e: any) {
			setError(e.message || 'Error al filtrar');
			setFiltered([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const fetchAll = async () => {
			setLoading(true);
			setError(null);
			try {
				const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
				const endpoint = `${API_BASE}/api/Evaluation/getAll`;
				const token = localStorage.getItem('token');
				const res = await fetch(endpoint, {
					headers: {
						'Content-Type': 'application/json',
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
				});
				if (!res.ok) throw new Error('No se pudo obtener las evaluaciones');
				const response = await res.json();
				const data = Array.isArray(response.data) ? response.data : [];
				setEvaluations(data);
				setFiltered(data);

				// Segunda llamada para traer experiencias
				const expRes = await fetch(`${API_BASE}/api/Experience/getAll`, {
					headers: {
						'Content-Type': 'application/json',
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
				});
				if (expRes.ok) {
					const expData = await expRes.json();
					if (Array.isArray(expData.data)) {
						setExperiences(expData.data.map((e: any) => ({ id: e.id, name: e.name })));
					}
				}
			} catch (e: any) {
				setError(e.message || 'Error al obtener las evaluaciones');
				setEvaluations([]);
				setFiltered([]);
			} finally {
				setLoading(false);
			}
		};
		fetchAll();
	}, []);

	useEffect(() => {
		const fetchCounts = async () => {
			try {
				const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
				const token = localStorage.getItem('token');
				const get = async (url: string) => {
					const res = await fetch(`${API_BASE}${url}`, {
						headers: {
							'Content-Type': 'application/json',
							...(token ? { Authorization: `Bearer ${token}` } : {}),
						},
					});
					if (!res.ok) return 0;
					const d = await res.json();
					if (Array.isArray(d)) return d.length;
					if (typeof d === 'number') return d;
					if (typeof d === 'object' && typeof d.count === 'number') return d.count;
					return 0;
				};
				setInitialCount(await get('/api/Evaluation/filter/inicial'));
				setFinalCount(await get('/api/Evaluation/filter/final'));
				setSinCount(await get('/api/Evaluation/filter/sin-evaluacion'));
			} catch {}
		};
		fetchCounts();
	}, []);

// handleCard ya no es necesario, usamos fetchFilteredEvaluations

	useEffect(() => {
		if (!search) {
			setFiltered(evaluations);
			setPage(1);
			return;
		}
		setFiltered(
			evaluations.filter(ev => {
				// Busca el nombre de la experiencia por el id
				const expName = experiences.find(e => e.id === ev.experienceId)?.name
					|| ev.experienceName
					|| (ev.experience && typeof ev.experience === 'object' && 'name' in ev.experience ? (ev.experience as { name?: string }).name : undefined)
					|| '';
				return expName.toLowerCase().includes(search.toLowerCase());
			})
		);
		setPage(1);
	}, [search, evaluations, experiences]);

	const totalPages = Math.ceil(filtered.length / pageSize) || 1;
	const paginated = filtered.slice((page-1)*pageSize, page*pageSize);

	return (
		<div className="p-6 min-h-[70vh] bg-[#f6f8fb]">
			<div className="max-w-6xl mx-auto bg-white rounded-2xl p-8 shadow">
				<div className="mb-2">
					<h1 className="text-3xl font-bold text-gray-800 mb-1">Gestión de evaluación</h1>
					<p className="text-gray-500 mb-6">Optimiza la eficiencia de la evaluación</p>
				</div>
				
				<div className="flex gap-4 mb-6">
					<SummaryCard
						title="Evaluación inicial"
						count={initialCount}
						active={active === 'inicial'}
						onClick={() => fetchFilteredEvaluations('inicial')}
					/>
					<SummaryCard
						title="Evaluación final"
						count={finalCount}
						active={active === 'final'}
						onClick={() => fetchFilteredEvaluations('final')}
					/>
					<SummaryCard
						title="Sin evaluar"
						count={sinCount}
						active={active === 'sin'}
						onClick={() => fetchFilteredEvaluations('sin')}
					/>
					{/* Botón para limpiar filtro y mostrar todas */}
					{active !== 'all' && (
						<button
							className="ml-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sky-600 hover:bg-sky-50"
							onClick={() => fetchFilteredEvaluations('all')}
						>
							Mostrar todas
						</button>
					)}
				</div>
				{/* Barra de búsqueda y filtro */}
				<div className="flex items-center mb-4">
					<div className="relative flex-1">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-[#f6f8fb] focus:outline-none focus:ring-2 focus:ring-sky-200"
							placeholder="Buscar por nombre de experiencia..."
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
					</div>
				</div>
				{/* Grid de tarjetas de experiencias */}
				{loading ? (
					<div className="py-10 text-center text-gray-400">Cargando evaluaciones...</div>
				) : error ? (
					<div className="py-10 text-center text-red-500">{error}</div>
				) : paginated.length === 0 ? (
					<div className="py-10 text-center text-gray-400">No hay evaluaciones</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-4">
						{paginated.map((ev, idx) => {
							const expName =
								experiences.find(e => e.id === ev.experienceId)?.name
								|| ev.experienceName
								|| (ev.experience && typeof ev.experience === 'object' && 'name' in ev.experience ? (ev.experience as { name?: string }).name : undefined)
								|| '-';

							return (
								<div key={ev.id ?? ev.evaluationId ?? idx} className="bg-white rounded-2xl shadow-lg flex flex-col items-center p-6 border border-gray-200 hover:shadow-xl transition-all">
									{/* Imagen de la experiencia (placeholder) */}
									<div className="w-32 h-32 rounded-xl bg-gradient-to-tr from-sky-100 to-sky-200 flex items-center justify-center mb-4 overflow-hidden">
										{/* Aquí puedes poner una imagen real si tienes la URL, por ahora placeholder SVG */}
										<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
											<rect width="64" height="64" rx="16" fill="#e0e7ef"/>
											<path d="M32 18C25.3726 18 20 23.3726 20 30C20 36.6274 25.3726 42 32 42C38.6274 42 44 36.6274 44 30C44 23.3726 38.6274 18 32 18ZM32 40C26.4772 40 22 35.5228 22 30C22 24.4772 26.4772 20 32 20C37.5228 20 42 24.4772 42 30C42 35.5228 37.5228 40 32 40Z" fill="#a5b4fc"/>
										</svg>
									</div>
									{/* Nombre de la experiencia debajo de la imagen */}
									<div className="text-lg font-semibold text-gray-800 text-center mb-2 truncate w-full" title={expName}>{expName}</div>

									{/* Info adicional, botones, etc. */}
									<div className="flex flex-col items-center gap-2 w-full">
										<div className="text-sm text-gray-500">{ev.accompanimentRole ?? '-'}</div>
										<div className="text-xs text-gray-400 mb-2">{ev.typeEvaluation ?? '-'}</div>
										{ev.urlEvaPdf ? (
											<a
												href={ev.urlEvaPdf}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-block bg-red-600 text-white px-4 py-1 rounded font-semibold shadow hover:bg-red-700 transition-all text-sm"
												style={{ minWidth: 80 }}
											>
												Ver PDF
											</a>
										) : (
											<span className="inline-block text-gray-400 font-semibold text-sm" style={{ minWidth: 80 }}>Sin PDF</span>
										)}
										{/* Estado */}
										{(() => {
											const rawState = ev.stateId ?? (ev as any).State ?? (ev as any).state;
											const stateStr = String(rawState).toLowerCase();
											if (stateStr === 'true' || stateStr === '1') {
												return <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">Activo</span>;
											}
											if (stateStr === 'false' || stateStr === '0') {
												return <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Inactivo</span>;
											}
											return <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">{stateStr || '-'}</span>;
										})()}
									</div>
								</div>
							);
						})}
					</div>
				)
				}
				{/* Paginación */}
				<div className="flex items-center justify-between mt-4 text-sm text-gray-500">
					<div>Mostrando {paginated.length} evaluaciones</div>
					<div className="flex items-center gap-1">
						<button
							className={`px-2 py-1 rounded ${page === 1 ? 'text-gray-300' : 'hover:bg-gray-200'}`}
							onClick={() => setPage(p => Math.max(1, p-1))}
							disabled={page === 1}
						>
							<FiChevronLeft /> Anterior
						</button>
						{Array.from({length: totalPages}, (_, i) => (
							<button
								key={i}
								className={`px-2 py-1 rounded ${page === i+1 ? 'bg-sky-100 text-sky-700 font-bold' : 'hover:bg-gray-200'}`}
								onClick={() => setPage(i+1)}
							>{i+1}</button>
						))}
						<button
							className={`px-2 py-1 rounded ${page === totalPages ? 'text-gray-300' : 'hover:bg-gray-200'}`}
							onClick={() => setPage(p => Math.min(totalPages, p+1))}
							disabled={page === totalPages}
						>
							Siguiente <FiChevronRight />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function SummaryCard({ title, count, active, onClick }: { title: string, count: number, active: boolean, onClick: () => void }) {
	return (
		<div
			className={`flex-1 cursor-pointer rounded-2xl border bg-white px-8 py-5 flex items-center justify-between shadow transition-all ${active ? 'border-sky-500 shadow-lg' : 'border-gray-200'}`}
			onClick={onClick}
			style={{ minWidth: 260, maxWidth: 340 }}
		>
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-50">
					<FiShield className="text-sky-400 text-2xl" />
				</div>
				<div>
					<div className="font-semibold text-gray-800 text-base leading-tight">{title}</div>
					<div className="text-xs text-gray-400 leading-tight">1 de 3 permisos activos</div>
				</div>
			</div>
			<div className="flex items-center">
				<span className="inline-block w-8 h-8 rounded-full bg-[#e6edfa] text-[#3b4b6b] font-bold text-center leading-8 text-base shadow border border-[#dbeafe]">{count}</span>
			</div>
		</div>
	);
}

export default Information;
