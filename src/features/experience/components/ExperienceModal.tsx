import React, { ReactNode } from "react";
import type { Experience } from "../types/experienceTypes";

interface ExperienceModalProps {
	show: boolean;
	onClose: () => void;
	experience?: Experience | any;
}

const label = (text: string) => <span className="font-semibold text-gray-800">{text}</span>;

const InfoRow = ({ labelText, value }: { labelText: string; value?: ReactNode }) => (
	<div className="mb-4">
		<div className="text-base font-semibold text-gray-800">{labelText}</div>
		<div className="text-gray-700 text-base">{value || <span className="text-gray-400">Sin información</span>}</div>
	</div>
);

const ExperienceModal: React.FC<ExperienceModalProps> = ({ show, onClose, experience }) => {
	if (!show) return null;

	// Campos principales mapeados según los nombres exactos
	const title = experience?.nameExperiences || "Sin información";
	const institution = experience?.institution?.name || "Sin información";
	const state = experience?.stateExperienceId === 1 ? "Naciente" : experience?.stateExperienceId || "Sin información";
	const thematic = experience?.thematicLocation || "Sin información";
	// Ajuste para usar los campos exactos pedidos
	const name = experience?.institution?.name || "Sin información";
	const nameLeaders = experience?.leaders?.[0]?.nameLeaders || "Sin información";
	const departamentExact = experience?.institution?.departament || "Sin información";
	const municipalityExact = experience?.institution?.municipality || "Sin información";
	const codeDaneExact = experience?.institution?.codeDane || "Sin información";
	const dateExact = experience?.developmenttime || "Sin información";
	const link = experience?.documents?.[0]?.urlLink || null;
	const pdf = experience?.documents?.[0]?.urlPdf || null;
	const pdf2 = experience?.documents?.[0]?.urlPdfExperience || null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
				<button onClick={onClose} className="absolute top-6 right-6 text-2xl text-gray-400 hover:text-gray-700">×</button>
				<h2 className="text-3xl font-bold mb-8 text-gray-900">Información de la Experiencia</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
					<InfoRow labelText="Título de la experiencia:" value={title} />
					<InfoRow labelText="Nombre del establecimiento educativo:" value={name} />
					<InfoRow labelText="Nombre Completo del líder:" value={nameLeaders} />
					<InfoRow labelText="Departamento:" value={departamentExact} />
					<InfoRow labelText="Fecha:" value={dateExact} />
					<InfoRow labelText="Municipio:" value={municipalityExact} />
					<InfoRow labelText="Criterios evaluados:" value={thematic} />
					<InfoRow labelText="Código DANE:" value={codeDaneExact} />
					<InfoRow labelText="Estado actual:" value={state} />
					<InfoRow labelText="Adjuntar PDF:" value={pdf ? (<a href={pdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver PDF</a>) : "No hay PDF adjunto"} />
					<InfoRow labelText="pdf2:" value={pdf2 ? (<a href={pdf2} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{pdf2}</a>) : "Sin información"} />
					<InfoRow labelText="Enlace:" value={link ? (<a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{link}</a>) : "Sin información"} />
				</div>
				<div className="flex justify-end mt-8">
					<button onClick={onClose} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">Listo</button>
				</div>
			</div>
		</div>
	);
};

export default ExperienceModal;
