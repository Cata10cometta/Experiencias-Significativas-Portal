import  { useState, useEffect } from "react";
import {  Button } from "@mui/material";
import axios from "axios";
import configApi from '../../../Api/Config/Config';
import Modal from "@mui/material/Modal"; // Importar Modal de Material-UI
import Box from "@mui/material/Box"; // Importar Box para estilos del modal
import type { Evaluation } from "../types/evaluation";
import EvaluatorInfo from "./EvaluatorInfo";
import ExperienceInfo from "./ExperienceInfo";
import CriterioPertinencia from "./CriterioPertinencia";
import CriteriaFoundation from "./CriteriaFoundation";
import CriteriaInnovation from "./CriteriaInnovation";
import CriteriaResults from "./CriteriaResults";
import CriteriaEmpowerment from "./CriteriaEmpowerment";
import CriteriaMonitoring from "./CriteriaMonitoring";
import CriteriaTransformation from "./CriteriaTransformation";
import CriteriaSustainability from "./CriteriaSustainability";
import CriteriaTransfer from "./CriteriaTransfer";
import CriteriaFinalConcept from "./CriteriaFinalConcept";
import type { Experience } from "../../experience/types/experienceTypes";

interface EvaluationProps {
    experienceId?: number | null;
    experiences?: Experience[];
    onClose?: () => void;
    onExperienceUpdated?: (id: number, url: string) => void;
}

function Evaluation({ experienceId, experiences = [], onClose, onExperienceUpdated }: EvaluationProps) {
    const [activeStep, setActiveStep] = useState(0);
    const CRITERIA_IDS = [1,2,3,4,5,6,7,8,9];
    const [form, setForm] = useState<Evaluation>({
        evaluationId: 0,
        typeEvaluation: "",
        accompanimentRole: "",
        comments: "",
        evaluationResult: "",
        urlEvaPdf: "",
        experienceId: experienceId ?? 0,
        experienceName: "",
        stateId: 0,
        institutionName: "",
        criteriaEvaluations: CRITERIA_IDS.map(id => ({
            criteriaId: id,
            descriptionContribution: '',
            score: 0,
            evaluationId: 0,
            id: 0,
            state: true,
            createdAt: null,
            deletedAt: null
        })),
        thematicLineNames: [],
        userId: Number(localStorage.getItem("userId")) || 0,
        experience: {} as any // provide empty experience object to satisfy required type
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({}); // Estado para errores
    const [evaluationResult, setEvaluationResult] = useState<string | null>(null); // Estado para el resultado de la evaluación
    const [showModal, setShowModal] = useState(false); // Estado para mostrar el modal
    const [isEditing, setIsEditing] = useState(false); // Si existe una evaluación previa (usar update)
    const [evaluationUrl, setEvaluationUrl] = useState<string | null>(null);
    const [isUrlLoading, setIsUrlLoading] = useState(false);
    const [lastGenerateMessage, setLastGenerateMessage] = useState<string | null>(null);
    // local PDF modal removed; PDF preview is shown in parent `Experiences`

    const steps = [
        "Evaluador",
        "Experiencia",
        "Pertinencia",
        "Fundamentación",
        "Innovación",
        "Resultados",
        "Empoderamiento",
        "Monitoreo",
        "Transformación",
        "Sostenibilidad",
        "Transferencia",
        "Concepto Final"
    ];

    // Sincroniza experienceId y rellena los campos de ExperienceInfo
    useEffect(() => {
        if (experienceId && experiences.length > 0) {
            const exp = experiences.find(e => e.id === experienceId);
            if (exp) {
                console.log('Experiencia seleccionada:', exp);
                setForm(prev => ({
                    ...prev,
                    experienceId: exp.id,
                    institutionName: exp.institution?.name || "",
                    experienceName: exp.nameExperiences || "",
                    thematicLineNames: exp.thematicLineIds ? exp.thematicLineIds.map(id => id.toString()) : [],
                    stateId: (exp as any).stateId || 0
                }));
            }
        }
    }, [experienceId, experiences]);

    // Sincroniza el experienceId recibido por props con el modelo de evaluación
    useEffect(() => {
        if (experienceId && experienceId !== form.experienceId) {
            setForm(prev => ({ ...prev, experienceId }));
        }
    }, [experienceId]);

    // Localiza el id de una evaluación recién creada buscando por experienceId
    const locateCreatedEvaluationId = async (
        experienceIdToFind?: number | null,
        matchFields?: { userId?: number; comments?: string; accompanimentRole?: string; typeEvaluation?: string }
    ) => {
        if (!experienceIdToFind) return 0;
        const token = localStorage.getItem('token');

        const tryPaths = [
            `Evaluation/getByExperience/${experienceIdToFind}`,
            `Evaluation/by-experience/${experienceIdToFind}`,
            `Evaluation?experienceId=${experienceIdToFind}`,
            `Evaluation?ExperienceId=${experienceIdToFind}`,
            'Evaluation',
            'Evaluation/List',
            'Evaluation/GetAll',
        ];

        const attempts = 6; // aumentar un poco los intentos
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        for (let attempt = 0; attempt < attempts; attempt++) {
            for (const p of tryPaths) {
                try {
                    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'https://localhost:7263';
                    // Preparar posibles URLs: absoluta y relativa
                    const candidates = [
                        p.startsWith('http') ? p : `${base.replace(/\/$/, '')}/api/${p}`,
                        `/api/${p}`
                    ];

                    let resp: any = null;
                    for (const url of candidates) {
                        try {
                            resp = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                            if (resp && resp.status === 200 && resp.data) break;
                        } catch (e) {
                            resp = null;
                        }
                    }

                    if (!resp) {
                        // intentar con configApi
                        try {
                            const r2 = await configApi.get(p);
                            if (r2 && r2.status === 200 && r2.data) resp = r2;
                        } catch (e) {
                            // ignore
                        }
                    }

                    if (!resp || !resp.data) continue;

                    let data: any = resp.data;
                    const maybeArray = Object.values(data).find((v: any) => Array.isArray(v));
                    if (Array.isArray(maybeArray)) data = maybeArray;

                    if (Array.isArray(data)) {
                        // filtrar por experienceId
                        const candidatesArr = data.filter((r: any) => {
                            return r?.experienceId === experienceIdToFind || r?.ExperienceId === experienceIdToFind || r?.experience?.id === experienceIdToFind;
                        });

                        if (candidatesArr.length > 0) {
                            if (matchFields) {
                                const matched = candidatesArr.find((c: any) => {
                                    const userOk = matchFields.userId ? (c?.userId === matchFields.userId || c?.UserId === matchFields.userId) : true;
                                    const commentsOk = matchFields.comments ? String(c?.comments || c?.Comments || '').toLowerCase().includes(String(matchFields.comments).toLowerCase()) : true;
                                    const roleOk = matchFields.accompanimentRole ? String(c?.accompanimentRole || c?.AccompanimentRole || '').toLowerCase().includes(String(matchFields.accompanimentRole).toLowerCase()) : true;
                                    const typeOk = matchFields.typeEvaluation ? String(c?.typeEvaluation || c?.TypeEvaluation || '').toLowerCase().includes(String(matchFields.typeEvaluation).toLowerCase()) : true;
                                    return userOk && commentsOk && roleOk && typeOk;
                                });
                                if (matched) {
                                    const id = matched?.evaluationId || matched?.id || matched?.Id;
                                    if (id) {
                                        console.debug('locateCreatedEvaluationId: candidato encontrado por huella', id, matched);
                                        return Number(id);
                                    }
                                }
                            }

                            const withDate = candidatesArr.filter((c: any) => c.createdAt || c.creationDate || c.dateCreated || c.createdOn);
                            if (withDate.length > 0) {
                                withDate.sort((a: any, b: any) => new Date(b.createdAt || b.creationDate || b.dateCreated || b.createdOn).getTime() - new Date(a.createdAt || a.creationDate || a.dateCreated || a.createdOn).getTime());
                                const id = withDate[0]?.evaluationId || withDate[0]?.id || withDate[0]?.Id;
                                if (id) {
                                    console.debug('locateCreatedEvaluationId: seleccionado por fecha', id);
                                    return Number(id);
                                }
                            }

                            candidatesArr.sort((a: any, b: any) => (Number(b?.evaluationId || b?.id || b?.Id || 0) - Number(a?.evaluationId || a?.id || a?.Id || 0)));
                            const id2 = candidatesArr[0]?.evaluationId || candidatesArr[0]?.id || candidatesArr[0]?.Id;
                            if (id2) {
                                console.debug('locateCreatedEvaluationId: seleccionado por id mayor', id2);
                                return Number(id2);
                            }
                        }
                    } else if (data && (data?.evaluationId || data?.id || data?.Id) && (data?.experienceId === experienceIdToFind || data?.ExperienceId === experienceIdToFind || data?.experience?.id === experienceIdToFind)) {
                        const id = data?.evaluationId || data?.id || data?.Id;
                        if (id) {
                            console.debug('locateCreatedEvaluationId: encontrado objeto single', id);
                            return Number(id);
                        }
                    }
                } catch (e) {
                    // ignorar y probar siguiente
                }
            }
            // espera antes del siguiente intento
            await delay(900);
        }

        // último recurso: llamada absoluta al backend list
        try {
            const base = (import.meta.env.VITE_API_BASE_URL as string) || 'https://localhost:7263';
            console.debug('locateCreatedEvaluationId: comprobando lista absoluta en base', base);
            const r = await axios.get(`${base.replace(/\/$/, '')}/api/Evaluation`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
            if (r && r.status === 200 && Array.isArray(r.data)) {
                const found = r.data.find((r2: any) => r2?.experienceId === experienceIdToFind || r2?.ExperienceId === experienceIdToFind);
                if (found) {
                    const fid = Number(found?.evaluationId || found?.id || found?.Id || 0);
                    console.debug('locateCreatedEvaluationId: encontrado en lista absoluta', fid);
                    return fid;
                }
            }
        } catch (e) {
            // ignore
        }

        console.debug('locateCreatedEvaluationId: no se pudo localizar id para experienceId', experienceIdToFind);
        return 0;
    };

    // Guardar la URL del PDF en la entidad Experience (documents[0].urlPdf) usando los endpoints públicos
    const savePdfUrlToExperience = async (pdfUrl: string) => {
        try {
            const expId = form.experienceId || 0;
            if (!expId) return;
            const token = localStorage.getItem('token');

            // obtener detalle actual de la experiencia
            const detailResp = await axios.get(`/api/Experience/${expId}/detail`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
            if (!detailResp || detailResp.status !== 200) return;
            const data = detailResp.data || {};

            // Normalizar estructura UpdateExperience
            const updated = {
                ...data,
                documents: Array.isArray(data.documents) ? data.documents.slice() : [],
            } as any;

            if (!updated.documents || updated.documents.length === 0) {
                updated.documents = [{ urlPdf: pdfUrl, urlLink: '' }];
            } else {
                // colocar en documents[0].urlPdf
                updated.documents[0] = { ...(updated.documents[0] || {}), urlPdf: pdfUrl };
            }

            // enviar patch
            await axios.patch('/api/Experience/patch', updated, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } });
            console.debug('savePdfUrlToExperience: URL guardada en experiencia', expId, pdfUrl);
            // notificar al padre para actualizar la lista localmente si proporcionó callback
            try { if (typeof onExperienceUpdated === 'function') onExperienceUpdated(expId, pdfUrl); } catch(e) { /**/ }
        } catch (e) {
            console.debug('savePdfUrlToExperience error', e);
        }
    };
    // Buscar si ya existe una evaluación para este usuario y experiencia
    useEffect(() => {
        const fetchExistingEvaluation = async () => {
            if (!experienceId) return;
            const token = localStorage.getItem("token");
            const userId = Number(localStorage.getItem("userId")) || 0;
            try {
                const urlsToTry = [
                    `/api/Evaluation/getByExperience/${experienceId}`,
                    `/api/Evaluation/by-experience/${experienceId}`,
                    `/api/Evaluation/${experienceId}`,
                    `/api/Evaluation/List`,
                    `/api/Evaluation`
                ];

                let resp = null;
                for (const url of urlsToTry) {
                    try {
                        resp = await axios.get(url, {
                            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                        });
                        if (resp && resp.status === 200 && resp.data) break;
                    } catch (e) {
                        resp = null;
                    }
                }

                if (resp && resp.data) {
                    let existing = resp.data;
                    if (Array.isArray(existing)) {
                        existing = existing.find((e) => {
                            return (
                                (e.experienceId === experienceId || e.ExperienceId === experienceId || e.experienceID === experienceId || e.ExperienceID === experienceId)
                                && (e.userId === userId || e.UserId === userId)
                            );
                        }) || null;
                    } else if (existing && (existing.experienceId !== experienceId && existing.ExperienceId !== experienceId)) {
                        existing = null;
                    }

                    if (existing) {
                        setForm(prev => ({
                            ...prev,
                            ...existing,
                            criteriaEvaluations: Array.isArray(existing.criteriaEvaluations)
                                ? existing.criteriaEvaluations
                                : (Array.isArray(existing.CriteriaEvaluations) ? existing.CriteriaEvaluations : []),
                            experienceId: existing.experienceId ?? existing.ExperienceId ?? prev.experienceId,
                            userId: existing.userId ?? existing.UserId ?? prev.userId,
                        }));
                        setIsEditing(true);
                    } else {
                        setIsEditing(false);
                    }
                } else {
                    setIsEditing(false);
                }
            } catch (err) {
                setIsEditing(false);
            }
        };
        fetchExistingEvaluation();
    }, [experienceId]);

    const validateStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (activeStep === 0) {
            // Validación para el paso "Evaluador"
            if (!form.accompanimentRole) {
                newErrors.accompanimentRole = "El rol en el acompañamiento es obligatorio.";
            }
            if (!form.typeEvaluation) {
                newErrors.typeEvaluation = "El tipo de evaluación es obligatorio.";
            }
            if (!form.comments) {
                newErrors.comments = "El comentario es obligatorio."; // Validación para comentarios
            }
        } else if (activeStep === 1) {
            // Validación para el paso "Experiencia"
            if (!form.experienceName) {
                newErrors.experienceName = "El nombre de la experiencia es obligatorio.";
            }
            if (!form.institutionName) {
                newErrors.institutionName = "El nombre de la institución es obligatorio.";
            }
        } else if (activeStep === 2) {
            const criteriaPertinencia = form.criteriaEvaluations?.find((c) => c.criteriaId === 1);
            if (!criteriaPertinencia || !criteriaPertinencia.descriptionContribution.trim()) {
                newErrors.descriptionContributionPertinencia = "El campo de aportes es obligatorio."; // Validación para Pertinencia
            }
        } else if (activeStep === 3) {
            const criteriaFoundation = form.criteriaEvaluations?.find((c) => c.criteriaId === 2);
            if (!criteriaFoundation || !criteriaFoundation.descriptionContribution.trim()) {
                newErrors.descriptionContributionFoundation = "El campo de aportes es obligatorio."; // Validación para Fundamentación
            }
        } else if (activeStep === 4) {
            const criteriaInnovation = form.criteriaEvaluations?.find((c) => c.criteriaId === 3);
            if (!criteriaInnovation || !criteriaInnovation.descriptionContribution.trim()) {
                newErrors.descriptionContributionInnovation = "El campo de aportes es obligatorio."; // Validación para Innovación
            }
        } else if (activeStep === 5) {
            const criteriaResultados = form.criteriaEvaluations?.find((c) => c.criteriaId === 4);
            if (!criteriaResultados || !criteriaResultados.descriptionContribution.trim()) {
                newErrors.descriptionContributionResultados = "El campo de aportes es obligatorio."; // Validación para Resultados
            }
        } else if (activeStep === 6) {
            const criteriaEmpowerment = form.criteriaEvaluations?.find((c) => c.criteriaId === 5);
            if (!criteriaEmpowerment || !criteriaEmpowerment.descriptionContribution.trim()) {
                newErrors.descriptionContributionEmpowerment = "El campo de aportes es obligatorio."; // Validación para Empoderamiento
            }
        } else if (activeStep === 7) {
            const criteriaMonitoring = form.criteriaEvaluations?.find((c) => c.criteriaId === 6);
            if (!criteriaMonitoring || !criteriaMonitoring.descriptionContribution.trim()) {
                newErrors.descriptionContributionMonitoring = "El campo de aportes es obligatorio."; // Validación para Monitoreo
            }
        } else if (activeStep === 8) {
            const criteriaTransformation = form.criteriaEvaluations?.find((c) => c.criteriaId === 7);
            if (!criteriaTransformation || !criteriaTransformation.descriptionContribution.trim()) {
                newErrors.descriptionContributionTransformation = "El campo de aportes es obligatorio."; // Validación para Transformación
            }
        } else if (activeStep === 9) {
            const criteriaSustainability = form.criteriaEvaluations?.find((c) => c.criteriaId === 8);
            if (!criteriaSustainability || !criteriaSustainability.descriptionContribution.trim()) {
                newErrors.descriptionContributionSustainability = "El campo de aportes es obligatorio."; // Validación para Sostenibilidad
            }
        } else if (activeStep === 10) {
            const CriteriaTransfer = form.criteriaEvaluations?.find((c) => c.criteriaId === 9);
            if (!CriteriaTransfer || !CriteriaTransfer.descriptionContribution.trim()) {
                newErrors.descriptionContributionTransfer = "El campo de aportes es obligatorio."; // Validación para Transferencia
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
    };

    const handleNext = () => {
        if (validateStep()) {
            setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };
    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleChange = (changes: Partial<Evaluation> & { criteriaEvaluation?: any }) => {
        setForm((prev) => {
            // Si viene un solo criterio (criteriaEvaluation), lo fusionamos
            if (changes.criteriaEvaluation) {
                const crit = changes.criteriaEvaluation;
                const merged = prev.criteriaEvaluations.map(c => c.criteriaId === crit.criteriaId ? { ...c, ...crit } : c);
                return { ...prev, ...changes, criteriaEvaluations: merged };
            }
            // Si viene un array de criterios (criteriaEvaluations), fusionamos cada uno
            if (changes.criteriaEvaluations) {
                let merged = [...prev.criteriaEvaluations];
                changes.criteriaEvaluations.forEach((crit) => {
                    merged = merged.map(c => c.criteriaId === crit.criteriaId ? { ...c, ...crit } : c);
                });
                return { ...prev, ...changes, criteriaEvaluations: merged };
            }
            return { ...prev, ...changes };
        });
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        setError(null);
        const token = localStorage.getItem("token");
        const userId = Number(localStorage.getItem("userId")) || 0;
        // Normalizar criterios antes de enviar
        const CRITERIA_IDS = [1,2,3,4,5,6,7,8,9];
        // Tomar los criterios seleccionados por el usuario
        let criteriaEvaluationsToSend = Array.isArray(form.criteriaEvaluations) ? [...form.criteriaEvaluations] : [];
        // Agregar criterios faltantes con valores por defecto
        CRITERIA_IDS.forEach(id => {
            if (!criteriaEvaluationsToSend.some(c => c.criteriaId === id)) {
                criteriaEvaluationsToSend.push({
                    criteriaId: id,
                    descriptionContribution: '',
                    score: 0,
                    evaluationId: 0,
                    id: 0,
                    state: true,
                    createdAt: null,
                    deletedAt: null
                });
            }
        });
        // Ordenar por criteriaId ascendente
        criteriaEvaluationsToSend = criteriaEvaluationsToSend.sort((a, b) => a.criteriaId - b.criteriaId);

        // Transformar a evaluationCriteriaDetail para el backend
        const evaluationCriteriaDetail = criteriaEvaluationsToSend.map(c => ({
            criteriaId: c.criteriaId,
            scores: [c.score],
            descriptionContribution: c.descriptionContribution
        }));

        const formToSend = {
            typeEvaluation: form.typeEvaluation,
            comments: form.comments,
            accompanimentRole: form.accompanimentRole,
            userId,
            experienceId: form.experienceId,
            evaluationCriteriaDetail
        };
        // Log de depuración para ver exactamente lo que se envía
        console.log("Formulario a enviar:", JSON.stringify(formToSend, null, 2));
        try {
            let response;
            if (isEditing && form.evaluationId && form.evaluationId > 0) {
                // Actualizar evaluación existente
                response = await axios.put(`/api/Evaluation/update/${form.evaluationId}`, formToSend, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
            } else {
                // Crear nueva evaluación
                response = await axios.post("/api/Evaluation/create", formToSend, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
            }

            // si el backend retorna el id creado, actualizar el estado para permitir posteriores updates
            if (response?.data?.evaluationId) {
                setForm(prev => ({ ...prev, evaluationId: response.data.evaluationId }));
                setIsEditing(true);
            }

            const result = response?.data?.evaluationResult ?? response?.data?.message ?? (isEditing ? "Actualizado correctamente" : "Creado correctamente");
            setEvaluationResult(result);
            setShowModal(true);

            // determinar id de la evaluación (puede venir en distintos campos)
            let createdId = response?.data?.evaluationId || response?.data?.id || response?.data?.Id || form.evaluationId || 0;

            // Si el backend no devolvió el id directamente, intentar extraerlo de la cabecera Location
            const locationHeader = response?.headers?.location || response?.headers?.Location;
            if ((!createdId || createdId === 0) && locationHeader) {
                try {
                    const match = String(locationHeader).match(/\/(\d+)(?:\/?$|\D.*$)/);
                    if (match && match[1]) {
                        const parsed = Number(match[1]);
                        if (!isNaN(parsed) && parsed > 0) {
                            createdId = parsed;
                        }
                    }
                } catch (e) {}
            }

            // Si aún no hay id, intentar localizar la evaluación creada por experienceId
            if ((!createdId || createdId === 0) && form.experienceId) {
                try {
                    const match = {
                        userId: form.userId || userId,
                        comments: form.comments,
                        accompanimentRole: form.accompanimentRole,
                        typeEvaluation: form.typeEvaluation
                    };
                    const foundId = await locateCreatedEvaluationId(form.experienceId, match);
                    if (foundId && foundId > 0) createdId = foundId;
                } catch (e) {}
            }

            if (createdId && createdId !== 0) {
                setForm(prev => ({ ...prev, evaluationId: createdId }));
                setIsEditing(true);
                await fetchEvaluationUrl(createdId);
            } else {
                setLastGenerateMessage('Creado pero no se pudo obtener el id automáticamente. Reintenta generar el PDF.');
            }
        } catch (err) {
            setError("Error al guardar la evaluación");
        } finally {
            setIsSaving(false);
        }
    };

    // Intentar obtener una URL asociada a una evaluación (priorizar generate-pdf)
    const fetchEvaluationUrl = async (evaluationId: number | string) => {
        if (!evaluationId) return null;
        setIsUrlLoading(true);
        setEvaluationUrl(null);

    // 1) Construir base para llamada absoluta a /api/Evaluation/{id}/generate-pdf
    // Si no hay VITE_API_BASE_URL, usamos el backend por defecto donde indicaste que funciona.
    const envBase = (import.meta.env.VITE_API_BASE_URL as string) || "https://localhost:7263";
        const token = localStorage.getItem("token");

        try {
            if (envBase) {
                try {
                    const full = `${envBase.replace(/\/$/, '')}/api/Evaluation/${evaluationId}/generate-pdf`;
                    console.debug('Intentando POST absoluto a generate-pdf:', full);
                    const resp = await axios.post(full, null, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                            if (resp && resp.status >= 200 && resp.status < 300 && resp.data) {
                                const data = resp.data;
                                const foundUrl = typeof data === 'string' && data.startsWith('http') ? data : data?.url || data?.pdfUrl || data?.resultUrl || data?.data?.url;
                                if (foundUrl) {
                                    setEvaluationUrl(foundUrl);
                                    console.debug('URL recibida (absolute POST):', foundUrl);
                                    // notify parent immediately so UI updates even if PATCH is slow
                                    try {
                                        const expIdNotify = form.experienceId || experienceId || 0;
                                        if (expIdNotify && typeof onExperienceUpdated === 'function') onExperienceUpdated(expIdNotify, foundUrl);
                                    } catch (e) { /**/ }
                                    // intentar guardar la URL en la experiencia relacionada para que el icono muestre el PDF
                                    try { await savePdfUrlToExperience(foundUrl); } catch(e){ console.debug('No se pudo guardar url en la experiencia', e); }
                                    return foundUrl;
                                }
                            }
                } catch (e) {
                    console.debug('POST absoluto a generate-pdf falló, probando con configApi/relativo', e);
                }
            }

            // 2) Intentar con la instancia configurada del API (usa baseURL + token interceptor)
            try {
                console.debug('Intentando POST con configApi a generate-pdf (relativo)');
                const resp2 = await configApi.post(`Evaluation/${evaluationId}/generate-pdf`);
                    if (resp2 && resp2.status >= 200 && resp2.status < 300 && resp2.data) {
                    const data = resp2.data;
                    const foundUrl = typeof data === 'string' && data.startsWith('http') ? data : data?.url || data?.pdfUrl || data?.resultUrl || data?.data?.url;
                    if (foundUrl) {
                        setEvaluationUrl(foundUrl);
                        console.debug('URL recibida (configApi POST):', foundUrl);
                        try {
                            const expIdNotify = form.experienceId || experienceId || 0;
                            if (expIdNotify && typeof onExperienceUpdated === 'function') onExperienceUpdated(expIdNotify, foundUrl);
                        } catch (e) { /**/ }
                        try { await savePdfUrlToExperience(foundUrl); } catch(e){ console.debug('No se pudo guardar url en la experiencia', e); }
                        return foundUrl;
                    }
                }
            } catch (e) {
                console.debug('configApi POST generate-pdf no devolvió URL o falló, se intentará GET/polling', e);
            }

            // 3) Intentar GET relativo directo (Vite proxy) a la misma ruta
            try {
                console.debug('Intentando POST relativo a /api/Evaluation/{id}/generate-pdf via axios');
                const resp3 = await axios.post(`/api/Evaluation/${evaluationId}/generate-pdf`, null, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                if (resp3 && resp3.status >= 200 && resp3.status < 300 && resp3.data) {
                    const data = resp3.data;
                    const foundUrl = typeof data === 'string' && data.startsWith('http') ? data : data?.url || data?.pdfUrl || data?.resultUrl || data?.data?.url;
                    if (foundUrl) {
                        setEvaluationUrl(foundUrl);
                        console.debug('URL recibida (relative POST):', foundUrl);
                        try {
                            const expIdNotify = form.experienceId || experienceId || 0;
                            if (expIdNotify && typeof onExperienceUpdated === 'function') onExperienceUpdated(expIdNotify, foundUrl);
                        } catch (e) { /**/ }
                        try { await savePdfUrlToExperience(foundUrl); } catch(e){ console.debug('No se pudo guardar url en la experiencia', e); }
                        return foundUrl;
                    }
                }
            } catch (e) {
                console.debug('POST relativo a generate-pdf falló, pasamos a intentar GETs/polling', e);
            }

            // 4) Si no devolvió URL de forma inmediata, hacer intentos GET a endpoints comunes y polling al recurso de evaluación
            const urlCandidates = [
                `/api/Evaluation/getUrl/${evaluationId}`,
                `/api/Evaluation/url/${evaluationId}`,
                `/api/Evaluation/pdf/${evaluationId}`,
                `/api/Evaluation/getPdf/${evaluationId}`,
                `/api/Evaluation/generatePdf/${evaluationId}`,
                `/api/Evaluation/generate-url/${evaluationId}`,
                `/api/Evaluation/${evaluationId}/url`,
            ];

            for (const url of urlCandidates) {
                try {
                    const r = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                    if (r && r.status === 200 && r.data) {
                        const d = r.data;
                        const found = typeof d === 'string' && d.startsWith('http') ? d : d?.url || d?.pdfUrl || d?.resultUrl || d?.data?.url;
                        if (found) {
                            setEvaluationUrl(found);
                            console.debug('URL encontrada en candidato GET:', url, found);
                            try {
                                const expIdNotify = form.experienceId || experienceId || 0;
                                if (expIdNotify && typeof onExperienceUpdated === 'function') onExperienceUpdated(expIdNotify, found);
                            } catch (e) { /**/ }
                            try { await savePdfUrlToExperience(found); } catch(e){ console.debug('No se pudo guardar url en la experiencia', e); }
                            return found;
                        }
                    }
                } catch (e) {
                    console.debug('GET candidato no devolvió URL:', url, e);
                }
            }

            // Polling al recurso de la evaluación (si el backend guarda la URL en un campo)
            const pollCandidates = [`/api/Evaluation/${evaluationId}`, `/api/Evaluation/Get/${evaluationId}`];
            const maxAttempts = 6;
            const delayMs = 2000;
            for (const pollUrl of pollCandidates) {
                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    try {
                        const r = await axios.get(pollUrl, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                        if (r && r.status === 200 && r.data) {
                            const d = r.data;
                            const found = d?.UrlEvaPdf || d?.url || d?.pdfUrl || d?.Url || d?.urlPdf || d?.data?.url;
                            if (found) {
                                setEvaluationUrl(found);
                                console.debug('URL encontrada por polling en', pollUrl, 'attempt', attempt, found);
                                try {
                                    const expIdNotify = form.experienceId || experienceId || 0;
                                    if (expIdNotify && typeof onExperienceUpdated === 'function') onExperienceUpdated(expIdNotify, found);
                                } catch (e) { /**/ }
                                try { await savePdfUrlToExperience(found); } catch(e){ console.debug('No se pudo guardar url en la experiencia', e); }
                                return found;
                            }
                        }
                    } catch (e) {
                        // ignore individual polling errors
                    }
                    await new Promise(res => setTimeout(res, delayMs));
                }
            }

        } finally {
            setIsUrlLoading(false);
        }
        return null;
    };

    const handleCloseModal = () => {
        setShowModal(false); // Cierra el modal
        setEvaluationResult(null); // Limpia el resultado de la evaluación
        // Si el padre proporcionó una función onClose, la llamamos para cerrar el modal padre también
        if (onClose) onClose();
    };

    // local PDF modal handlers removed; parent `Experiences` shows the PDF card

    // Botón manual para forzar la generación/obtención del PDF (útil para depuración)
    const handleGenerateClick = async () => {
        setLastGenerateMessage(null);
        const evalId = form.evaluationId || null;
        if (!evalId) {
            setLastGenerateMessage('No hay evaluationId disponible');
            return;
        }
        setIsUrlLoading(true);
        try {
            console.debug('Usuario disparó generación de PDF para id=', evalId);
            const url = await fetchEvaluationUrl(evalId);
            if (url) {
                setLastGenerateMessage('URL obtenida correctamente');
            } else {
                setLastGenerateMessage('No se obtuvo URL; revisa Network/Console para ver la respuesta del backend');
            }
        } catch (e: any) {
            console.error('Error al forzar generación:', e);
            setLastGenerateMessage(`Error: ${e?.message || e}`);
        } finally {
            setIsUrlLoading(false);
        }
    };

    return (
        <div
            className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8 mx-auto custom-scrollbar-transparent"
            style={{
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                minHeight: '300px',
                boxSizing: 'border-box',
            }}
        >
            
            {/* Botón X para cerrar el formulario principal */}
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'transparent',
                        border: 'none',
                        fontSize: 28,
                        cursor: 'pointer',
                        color: '#888',
                        zIndex: 20
                    }}
                    aria-label="Cerrar formulario"
                >
                    ×
                </button>
            )}
            {activeStep === 0 && (
                <>
                    <h1 className="text-4xl font-bold !text-[#00aaff]  text-center mt-8">
                        Formulario de Evaluación de Experiencias Significativas
                    </h1>
                </>
            )}

            <div className="mt-8">
                {activeStep === 0 && (
                    <EvaluatorInfo
                        value={form}
                        onChange={handleChange}
                        errors={errors} // Pasar errores como props
                    />
                )}
                {activeStep === 1 && (
                    <ExperienceInfo
                        value={form}
                        onChange={handleChange}
                        errors={errors}
                    />
                )}
                {activeStep === 2 && <CriterioPertinencia value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 3 && <CriteriaFoundation value={form} onChange={handleChange}
                errors={errors} />}
                {activeStep === 4 && <CriteriaInnovation value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 5 && <CriteriaResults value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 6 && <CriteriaEmpowerment value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 7 && <CriteriaMonitoring value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 8 && <CriteriaTransformation value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 9 && <CriteriaSustainability value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 10 && <CriteriaTransfer value={form} onChange={handleChange} errors={errors} />}
                {activeStep === 11 && <CriteriaFinalConcept value={form} onChange={handleChange} />}
            </div>
            <div className="flex justify-between mt-8">
                <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">Atrás</Button>
                {activeStep < steps.length - 1 ? (
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        color="primary"
                    >
                        Siguiente
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} variant="contained" color="success" disabled={isSaving}>
                        {isSaving ? "Enviando..." : "Enviar"}
                    </Button>
                )}
            </div>
            {error && <div className="text-red-500 text-center mt-4">{error}</div>}

            {/* Modal para mostrar el resultado de la evaluación */}
            <Modal open={showModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        
                    }}
                >
                    {/* Botón X para cerrar */}
                    <button
                        onClick={handleCloseModal}
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'transparent',
                            border: 'none',
                            fontSize: 20,
                            cursor: 'pointer',
                            color: '#888',
                            zIndex: 10
                        }}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                    <h2 className="text-xl font-bold text-center mt-2 mb-2">Resultado de la Evaluación</h2>
                    <p className="text-center text-green-500 font-semibold mb-2">{evaluationResult}</p>
                    {isUrlLoading ? (
                        <p className="text-center text-gray-600 mt-2">Generando PDF...</p>
                    ) : (
                        <div className="text-center mt-2">
                            <p className="text-sm text-gray-700 mb-3">PDF generado correctamente.</p>
                            <Button variant="contained" color="primary" onClick={handleCloseModal} sx={{ fontSize: 14, px: 3, py: 1, borderRadius: 1 }}>
                                Cerrar
                            </Button>
                        </div>
                    )}
                </Box>
            </Modal>
            {/* PDF preview moved to parent `Experiences` component; no local PDF modal here */}
        </div>
    );
}

export default Evaluation;