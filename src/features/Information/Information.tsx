import React, { useEffect, useState, useMemo } from 'react';
import Joyride from 'react-joyride';
import { FiShield, FiSearch, FiChevronLeft, FiChevronRight, FiFilter, FiDownload } from 'react-icons/fi';
import { Evaluation as EvaluationBase } from '../evaluation/types/evaluation';
import { informationTourSteps, informationTourLocale, informationTourStyles } from '../onboarding/informationTour';
import { ArrowPathIcon, CheckCircleIcon, MinusCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline'; // Iconos modernos

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

// =========================================================================
// Componente de Fila/Card de Evaluación (Responsiveness aquí)
// =========================================================================

type NormalizedRow = Evaluation & { experienceName: string, evaluationId?: number | string };

const EvaluationRow: React.FC<{ ev: NormalizedRow, idx: number }> = ({ ev, idx }) => {
    // Helper para determinar el estado visual
    const renderStateBadge = (rawState: any) => {
        const stateStr = String(rawState ?? '').toLowerCase();
        
        let color = 'bg-yellow-100 text-yellow-700';
        let label = stateStr || 'Pendiente';

        if (stateStr === 'true' || stateStr === '1' || stateStr === 'activo') {
            color = 'bg-emerald-100 text-emerald-700';
            label = 'Activo';
        } else if (stateStr === 'false' || stateStr === '0' || stateStr === 'inactivo') {
            color = 'bg-rose-100 text-rose-700';
            label = 'Inactivo';
        }

        return <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${color}`}>{label}</span>;
    };

    return (
        // Responsive row/card: stacked on mobile, grid on desktop
        <div key={ev.id ?? ev.evaluationId ?? idx}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 items-center py-4 px-2 sm:px-4 border-b border-gray-100 transition hover:bg-sky-50/50 text-xs sm:text-sm">
            {/* Columna 1: Nombre de experiencia */}
            <div className="font-semibold text-gray-800 truncate col-span-1 md:text-left">
                <span className="md:hidden text-xs font-medium text-gray-500 block mb-1">Experiencia:</span>
                {ev.experienceName || '-'}
            </div>
            {/* Columna 2: Rol de acompañamiento */}
            <div className="text-gray-700 col-span-1 md:text-left">
                <span className="md:hidden text-xs font-medium text-gray-500 block mb-1">Rol de Acompañamiento:</span>
                {ev.accompanimentRole ?? '-'}
            </div>
            {/* Columna 3: Tipo de Evaluación */}
            <div className="text-gray-700 col-span-1 md:text-left">
                <span className="md:hidden text-xs font-medium text-gray-500 block mb-1">Tipo:</span>
                <span className="font-medium text-sky-700">{ev.typeEvaluation ?? '-'}</span>
            </div>
            {/* Columna 4: PDF */}
            <div className="text-center col-span-1 md:text-center">
                <span className="md:hidden text-xs font-medium text-gray-500 block mb-1">Documento:</span>
                {ev.urlEvaPdf ? (
                    <a
                        href={ev.urlEvaPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-red-600 text-white px-3 sm:px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm shadow-md hover:bg-red-700 transition-all min-w-[80px] sm:min-w-[100px]"
                        title="Ver Documento de Evaluación"
                    >
                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                        PDF
                    </a>
                ) : (
                    <span className="inline-block text-gray-400 font-semibold text-xs sm:text-sm" style={{ minWidth: 80 }}>Sin Documento</span>
                )}
            </div>
            {/* Columna 5: Estado */}
            <div className="text-center col-span-1 md:text-center">
                <span className="md:hidden text-xs font-medium text-gray-500 block mb-1">Estado (Toggle):</span>
                {renderStateBadge(ev.stateId)}
            </div>
        </div>
    );
};

// =========================================================================
// Componente Principal: Information
// =========================================================================

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
    const [active, setActive] = useState<'inicial'|'final'|'sin'|'all'>('inicial');
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [runTour, setRunTour] = useState(false);
    const tourKey = 'informationTourDone';


    // Nuevo: función para filtrar y consumir endpoint según la tarjeta (sin getAll)
    const fetchFilteredEvaluations = async (type: 'inicial'|'final'|'sin'|'all') => {
        if (type !== 'all') {
            setActive(type);
        }
        setPage(1);
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
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
            const data = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
            setEvaluations(data); // Actualiza la lista principal
        } catch (e: any) {
            setError(e.message || 'Error al filtrar');
            setEvaluations([]);
        } finally {
            setLoading(false);
        }
    };

    // Elimina getAll: por defecto carga inicial
    useEffect(() => {
        fetchFilteredEvaluations('inicial');
    }, []);

    useEffect(() => {
        if (!loading && !runTour && !localStorage.getItem(tourKey)) {
            const timer = window.setTimeout(() => setRunTour(true), 600);
            return () => window.clearTimeout(timer);
        }
    }, [loading, runTour, tourKey]);

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

    // Aplica la búsqueda al cambiar la lista principal o el término
    useEffect(() => {
        if (!search) {
            setFiltered(evaluations);
            setPage(1);
            return;
        }
        setFiltered(
            evaluations.filter(ev => {
                const expName = ev.experienceName
                    || (ev.experience && typeof ev.experience === 'object' && 'name' in ev.experience ? (ev.experience as { name?: string }).name : undefined)
                    || '';
                return expName.toLowerCase().includes(search.toLowerCase());
            })
        );
        setPage(1);
    }, [search, evaluations]);


    // Normaliza y Pagina
    const normalizedRows = useMemo(() => {
        return filtered.flatMap((item: any) => {
            if (Array.isArray(item.evaluations) && item.evaluations.length > 0) {
                return item.evaluations.map((ev: any) => ({
                    ...ev,
                    experienceName: item.name || item.nameExperiences || item.experienceName || '-',
                }));
            }
            return [{
                ...item,
                experienceName: item.name || item.nameExperiences || item.experienceName || '-',
            }];
        });
    }, [filtered]);

    const totalItems = normalizedRows.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paginated = normalizedRows.slice((page-1)*pageSize, page*pageSize);

    // =========================================================================
    // Componente de Tarjeta Resumen (Mejorado)
    // =========================================================================

    function SummaryCard({ title, count, active, onClick }: { title: string, count: number, active: boolean, onClick: () => void }) {
        return (
            <div
                className={`flex-1 cursor-pointer rounded-xl border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-md transition-all duration-300 transform hover:scale-[1.02]
                    ${active ? 'bg-sky-50 border-sky-600 shadow-xl' : 'bg-white border-gray-200 hover:shadow-lg'}
                `}
                onClick={onClick}
                style={{ minWidth: '100px', maxWidth: '100%' }}
            >
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${active ? 'bg-sky-600' : 'bg-sky-50'} shadow-sm`}>
                        <ArrowPathIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${active ? 'text-white' : 'text-sky-600'}`} />
                    </div>
                    <div>
                        <div className="font-bold text-base sm:text-lg text-gray-800 leading-tight">{title}</div>
                        <div className="text-xs sm:text-sm text-gray-500 leading-tight">Total: {count}</div>
                    </div>
                </div>
                <div className="flex items-center">
                    <span className={`inline-block w-8 h-8 sm:w-10 sm:h-10 rounded-full font-extrabold text-center leading-8 sm:leading-10 text-lg sm:text-xl shadow-lg border-2 ${active ? 'bg-white text-sky-700 border-sky-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>{count}</span>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-2 sm:p-4 md:p-8 min-h-[70vh] bg-gray-50 information-layout">
            <Joyride
                steps={informationTourSteps}
                run={runTour}
                continuous
                showSkipButton
                locale={informationTourLocale}
                styles={informationTourStyles}
                callback={(data) => {
                    if (data.status === 'finished' || data.status === 'skipped') {
                        setRunTour(false);
                        localStorage.setItem(tourKey, 'true');
                    }
                }}
            />
            <div className="max-w-6xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-4 md:p-8 shadow-2xl">
                
                {/* Encabezado */}
                <div className="mb-6 sm:mb-8 information-header">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">Gestión de Evaluaciones</h1>
                    <p className="text-xs sm:text-base text-gray-500">Revisa y optimiza los permisos de evaluación de las experiencias.</p>
                </div>
                
                {/* Tarjetas Resumen (Responsive) */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8 information-summary-cards">
                    <SummaryCard
                        title="Inicial "
                        count={initialCount}
                        active={active === 'inicial'}
                        onClick={() => fetchFilteredEvaluations('inicial')}
                    />
                    <SummaryCard
                        title="Final "
                        count={finalCount}
                        active={active === 'final'}
                        onClick={() => fetchFilteredEvaluations('final')}
                    />
                    <SummaryCard
                        title="Sin Evaluación"
                        count={sinCount}
                        active={active === 'sin'}
                        onClick={() => fetchFilteredEvaluations('sin')}
                    />
                </div>
                
                {/* Barra de búsqueda y filtro (Responsive) */}
                <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-4 mb-6 sm:mb-8 information-search-bar">
                    <div className="relative flex-1 w-full">
                        <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                            className="w-full pl-8 sm:pl-11 pr-2 sm:pr-4 py-2 sm:py-3 rounded-full border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm text-xs sm:text-sm"
                            placeholder="Buscar por nombre de experiencia..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                
                {/* Tabla/Cards */}
                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-lg overflow-x-auto information-table">
                    {/* Encabezado de la Tabla (Solo visible en Desktop) */}
                    <div className="hidden md:grid grid-cols-5 gap-4 md:gap-6 items-center bg-gray-100 px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs uppercase text-gray-600">
                        <div className="text-left">Nombre de experiencia</div>
                        <div className="text-left">Rol de acompañamiento</div>
                        <div className="text-left">Tipo de Evaluación</div>
                        <div className="text-center">Documento PDF</div>
                        <div className="text-center">Estado </div>
                    </div>
                    {/* Cuerpo de la Tabla/Cards */}
                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-6 sm:p-10 text-center text-gray-500">Cargando evaluaciones...</div>
                        ) : error ? (
                            <div className="p-6 sm:p-10 text-center text-red-600"> {error}</div>
                        ) : paginated.length === 0 ? (
                            <div className="p-6 sm:p-10 text-center text-gray-500">No hay evaluaciones disponibles para este filtro o búsqueda.</div>
                        ) : (
                            paginated.map((ev, idx) => (
                                <EvaluationRow ev={ev} idx={idx} key={ev.id ?? ev.evaluationId ?? idx} />
                            ))
                        )}
                    </div>
                </div>
                
                {/* Paginación */}
                {totalItems > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 px-1 sm:px-2 text-xs sm:text-sm text-gray-600 information-pagination gap-2">
                        <div className="mb-2 sm:mb-0">Mostrando {paginated.length} de {totalItems} evaluaciones</div>
                        <div className="flex items-center gap-1">
                            <button
                                className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-full font-medium transition ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <FiChevronLeft className="mr-1" /> Anterior
                            </button>
                            <span className="px-2 sm:px-3 py-1 sm:py-2 rounded-full bg-sky-600 text-white font-bold text-xs sm:text-sm">
                                {page} de {totalPages}
                            </span>
                            <button
                                className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-full font-medium transition ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Siguiente <FiChevronRight className="ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Information;