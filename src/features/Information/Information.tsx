import React, { useEffect, useState } from 'react';
import type { Experience } from '../../features/experience/types/experienceTypes';
import ExperienceModal from '../experience/components/ExperienceModal';

const Information: React.FC = () => {
  const [list, setList] = useState<Experience[]>([]);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const renderBadge = (role?: string) => (
    <span className="inline-block px-3 py-1 text-xs font-medium bg-white rounded-full border text-gray-700">
      {role ?? 'Profesor'}
    </span>
  );

  const CheckIcon = ({ ok }: { ok: boolean }) => (
    <div className={`w-5 h-5 ${ok ? 'text-green-500' : 'text-red-500'} flex items-center justify-center`}>
      {ok ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-10.464a1 1 0 10-1.414-1.414L10 8.586 7.879 6.464a1 1 0 10-1.414 1.414L8.586 10l-2.121 2.121a1 1 0 101.414 1.414L10 11.414l2.121 2.121a1 1 0 101.414-1.414L11.414 10l2.122-2.464z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );

  const openPdf = (url?: string) => {
    if (!url) return;
    try {
      window.open(url, '_blank');
    } catch (err) {
      console.error('No se pudo abrir PDF', err);
    }
  };

  const openModal = (id?: number) => {
    if (!id) return;
    setSelectedExperienceId(id);
    setShowModal(true);
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
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Gestion de Experiencias significativas</h1>
        <p className="text-sm text-gray-500 mb-6">Optimiza la eficiencia de la experiencias</p>

        <div className="overflow-hidden rounded-lg border">
          <div className="bg-indigo-600 text-white text-sm font-semibold px-6 py-3">
            <div className="grid grid-cols-6 gap-4 items-center">
              <div>Nombre de la experiencia</div>
              <div>Area aplicada</div>
              <div>Tiempo de desarrollo</div>
              <div>PDF</div>
              <div>Edicion</div>
              <div>Estado</div>
            </div>
          </div>

          <div className="bg-white">
            {loading ? (
              <div className="p-6 text-gray-500">Cargando...</div>
            ) : error ? (
              <div className="p-6 text-red-500">{error}</div>
            ) : (
              <div className="divide-y">
                {list.map((exp, idx) => (
                  <div className="px-6 py-4" key={exp.id ?? idx}>
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="flex items-center gap-3">
                        {renderBadge((exp as any).userRole ?? (exp as any).roleName)}
                        <button onClick={() => openModal(exp.id)} className="text-left text-sm font-medium text-gray-800 hover:underline">
                          {(exp as any).nameExperiences ?? (exp as any).name ?? 'Sin título'}
                        </button>
                      </div>

                      <div className="text-sm text-gray-600">{(exp as any).areaApplied ?? (exp as any).thematicLocation ?? (exp as any).code ?? '-'}</div>

                      <div className="text-center">
                        <CheckIcon ok={Boolean((exp as any).developmenttime)} />
                      </div>

                      <div className="text-center">
                        {exp.documents && exp.documents.length > 0 && exp.documents[0].urlPdf ? (
                          <button onClick={(e) => { e.stopPropagation(); openPdf(exp.documents![0].urlPdf); }} title="Abrir PDF" className="text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 inline" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V8h4.5L13 3.5z" />
                            </svg>
                          </button>
                        ) : (
                          <CheckIcon ok={false} />
                        )}
                      </div>

                      <div className="text-center">
                        {/* Edicion: show edit icon if editable */}
                        <button className="text-gray-500 hover:text-gray-700" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 inline" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 010 2.828L8.828 14l-3.536.707.707-3.536L14.586 2.586a2 2 0 012.828 0z" />
                          </svg>
                        </button>
                      </div>

                      <div className="text-center">
                        <CheckIcon ok={Boolean((exp as any).stateExperienceId === 1)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="fixed right-8 top-8 w-14 h-14 bg-orange-500 rounded-lg text-white flex items-center justify-center shadow-lg">+
        </button>
      </div>
    </div>
  );
};

export default Information;
