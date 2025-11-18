import "bootstrap/dist/css/bootstrap.min.css";
import  { useEffect, useState, useRef } from "react";
import ExperienceModal from "../../features/experience/components/ExperienceModal";
import Evaluation from "../../features/evaluation/components/Evaluation";
import configApi from "../../Api/Config/Config";
import type { Experience } from "../../features/experience/types/experienceTypes";
import type { FollowUp } from "../types/FollowUp";

interface ExperiencesProps {
  onAgregar: () => void;
}

const Experiences = ({ onAgregar }: ExperiencesProps) => {
  const [showModal, setShowModal] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showEvaluationFromIcon, setShowEvaluationFromIcon] = useState(false); // Estado para mostrar el modal de Evaluation desde el icono
  const [experienceList, setExperienceList] = useState<Experience[]>([]); // Lista de experiencias
  const [trackingData, setTrackingData] = useState<FollowUp | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const role = localStorage.getItem("role");

  // obtener nombre y rol para la tarjeta de perfil
  const userName = (localStorage.getItem('userName') || localStorage.getItem('name') || 'Usuario') as string;
  const userRole = (localStorage.getItem('role') || 'Usuario') as string;

  // id del usuario actual (para diagnósticos)
  const currentUserId = Number(localStorage.getItem('userId')) || 0;

  const getInitials = (name: string) => (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  // Delete PDF URL from an experience (clear documents[0].urlPdf) and update local state
  const handleDeletePdf = async (expId: number) => {
    const confirmed = window.confirm('¿Quieres eliminar el archivo PDF de esta experiencia? Esta acción no se puede deshacer.');
    if (!confirmed) return;
    try {
      // fetch detail
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_BASE_URL ?? '';
      const detailUrl = base ? `${base}/api/Experience/${expId}/detail` : `/api/Experience/${expId}/detail`;
      const resp = await fetch(detailUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok) throw new Error('No se pudo obtener detalle de la experiencia');
      const data = await resp.json();

      const updated = { ...data, documents: Array.isArray(data.documents) ? data.documents.slice() : [] } as any;
      if (updated.documents && updated.documents.length > 0) {
        // remove urlPdf from first document
        updated.documents[0] = { ...(updated.documents[0] || {}), urlPdf: '' };
      }

      // PATCH to save
      const patchUrl = base ? `${base}/api/Experience/patch` : '/api/Experience/patch';
      const patchResp = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updated),
      });
      if (!patchResp.ok) throw new Error('Error al actualizar la experiencia');

      // update local list
      setExperienceList(prev => prev.map(e => e.id === expId ? { ...e, documents: [{ ...(e.documents?.[0] || {}), urlPdf: '' }] } : e));
    } catch (err) {
      console.error('Error eliminando PDF:', err);
      alert('No se pudo eliminar el PDF. Revisa la consola para más detalles.');
    }
  };

  // removed 'nuevas' list (UI moved to floating button)
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [selectedModalMode, setSelectedModalMode] = useState<'view' | 'edit'>('edit');
  // Estado para las pestañas (mover arriba para evitar cambios en el orden de hooks)
  const [selectedTab, setSelectedTab] = useState<'admin' | 'profesor' | 'todas'>('admin');

  // scroll container ref for horizontal navigation (must be a top-level hook)
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollBy = (delta: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handleVisitarClick = (id: number) => {
    // Al hacer click en la tarjeta principal abrimos el modal de Evaluación
    setSelectedExperienceId(id);
    setShowEvaluationFromIcon(true);
  };

  const handleIconClick = (id: number) => {
    // El icono izquierdo ahora abre el modal de la experiencia (ver/editar)
    setSelectedExperienceId(id);
    setSelectedModalMode('edit');
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

    return list.map((exp, i) => {
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

        <div className="relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={() => scrollBy(-300)}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center"
              aria-label="Desplazar izquierda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 16.293a1 1 0 010-1.414L15.586 11H4a1 1 0 110-2h11.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto" ref={scrollRef}>
            <div className="flex gap-6 py-4 flex-nowrap">
              {renderTiles(
                selectedTab === 'profesor'
                  ? experienceList.filter((e) => e.userId === currentUserId)
                  : selectedTab === 'admin'
                  ? experienceList.filter((e) => e.userId !== currentUserId)
                  : experienceList
              )}
            </div>
          </div>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={() => scrollBy(300)}
              className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center"
              aria-label="Desplazar derecha"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 3.707a1 1 0 010 1.414L4.414 9H16a1 1 0 110 2H4.414l3.293 3.293a1 1 0 11-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
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
              setExperienceList(prev => prev.map(e => e.id === id ? { ...e, documents: [{ name: e.documents?.[0]?.name ?? '', urlPdf: url, urlLink: e.documents?.[0]?.urlLink ?? '', urlPdfExperience: e.documents?.[0]?.urlPdfExperience ?? '' }] } : e));
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
              setExperienceList(prev => prev.map(e => e.id === id ? { ...e, documents: [{ name: e.documents?.[0]?.name ?? '', urlPdf: url, urlLink: e.documents?.[0]?.urlLink ?? '', urlPdfExperience: e.documents?.[0]?.urlPdfExperience ?? '' }] } : e));
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Experiences;
