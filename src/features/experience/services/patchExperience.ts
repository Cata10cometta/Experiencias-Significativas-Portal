// Handlers para actualizar secciones específicas de la experiencia
import Swal from 'sweetalert2';
import { getToken } from '../../../Api/Services/Auth';
import { buildExperiencePayload } from '../components/AddExperience';
import { getUserId } from '../components/AddExperience';

// PATCH handler para Identificación Institucional
export const handlePatchInstitutional = async ({ initialData, identificacionForm, identificacionInstitucional, lideres, nivelesForm, tematicaForm, seguimientoEvaluacion, informacionApoyo, pdfFile }: any) => {
	try {
		const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
		const endpoint = `${API_BASE}/api/Experience/patch`;
		const token = localStorage.getItem('token') || getToken?.();
		if (!initialData?.id) {
			Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontró el ID de la experiencia.' });
			return;
		}
		const userId = getUserId(token);
		const payload = buildExperiencePayload({
			initialData,
			identificacionForm,
			identificacionInstitucional,
			lideres,
			nivelesForm,
			tematicaForm,
			seguimientoEvaluacion,
			informacionApoyo,
			pdfFile,
			userId
		});
		const USE_WRAPPER = true;
		const res = await fetch(endpoint, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: USE_WRAPPER ? JSON.stringify(payload) : JSON.stringify(payload.request),
		});
		if (!res.ok) {
			const message = await res.text().catch(() => `HTTP ${res.status}`);
			Swal.fire({ icon: 'error', title: 'Error', text: message });
			return;
		}
		Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Cambios guardados correctamente.' });
	} catch (err: any) {
		const msg = err?.message ?? (typeof err === 'string' ? err : (err && typeof err.toString === 'function' ? err.toString() : 'Error al guardar.'));
		Swal.fire({ icon: 'error', title: 'Error', text: msg });
	}
};

// PATCH handler para Líderes

export const handlePatchLeaders = async (params: any) => {
	return patchExperience(buildExperiencePayload(params).request);
};

// PATCH handler para Identificación de la Experiencia

export const handlePatchIdentification = async (params: any) => {
	return patchExperience(buildExperiencePayload(params).request);
};

// PATCH handler para Temática

export const handlePatchThematic = async (params: any) => {
	return patchExperience(buildExperiencePayload(params).request);
};

// PATCH handler para Componentes

export const handlePatchComponents = async (params: any) => {
	return patchExperience(buildExperiencePayload(params).request);
};

// PATCH handler para Monitoreo/Seguimiento

export const handlePatchFollowUp = async (params: any) => {
	return patchExperience(buildExperiencePayload(params).request);
};

// PATCH handler para Información de Apoyo

export const handlePatchSupportInfo = async (params: any) => {
	return patchExperience(buildExperiencePayload(params).request);
};

// PATCH handler para Documentos

export const handlePatchDocuments = async (params: any) => {
	return patchExperience(buildExperiencePayload(params).request);
};
import configApi from "../../../Api/Config/Config";
import type { UpdateExperienceRequest } from "../types/updateExperience";

// Servicio para actualizar una experiencia existente
export const patchExperience = async (data: UpdateExperienceRequest) => {
	const response = await configApi.patch("/Experience/patch", data);
	return response.data;
};
