import React, { ReactNode, useEffect, useState } from "react";
import { ExperienceInfoDetail } from "../../experience/types/ExperienceDetail";
import { XMarkIcon, DocumentTextIcon, LinkIcon } from '@heroicons/react/24/outline'; // Iconos modernos para cerrar y documentos

interface ExperienceModalProps {
    show: boolean;
    onClose: () => void;
    experienceId?: number | null;
}

// Componente mejorado para las filas de información
const InfoRow = ({ labelText, value }: { labelText: string; value?: ReactNode }) => (
    <div className="flex flex-col border-b border-gray-100 pb-3">
        <div className="text-sm font-medium text-gray-500 mb-1">{labelText}</div>
        <div className="text-base font-semibold text-gray-800 break-words">
            {value || <span className="text-gray-400 font-normal italic">Sin información</span>}
        </div>
    </div>
);


function openPdf(pdfString: string | null) {
    if (!pdfString) return;
    // Si es base64 puro (sin prefijo data:), lo convertimos a Blob
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(pdfString) && pdfString.length > 100;
    if (isBase64) {
        try {
            const byteCharacters = atob(pdfString);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank', 'noopener,noreferrer');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
            return;
        } catch (e) {
            alert('No se pudo abrir el PDF.');
        }
    } else if (pdfString.startsWith('data:application/pdf;base64,')) {
        // Si ya tiene el prefijo data:application/pdf;base64,
        window.open(pdfString, '_blank', 'noopener,noreferrer');
    } else {
        // Si es una URL normal
        window.open(pdfString, '_blank', 'noopener,noreferrer');
    }
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({ show, onClose, experienceId }) => {
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && experienceId) {
            setLoading(true);
            const token = localStorage.getItem("token");

            fetch(`https://localhost:7263/api/Experience/${experienceId}/detail`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            })
                .then(res => res.json())
                .then(apiData => {
                    console.log("[ExperienceModal] FIXED API response:", apiData);
                    setData(apiData);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setData(null);
                    setLoading(false);
                });
        } else if (!show) {
            setData(null);
        }
    }, [show, experienceId]);

    if (!show) return null;

    // --- Modal de Carga Mejorado ---
    if (loading || !data) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
                <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-pulse">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-450"></div>
                    </div>
                    <span className="text-lg text-gray-700 mt-4 block">Cargando información...</span>
                </div>
            </div>
        );
    }

    // Datos tipados con ExperienceInfoDetail
    const exp = data.experienceInfo;
    const inst = data.institutionInfo;
    const docs = data.documentInfo;

    const title = exp?.nameExperiences;
    const date = exp?.developmenttime?.split("T")[0];
    const state = exp?.evaluationResult;
    const leaderName = exp?.leaders?.[0]?.nameLeaders;

    const institution = inst?.name;
    const dept = inst?.departamentes?.[0]?.name;
    const municipality = inst?.municipalities?.[0]?.name;
    const codeDane = inst?.codeDane;

    const pdf = docs?.[0]?.urlPdf || null;
    const pdf2 = docs?.[0]?.urlPdfExperience || null;
    const link = docs?.[0]?.urlLink || null;

    return (
        // Contenedor principal del Modal con fondo semi-transparente
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            {/* Contenido del Modal: Responsive y con Scroll interno */}
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mt-10 mb-10 relative transform transition-all duration-300 ease-in-out sm:mt-20">
                
                {/* Botón de cerrar (esquina) */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition duration-150 p-1 rounded-full bg-gray-50 hover:bg-gray-100 z-10"
                    aria-label="Cerrar modal"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
                
                {/* Encabezado */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-800">
                        Detalle de la Experiencia
                    </h2>
                    <p className="text-lg text-gray-600 mt-1">{title}</p>
                </div>

                {/* Cuerpo del Modal con Información */}
                <div className="p-6 grid grid-cols-1 gap-6">

                    {/* Sección 1: Datos Generales */}
                    <div className="border border-gray-100 rounded-lg p-4 bg-blue-50/50">
                        <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                            Datos Clave
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <InfoRow labelText="Título de la experiencia:" value={title} />
                            <InfoRow labelText="Líder de la experiencia:" value={leaderName} />
                            <InfoRow labelText="Fecha de desarrollo:" value={date} />
                            <InfoRow labelText="Estado actual:" value={<span className={`font-extrabold text-sm px-3 py-1 rounded-full inline-block ${state === 'Aprobada' ? 'bg-green-100 text-green-700' : state === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{state || 'No evaluado'}</span>} />
                        </div>
                    </div>

                    {/* Sección 2: Institución */}
                    <div className="border border-gray-100 rounded-lg p-4 bg-white">
                        <h3 className="text-xl font-bold text-gray-700 mb-4">
                            Información de la Institución
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <InfoRow labelText="Institución educativa:" value={institution} />
                            <InfoRow labelText="Código DANE:" value={codeDane} />
                            <InfoRow labelText="Departamento:" value={dept} />
                            <InfoRow labelText="Municipio:" value={municipality} />
                        </div>
                    </div>

                    {/* Sección 3: Documentos y Enlaces */}
                    <div className="border border-gray-100 rounded-lg p-4 bg-white">
                        <h3 className="text-xl font-bold text-gray-700 mb-4">
                            Documentación Adjunta
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">

                          {/* Botón PDF 2 */}
                            <div className="flex flex-col">
                                {/* Etiqueta: texto gris claro en fondo oscuro */}
                                <span className="text-xs font-medium text-gray-400 mb-1">Oficio de presentación IE:</span>
                                {pdf2 ? (
                                    <button
                                        type="button"
                                        onClick={() => openPdf(pdf2)}
                                        // Botón: Azul oscuro (Blue-800) con texto blanco
                                        className="flex items-center justify-center gap-1 bg-blue-800 hover:bg-blue-700 text-white font-semibold py-1.5 px-2 rounded-lg shadow-lg transition duration-150 text-xs"
                                        title="Abrir Oficio de presentación"
                                    >
                                        <DocumentTextIcon className="w-4 h-4" />
                                        <span>Oficio (PDF)</span>
                                    </button>
                                ) : (
                                    <span className="text-gray-500 text-xs italic py-2">No adjunto</span>
                                )}
                            </div>

                            {/* Botón PDF 1 */}
                            <div className="flex flex-col">
                                {/* Etiqueta: texto gris claro en fondo oscuro */}
                                <span className="text-xs font-medium text-gray-400 mb-1">Proyecto de Experiencia:</span>
                                {pdf ? (
                                    <button
                                        type="button"
                                        onClick={() => openPdf(pdf)}
                                        // Botón: Azul oscuro (Blue-800) con texto blanco
                                        className="flex items-center justify-center gap-1 bg-blue-800 hover:bg-blue-700 text-white font-semibold py-1.5 px-2 rounded-lg shadow-lg transition duration-150 text-xs"
                                        title="Abrir Proyecto de Experiencia Significativa"
                                    >
                                        <DocumentTextIcon className="w-4 h-4" />
                                        <span>Proyecto (PDF)</span>
                                    </button>
                                ) : (
                                    <span className="text-gray-500 text-xs italic py-2">No adjunto</span>
                                )}
                            </div>
                            
                            {/* Enlace Adicional */}
                            <div className="flex flex-col">
                                {/* Etiqueta: texto gris claro en fondo oscuro */}
                                <span className="text-xs font-medium text-gray-400 mb-1">Enlace adicional:</span>
                                {link ? (
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-200 underline break-all text-xs py-2" title="Abrir enlace externo">
                                        <LinkIcon className="w-3 h-3" />
                                        <span>{link.substring(0, 30)}...</span>
                                    </a>
                                ) : (
                                    <span className="text-gray-500 text-xs italic py-2">No adjunto</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pie de página con botón de cierre */}
                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-8 rounded-lg transition duration-150 shadow-sm"
                    >
                        Listo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExperienceModal;
