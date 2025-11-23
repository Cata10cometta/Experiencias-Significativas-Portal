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
    // Nuevo: buscar urlEvaPdf desde /api/Evaluation/getAll
    useEffect(() => {
        if (!experienceId) return;
        const fetchPdfFromGetAll = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
                const url = `${API_BASE}/api/Evaluation/getAll`;
                const token = localStorage.getItem('token');
                const res = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
                if (!res.ok) return;
                const data = await res.json();
                if (data && Array.isArray(data.data)) {
                    const found = data.data.find((ev: any) => Number(ev.experienceId) === Number(experienceId) && ev.urlEvaPdf && typeof ev.urlEvaPdf === 'string' && ev.urlEvaPdf.trim());
                    if (found) {
                        setEvaluationUrl(found.urlEvaPdf);
                        setForm(prev => ({ ...prev, urlEvaPdf: found.urlEvaPdf }));
                    }
                }
            } catch (err) {
                // ignora error
            }
        };
        fetchPdfFromGetAll();
    }, [experienceId]);
    const [activeStep, setActiveStep] = useState(0);
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
        criteriaEvaluations: [],
        thematicLineNames: [],
        userId: Number(localStorage.getItem("userId")) || 0
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

    // Note: saving the PDF URL into the Experience entity has been removed per request.
    // Si se proporciona experienceId, intentar obtener una evaluación existente
    useEffect(() => {
        const fetchExistingEvaluation = async () => {
            if (!experienceId) return;
            const token = localStorage.getItem("token");
            try {
                // Intentar distintas rutas comunes para obtener la evaluación por experiencia.
                // Si tu backend tiene otra ruta, ajusta aquí.
                const urlsToTry = [
                    `/api/Evaluation/getByExperience/${experienceId}`,
                    `/api/Evaluation/by-experience/${experienceId}`,
                    `/api/Evaluation/${experienceId}`, // fallback single
                    `/api/Evaluation/List`, // try list endpoint and filter client-side
                    `/api/Evaluation` // try generic list endpoint
                ];

                let resp = null;
                for (const url of urlsToTry) {
                    try {
                        resp = await axios.get(url, {
                            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                        });
                        if (resp && resp.status === 200 && resp.data) break;
                    } catch (e: any) {
                        // continuar al siguiente intento si 404 u otro error manejable
                        resp = null;
                    }
                }

                if (resp && resp.data) {
                    console.debug("Respuesta fetchExistingEvaluation:", resp.data);
                    let existing: any = resp.data;

                    // Si la respuesta es un array (lista), buscar la evaluación que coincida con experienceId
                    if (Array.isArray(existing)) {
                        existing = existing.find((e: any) => {
                            return (
                                e.experienceId === experienceId ||
                                e.ExperienceId === experienceId ||
                                e.experienceID === experienceId ||
                                e.ExperienceID === experienceId
                            );
                        }) || null;
                    }

                    if (existing) {
                        console.debug("Evaluación encontrada para experienceId=", experienceId, existing);
                        // Extraer posible URL ya guardada en la evaluación (normalizamos a UrlEvaPdf/urlEvaPdf)
                        const candidateUrl = existing?.UrlEvaPdf || existing?.urlEvaPdf || null;
                        // Rellenar el form con la evaluación existente y activar modo edición
                        setForm(prev => ({
                            ...prev,
                            ...existing,
                            // asegurar que experienceId y userId queden correctos
                            experienceId: existing.experienceId ?? existing.ExperienceId ?? prev.experienceId,
                            userId: existing.userId ?? existing.UserId ?? prev.userId,
                            ...(candidateUrl ? { urlEvaPdf: candidateUrl } : {}),
                        }));
                        if (candidateUrl) setEvaluationUrl(candidateUrl);
                        setIsEditing(true);
                    } else {
                        console.debug("No se encontró evaluación para experienceId=", experienceId);
                        setIsEditing(false);
                    }
                } else {
                    console.debug("No se obtuvo data al consultar posibles endpoints para evaluation");
                    setIsEditing(false);
                }
            } catch (err) {
                // No bloquear la UX si falla la comprobación: permitimos crear nueva evaluación
                console.warn("No se pudo comprobar evaluación existente:", err);
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

    const handleChange = (changes: Partial<Evaluation>) => {
        setForm((prev) => ({ ...prev, ...changes }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        setError(null);
        const token = localStorage.getItem("token");
        const userId = Number(localStorage.getItem("userId")) || 0;
        const formToSend = { ...form, userId };
        console.log("Formulario a enviar:", formToSend);
        try {
            if (isEditing && form.evaluationId && form.evaluationId > 0) {
                // Actualizar evaluación existente
                const response = await axios.put(`/api/Evaluation/update/${form.evaluationId}`, formToSend, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                const result = response?.data?.evaluationResult ?? response?.data?.message ?? "Actualizado correctamente";
                setEvaluationResult(result);
                setShowModal(true);

                // intentar obtener la URL usando el id de la evaluación
                const evalId = form.evaluationId || response?.data?.evaluationId || response?.data?.id || response?.data?.Id;
                if (evalId) await fetchEvaluationUrl(evalId);
            } else {
                // Antes de crear, verificar de nuevo si ya existe una evaluación para esta experiencia
                // (caso en que la comprobación inicial falló o el form no tenía evaluationId)
                if (form.experienceId) {
                    try {
                        const existingId = await locateCreatedEvaluationId(form.experienceId);
                        if (existingId && existingId > 0) {
                            // Si encontramos una evaluación existente, actualizarla en lugar de crear otra
                            const respUpdate = await axios.put(`/api/Evaluation/update/${existingId}`, formToSend, {
                                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                            });

                            const resultUpd = respUpdate?.data?.evaluationResult ?? respUpdate?.data?.message ?? "Actualizado correctamente";
                            setEvaluationResult(resultUpd);
                            setShowModal(true);
                            // asegurar estado
                            setForm(prev => ({ ...prev, evaluationId: existingId }));
                            setIsEditing(true);
                            // intentar obtener la URL usando el id de la evaluación
                            const evalId = existingId || respUpdate?.data?.evaluationId || respUpdate?.data?.id || respUpdate?.data?.Id;
                            if (evalId) await fetchEvaluationUrl(evalId);
                            // salimos del flujo de creación
                            setIsSaving(false);
                            return;
                        }
                    } catch (e) {
                        console.debug('Error comprobando evaluación existente antes de crear:', e);
                        // continuar con la creación si la comprobación falla
                    }
                }

                // Crear nueva evaluación
                const response = await axios.post("/api/Evaluation/create", formToSend, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                // si el backend retorna el id creado, actualizar el estado para permitir posteriores updates
                if (response?.data?.evaluationId) {
                    setForm(prev => ({ ...prev, evaluationId: response.data.evaluationId }));
                    setIsEditing(true);
                }

                const result = response?.data?.evaluationResult ?? response?.data?.message ?? "Creado correctamente";
                setEvaluationResult(result);
                setShowModal(true);

                // determinar id de la evaluación (puede venir en distintos campos)
                let createdId = response?.data?.evaluationId || response?.data?.id || response?.data?.Id || form.evaluationId || 0;

                // Si el backend no devolvió el id directamente, intentar extraerlo de la cabecera Location
                const locationHeader = response?.headers?.location || response?.headers?.Location;
                if ((!createdId || createdId === 0) && locationHeader) {
                    try {
                        console.debug('Location header presente en la respuesta:', locationHeader);
                        const match = String(locationHeader).match(/\/(\d+)(?:\/?$|\D.*$)/);
                        if (match && match[1]) {
                            const parsed = Number(match[1]);
                            if (!isNaN(parsed) && parsed > 0) {
                                createdId = parsed;
                                console.debug('Id obtenido desde Location header:', createdId);
                            }
                        }
                    } catch (e) {
                        console.debug('No se pudo parsear Location header', e);
                    }
                }

                // Si aún no hay id, intentar localizar la evaluación creada por experienceId
                if ((!createdId || createdId === 0) && form.experienceId) {
                    try {
                        // pasar una huella (userId + campos clave) para mejorar el match
                        const match = {
                            userId: form.userId || userId,
                            comments: form.comments,
                            accompanimentRole: form.accompanimentRole,
                            typeEvaluation: form.typeEvaluation
                        };
                        const foundId = await locateCreatedEvaluationId(form.experienceId, match);
                        if (foundId && foundId > 0) createdId = foundId;
                    } catch (e) {
                        console.debug('Error buscando evaluación por experienceId', e);
                    }
                }

                if (createdId && createdId !== 0) {
                    // asegurar que el form tenga el id
                    setForm(prev => ({ ...prev, evaluationId: createdId }));
                    setIsEditing(true);
                    await fetchEvaluationUrl(createdId);
                } else {
                    console.warn('No se pudo determinar el id de la evaluación creada. Response:', response?.data);
                    setLastGenerateMessage('Creado pero no se pudo obtener el id automáticamente. Reintenta generar el PDF.');
                }
            }
        } catch (err) {
            console.error("Error al guardar evaluación:", err);
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

    // Prefer the single generate endpoint: POST to /api/Evaluation/generate-pdf with JSON body { evaluationId }
    const envBase = (import.meta.env.VITE_API_BASE_URL as string) || "https://localhost:7263";
    const token = localStorage.getItem("token");
    try {
        try {
            const full = `${envBase.replace(/\/$/, '')}/api/Evaluation/generate-pdf`;
            console.debug('Intentando POST absoluto a generate-pdf (single endpoint):', full, { evaluationId });
            const resp = await axios.post(full, { evaluationId }, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } });
                if (resp && resp.status >= 200 && resp.status < 300 && resp.data) {
                const data = resp.data;
                const foundUrl = typeof data === 'string' && data.startsWith('http') ? data : (data?.UrlEvaPdf || data?.urlEvaPdf || data?.url || data?.pdfUrl || data?.resultUrl || data?.data?.url);
                if (foundUrl) {
                    setEvaluationUrl(foundUrl);
                    setForm(prev => ({ ...(prev as any), urlEvaPdf: foundUrl }));
                    console.debug('URL recibida (absolute single POST):', foundUrl);
                    try {
                        const expIdNotify = form.experienceId || experienceId || 0;
                        if (expIdNotify && typeof onExperienceUpdated === 'function') onExperienceUpdated(expIdNotify, foundUrl);
                    } catch (e) { /**/ }
                    return foundUrl;
                }
            }
        } catch (e) {
            console.debug('POST absoluto a generate-pdf (single endpoint) falló, probando con configApi/relativo', e);
        }

        // 2) Intentar con la instancia configurada del API (usa baseURL + token interceptor)
        try {
            console.debug('Intentando POST con configApi a generate-pdf (relativo)');
            const resp2 = await configApi.post(`Evaluation/generate-pdf`, { evaluationId });
                if (resp2 && resp2.status >= 200 && resp2.status < 300 && resp2.data) {
                const data = resp2.data;
                const foundUrl = typeof data === 'string' && data.startsWith('http') ? data : (data?.UrlEvaPdf || data?.urlEvaPdf || data?.url || data?.pdfUrl || data?.resultUrl || data?.data?.url);
                if (foundUrl) {
                    setEvaluationUrl(foundUrl);
                    setForm(prev => ({ ...(prev as any), urlEvaPdf: foundUrl }));
                    console.debug('URL recibida (configApi POST):', foundUrl);
                        try {
                            const expIdNotify = form.experienceId || experienceId || 0;
                            if (expIdNotify && typeof onExperienceUpdated === 'function') onExperienceUpdated(expIdNotify, foundUrl);
                        } catch (e) { /**/ }
                        // per-request: do not save URL into Experience here
                        return foundUrl;
                    }
                }
            } catch (e) {
                console.debug('configApi POST generate-pdf no devolvió URL o falló, se intentará GET/polling', e);
            }

            // 3) Intentar GET relativo directo (Vite proxy) a la misma ruta
            try {
                console.debug('Intentando POST relativo a /api/Evaluation/generate-pdf via axios');
                const resp3 = await axios.post(`/api/Evaluation/generate-pdf`, { evaluationId }, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } });
                    if (resp3 && resp3.status >= 200 && resp3.status < 300 && resp3.data) {
                    const data = resp3.data;
                    const foundUrl = typeof data === 'string' && data.startsWith('http') ? data : (data?.UrlEvaPdf || data?.urlEvaPdf || data?.url || data?.pdfUrl || data?.resultUrl || data?.data?.url);
                    if (foundUrl) {
                        setEvaluationUrl(foundUrl);
                        setForm(prev => ({ ...(prev as any), urlEvaPdf: foundUrl }));
                        console.debug('URL recibida (relative POST):', foundUrl);
                        try {
                            const expIdNotify = form.experienceId || experienceId || 0;
                            if (expIdNotify && typeof onExperienceUpdated === 'function') onExperienceUpdated(expIdNotify, foundUrl);
                        } catch (e) { /**/ }
                        // per-request: do not save URL into Experience here
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
                        const found = typeof d === 'string' && d.startsWith('http') ? d : (d?.UrlEvaPdf || d?.urlEvaPdf || d?.url || d?.pdfUrl || d?.resultUrl || d?.data?.url);
                        if (found) {
                            setEvaluationUrl(found);
                            setForm(prev => ({ ...(prev as any), urlEvaPdf: found }));
                            console.debug('URL encontrada en candidato GET:', url, found);
                            try {
                                const expIdNotify = form.experienceId || experienceId || 0;
                                if (expIdNotify && typeof onExperienceUpdated === 'function') onExperienceUpdated(expIdNotify, found);
                            } catch (e) { /**/ }
                            // per-request: do not save URL into Experience here
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
                            const found = d?.UrlEvaPdf || d?.urlEvaPdf || d?.url || d?.pdfUrl || d?.Url || d?.urlPdf || d?.data?.url;
                            if (found) {
                                setEvaluationUrl(found);
                                setForm(prev => ({ ...(prev as any), urlEvaPdf: found }));
                                console.debug('URL encontrada por polling en', pollUrl, 'attempt', attempt, found);
                                try {
                                    const expIdNotify = form.experienceId || experienceId || 0;
                                    if (expIdNotify && typeof onExperienceUpdated === 'function') onExperienceUpdated(expIdNotify, found);
                                } catch (e) { /**/ }
                                // per-request: do not save URL into Experience here
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

        // Abrir URL de PDF respetando token (intenta descargar con Authorization y abrir blob)
        const openPdfWithAuth = async (raw?: string | null) => {
            if (!raw) return;
            const token = localStorage.getItem('token');
            try {
                // data URI -> abrir directamente
                if (String(raw).startsWith('data:')) {
                    const w = window.open(String(raw), '_blank');
                    if (!w) {
                        const a = document.createElement('a');
                        a.href = String(raw);
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                    }
                    return;
                }

                // intentar fetch con Authorization si hay token
                if (token) {
                    try {
                        const envBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
                        const full = (/^https?:\/\//i.test(String(raw)) ? String(raw) : (envBase ? `${envBase.replace(/\/$/, '')}${String(raw).startsWith('/') ? String(raw) : '/' + String(raw)}` : String(raw)));
                        const resp = await fetch(full, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                        if (resp && resp.ok) {
                            const blob = await resp.blob();
                            const url = URL.createObjectURL(blob);
                            const w = window.open(url, '_blank');
                            if (!w) {
                                const a = document.createElement('a');
                                a.href = url;
                                a.target = '_blank';
                                a.rel = 'noopener noreferrer';
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                            }
                            // liberar URL después
                            setTimeout(() => URL.revokeObjectURL(url), 15000);
                            return;
                        }
                    } catch (e) {
                        // ignore and fallback to open raw
                        console.debug('openPdfWithAuth fetch failed, falling back to open raw', e);
                    }
                }

                // fallback: abrir directamente
                const opened = window.open(String(raw), '_blank');
                if (!opened) {
                    const a = document.createElement('a');
                    a.href = String(raw);
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }
            } catch (err) {
                console.error('openPdfWithAuth error', err);
            }
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
        <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-md p-8 mx-auto max-h-[85vh] overflow-y-auto">
            <button
                type="button"
                aria-label="Cerrar evaluación"
                className="absolute top-3 right-3 text-4xl leading-none text-gray-600 hover:text-gray-900"
                onClick={() => { if (onClose) onClose(); else handleCloseModal(); }}
            >
                ×
            </button>
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

            {/* Overlay inline para mostrar el resultado de la evaluación (alto z-index para sobreponer al modal padre) */}
            {showModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setShowModal(false); if (onClose) onClose(); }} />
                    <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
                        <button
                            type="button"
                            aria-label="Cerrar resultado"
                            className="absolute top-2 right-3 text-2xl leading-none text-gray-600 hover:text-gray-900"
                            onClick={() => { setShowModal(false); if (onClose) onClose(); }}
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold text-center mb-4">Resultado de la Evaluación</h2>
                        <p className="text-center text-green-500 font-semibold">{evaluationResult ?? 'Evaluación registrada correctamente'}</p>
                        {isUrlLoading ? (
                            <p className="text-center text-gray-600 mt-2">Obteniendo documento...</p>
                        ) : (
                            evaluationUrl ? (
                                <div className="text-center mt-4">
                                        <p className="text-sm text-gray-700">El PDF se ha generado. Aparecerá en la tarjeta de la experiencia en esta pantalla.</p>
                                        <div className="flex justify-center mt-3 gap-3">
                                            <Button variant="contained" color="primary" onClick={() => openPdfWithAuth(evaluationUrl)}>
                                                Ver PDF
                                            </Button>
                                            <Button variant="contained" color="primary" onClick={handleCloseModal}>
                                                Cerrar
                                            </Button>
                                        </div>
                                    </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 mt-4">
                                    <div className="flex gap-3">
                                        <Button variant="contained" color="primary" onClick={handleGenerateClick} disabled={isUrlLoading}>
                                            {isUrlLoading ? 'Generando...' : 'Generar PDF'}
                                        </Button>
                                        <Button variant="contained" color="primary" onClick={handleCloseModal}>
                                            Cerrar
                                        </Button>
                                    </div>
                                    {lastGenerateMessage && (
                                        <p className="text-sm text-center text-gray-600 mt-2">{lastGenerateMessage}</p>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
            {/* PDF preview moved to parent `Experiences` component; no local PDF modal here */}
        </div>
    );
}

export default Evaluation;