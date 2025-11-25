import React, { ReactNode, useEffect, useState } from "react";
import { ExperienceInfoDetail } from "../../experience/types/ExperienceDetail";

interface ExperienceModalProps {
	show: boolean;
	onClose: () => void;
	experienceId?: number | null;
}

const InfoRow = ({ labelText, value }: { labelText: string; value?: ReactNode }) => (
	<div className="mb-4">
		<div className="text-base font-semibold text-gray-800">{labelText}</div>
		<div className="text-gray-700 text-base">
			{value || <span className="text-gray-400">Sin información</span>}
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

	if (loading || !data) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
				<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
					<span className="text-lg text-gray-700">Cargando información...</span>
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
				<button onClick={onClose} className="absolute top-6 right-6 text-2xl text-gray-400 hover:text-gray-700">×</button>
				<h2 className="text-3xl font-bold mb-10 text-gray-900">Información de la Experiencia</h2>

				{/* Main info grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mb-8">
					<InfoRow labelText="Título de la experiencia:" value={title} />
					<InfoRow labelText="Líder de la experiencia:" value={leaderName} />
					<InfoRow labelText="Fecha:" value={date} />
					<InfoRow labelText="Estado:" value={state} />
					<InfoRow labelText="Institución educativa:" value={institution} />
					<InfoRow labelText="Código DANE:" value={codeDane} />
					<InfoRow labelText="Departamento:" value={dept} />
					<InfoRow labelText="Municipio:" value={municipality} />
				</div>

				{/* Document and link section (no divider) */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mb-4">
					<InfoRow
						labelText="Oficio de presentación por parte de la Institución Educativa (membrete de la IE y firma del Rector (a)):"
						value={
							pdf2 ? (
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => openPdf(pdf2)}
										className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded px-3 py-1 shadow-sm border border-red-200 transition"
										title="Abrir PDF 2 en nueva pestaña"
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-600">
											<path d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 11.172 1H4zm8 1.414L17.586 7H14a2 2 0 0 1-2-2V3.414zM6.75 9.25a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75zm2.5.75a.75.75 0 0 1 .75-.75h1.25a1.75 1.75 0 1 1 0 3.5H10v.75a.75.75 0 0 1-1.5 0v-4zm1.5 1.5a.25.25 0 0 0 0-.5H10v.5h.75zm2.5-1.5a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75z" />
										</svg>
										<span>Abrir PDF 2</span>
									</button>
								</div>
							) : null
						}
					/>

					<InfoRow
						labelText="Proyecto de Experiencia Significativa:"
						value={
							pdf ? (
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => openPdf(pdf)}
										className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded px-3 py-1 shadow-sm border border-red-200 transition"
										title="Abrir PDF en nueva pestaña"
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-600">
											<path d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 11.172 1H4zm8 1.414L17.586 7H14a2 2 0 0 1-2-2V3.414zM6.75 9.25a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75zm2.5.75a.75.75 0 0 1 .75-.75h1.25a1.75 1.75 0 1 1 0 3.5H10v.75a.75.75 0 0 1-1.5 0v-4zm1.5 1.5a.25.25 0 0 0 0-.5H10v.5h.75zm2.5-1.5a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75z" />
										</svg>
										<span>Abrir PDF</span>
									</button>
								</div>
							) : null
						}
					/>

					<InfoRow
						labelText="Enlace adicional:"
						value={
							link ? (
								<a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
									{link}
								</a>
							) : null
						}
					/>
				</div>

				<div className="flex justify-end mt-10">
					<button onClick={onClose} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded-lg shadow">
						Listo
					</button>
				</div>
			</div>
		</div>
	);
};

export default ExperienceModal;
