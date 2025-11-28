// Emitir notificación tras crear experiencia
async function notifyExperienceCreated(experienceId: number | null | undefined) {
  if (!experienceId || !Number.isFinite(experienceId)) {
    console.warn('notifyExperienceCreated skipped because experienceId is invalid', experienceId);
    return;
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_BASE}/api/Notifications/experience-created`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ experienceId }),
    });

    if (!res.ok) {
      const message = await res.text().catch(() => `HTTP ${res.status}`);
      console.error('notifyExperienceCreated failed', res.status, message);
    }
  } catch (err) {
    console.error('notifyExperienceCreated exception', err);
  }
}
// Utilidad para obtener el userId del token o localStorage
export function getUserId(token?: string | null) {
  let userId = null;
  const parseJwt = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };
  if (token) {
    const claims = parseJwt(token);
    userId = claims?.id || claims?.userId || claims?.sub || null;
  }
  if (!userId) {
    const storedUserId = Number(localStorage.getItem('userId'));
    if (storedUserId && Number.isFinite(storedUserId) && storedUserId > 0) userId = storedUserId;
  }
  return typeof userId === 'string' ? Number(userId) : userId;
}

// Función para construir el payload genérico con todos los campos requeridos
export function buildExperiencePayload({
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
}: any) {
  // Mapear leaders (siempre array, aunque vacío)
  const leaders = Array.isArray(lideres)
    ? lideres.map((l: any) => ({
        nameLeaders: l.nameLeaders || l.name || '',
        identityDocument: l.identityDocument || '',
        email: l.email || '',
        position: l.position || '',
        phone: l.phone || 0,
      }))
    : [];
  // Mapear grados seleccionados a array de objetos { id, code, name, description } (siempre array)
  const nivelesArray = Object.values(nivelesForm?.niveles || {});
  const gradesUpdate = Array.isArray(nivelesArray)
    ? nivelesArray
        .flatMap((nivel: any) => nivel.grados)
        .filter((g: any) => g && typeof g.gradeId === 'number')
        .map((g: any) => ({
          id: g.gradeId,
          code: g.code || '',
          name: g.name || '',
          description: g.description || ''
        }))
    : [];
  // Formatear developmenttime a string ISO 8601 o null
  let devTime = initialData?.developmenttime || '';
  if (devTime) {
    if (typeof devTime === 'string') {
      const parsed = new Date(devTime);
      devTime = isNaN(parsed.getTime()) ? null : parsed.toISOString();
    } else if (devTime instanceof Date) {
      devTime = isNaN(devTime.getTime()) ? null : devTime.toISOString();
    } else {
      devTime = null;
    }
  } else {
    devTime = null;
  }
  // InstitutionUpdate: siempre objeto (aunque vacío)
  const institutionUpdate = (identificacionInstitucional && typeof identificacionInstitucional === 'object') ? identificacionInstitucional : {};
  // DevelopmentsUpdate: siempre array
  const developmentsUpdate = Array.isArray(tematicaForm?.developments) ? tematicaForm.developments : [];
  // DocumentsUpdate: siempre array
  const documentsUpdate = Array.isArray(initialData?.documents) ? initialData.documents : [];
  // ObjectivesUpdate: siempre array
  const objectivesUpdate = Array.isArray(initialData?.objectives) ? initialData.objectives : [];
  // ThematicLineIds: siempre array
  const thematicLineIds = Array.isArray(tematicaForm?.thematicLineIds) ? tematicaForm.thematicLineIds : [];
  // PopulationGradeIds: siempre array
  const populationGradeIds = Array.isArray(tematicaForm?.populationGradeIds) ? tematicaForm.populationGradeIds : [];
  // HistoryExperiencesUpdate: siempre array
  const historyExperiencesUpdate = Array.isArray(initialData?.historyExperiences) ? initialData.historyExperiences : [];
  // Refuerzo: si algún campo es undefined/null, forzar array vacío u objeto vacío
  const safe = (v: any, fallback: any) => (v === undefined || v === null ? fallback : v);
  // Construir el objeto anidado bajo 'request' con TODOS los campos requeridos SIEMPRE presentes
  // Alternar entre PascalCase y camelCase para los campos requeridos
  // Forzar camelCase y nunca undefined en campos requeridos
  // Permitir id o experienceId
  const experienceId = typeof initialData?.id === 'number' && Number.isFinite(initialData.id)
    ? initialData.id
    : (typeof initialData?.experienceId === 'number' && Number.isFinite(initialData.experienceId)
      ? initialData.experienceId
      : 0);
  return {
    request: {
      experienceId,
      nameExperiences: identificacionForm?.nameExperience || initialData?.nameExperiences || '',
      code: initialData?.code || '',
      thematicLocation: identificacionForm?.thematicLocation || initialData?.thematicLocation || '',
      developmenttime: devTime ?? '',
      recognition: initialData?.recognition || '',
      socialization: initialData?.socialization || '',
      stateExperienceId: typeof initialData?.stateExperienceId === 'number' && Number.isFinite(initialData.stateExperienceId) ? initialData.stateExperienceId : 0,
      userId: typeof userId === 'number' && Number.isFinite(userId) ? userId : 0,
      leaders: safe(leaders, []),
      institutionUpdate: safe(institutionUpdate, {}),
      gradesUpdate: safe(gradesUpdate, []),
      documentsUpdate: safe(documentsUpdate, []),
      thematicLineIds: safe(thematicLineIds, []),
      objectivesUpdate: safe(objectivesUpdate, []),
      developmentsUpdate: safe(developmentsUpdate, []),
      populationGradeIds: safe(populationGradeIds, []),
      historyExperiencesUpdate: safe(historyExperiencesUpdate, []),
      followUpUpdate: safe(seguimientoEvaluacion, {}),
      supportInfoUpdate: safe(informacionApoyo, {}),
      componentsUpdate: [],
    }
  };
}
import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import {
  handlePatchInstitutional,
  handlePatchLeaders,
  handlePatchIdentification,
  handlePatchThematic,
  handlePatchComponents,
  handlePatchFollowUp,
  handlePatchSupportInfo,
  handlePatchDocuments
} from '../services/patchExperience';
import { getToken } from "../../../Api/Services/Auth";
import { UpdateExperienceRequest } from '../types/updateExperience';
import LeadersForm from "./LeadersForm";
import IdentificationForm from "./IdentificationForm";
import ThematicForm from "./ThematicForm";
import InstitutionalIdentification from "./InstitutionalIdentification";
import FormSection from "./ui/FormSection";
import Components from "./Components";
import FollowUpEvaluation from "./FollowUpEvaluation";
import SupportInformationForm from "./SupportInformationForm";
import PDFUploader from "./PDF";

import type { Grade } from "../types/experienceTypes";

interface AddExperienceProps {
  onVolver?: () => void;
  initialData?: any;
  readOnly?: boolean;
  disableValidation?: boolean;
  showBackButton?: boolean;
  editMode?: boolean;
}

const AddExperience: React.FC<AddExperienceProps> = ({ onVolver, initialData = null, readOnly = false, disableValidation = false, showBackButton = true, editMode = false }) => {
    // Guardar toda la experiencia en modo edición global
    const handlePatchAll = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
        const endpoint = `${API_BASE}/api/Experience/patch`;
        const token = localStorage.getItem('token') || getToken?.();
        let experienceId = 0;
        if (typeof initialData?.id === 'number' && Number.isFinite(initialData.id)) {
          experienceId = initialData.id;
        } else if (typeof initialData?.experienceId === 'number' && Number.isFinite(initialData.experienceId)) {
          experienceId = initialData.experienceId;
        } else if (typeof initialData?.experienceId === 'string' && initialData.experienceId !== '' && !isNaN(Number(initialData.experienceId))) {
          experienceId = Number(initialData.experienceId);
        } else if (typeof initialData?.id === 'string' && initialData.id !== '' && !isNaN(Number(initialData.id))) {
          experienceId = Number(initialData.id);
        }
        if (!experienceId) {
          Swal.fire({ icon: 'error', title: 'Error', text: `No se encontró el ID de la experiencia. initialData: ${JSON.stringify(initialData)}` });
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
        // Mostrar en consola el endpoint y el payload
        console.log('[PATCH experiencia] Endpoint:', endpoint);
        console.log('[PATCH experiencia] Payload:', payload);
        const res = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload.request),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          Swal.fire({ icon: 'error', title: 'Error', text: text || 'No se pudo guardar los cambios.' });
          return;
        }
        Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Cambios guardados correctamente.' });
        if (onVolver) onVolver();
      } catch (err: any) {
        const msg = err?.message ?? (typeof err === 'string' ? err : (err && typeof err.toString === 'function' ? err.toString() : 'Error al guardar.'));
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      }
    };
  // Estado para saber qué sección está en modo edición
  const [editSection, setEditSection] = useState<number | null>(null);

  // Handlers para guardar cambios por sección (stubs, implementar PATCH luego)
  const onPatchInstitutional = async () => {
    await handlePatchInstitutional({
      initialData,
      identificacionForm,
      identificacionInstitucional,
      lideres,
      nivelesForm,
      tematicaForm,
      seguimientoEvaluacion,
      informacionApoyo,
      pdfFile
    });
    setEditSection(null);
  };
  const onPatchLeaders = async () => {
    await handlePatchLeaders({
      initialData,
      identificacionForm,
      identificacionInstitucional,
      lideres,
      nivelesForm,
      tematicaForm,
      seguimientoEvaluacion,
      informacionApoyo,
      pdfFile
    });
    setEditSection(null);
  };
  const onPatchIdentification = async () => {
    await handlePatchIdentification({
      initialData,
      identificacionForm,
      identificacionInstitucional,
      lideres,
      nivelesForm,
      tematicaForm,
      seguimientoEvaluacion,
      informacionApoyo,
      pdfFile
    });
    setEditSection(null);
  };
  const onPatchThematic = async () => {
    await handlePatchThematic({
      initialData,
      identificacionForm,
      identificacionInstitucional,
      lideres,
      nivelesForm,
      tematicaForm,
      seguimientoEvaluacion,
      informacionApoyo,
      pdfFile
    });
    setEditSection(null);
  };
  const onPatchComponents = async () => {
    await handlePatchComponents({
      initialData,
      identificacionForm,
      identificacionInstitucional,
      lideres,
      nivelesForm,
      tematicaForm,
      seguimientoEvaluacion,
      informacionApoyo,
      pdfFile
    });
    setEditSection(null);
  };
  const onPatchFollowUp = async () => {
    await handlePatchFollowUp({
      initialData,
      identificacionForm,
      identificacionInstitucional,
      lideres,
      nivelesForm,
      tematicaForm,
      seguimientoEvaluacion,
      informacionApoyo,
      pdfFile
    });
    setEditSection(null);
  };
  const onPatchSupportInfo = async () => {
    await handlePatchSupportInfo({
      initialData,
      identificacionForm,
      identificacionInstitucional,
      lideres,
      nivelesForm,
      tematicaForm,
      seguimientoEvaluacion,
      informacionApoyo,
      pdfFile
    });
    setEditSection(null);
  };
  const onPatchDocuments = async () => {
    await handlePatchDocuments({
      initialData,
      identificacionForm,
      identificacionInstitucional,
      lideres,
      nivelesForm,
      tematicaForm,
      seguimientoEvaluacion,
      informacionApoyo,
      pdfFile
    });
    setEditSection(null);
  };
  const [errorMessage, setErrorMessage] = useState("");
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Estados principales
  const [formData] = useState({
    nameExperiences: "",
    summary: "",
    methodologias: "",
    tranfer: "",
    code: "",
    developmenttime: "",
    recognition: "",
    socialization: "",
    themeExperienceArea: "",
    coordinationTransversalProjects: "",
    pedagogicalStrategies: "",
    coverage: "",
    experiencesCovidPandemic: "",
    userId: 0,
    institucionId: 0,
    stateId: 0,
    thematicLineIds: [] as number[],
    gradeIds: [] as number[],
    populationGradeIds: [] as number[],
    documents: [] as any[],
    objectives: [] as any[],
    historyExperiences: [] as any[],
  });

  


  // Estados de subformularios
  const [lideres, setLideres] = useState<any[]>([{}]); // Solo 1 líder
  const [identificacionForm, setIdentificacionForm] = useState<any>({
    estado: "",
    ubicaciones: [],
    otroTema: "",
    thematicLocation: "",
    nameExperience: "",
    development: { days: "", months: "", years: "" },
    thematicFocus: "",
  });
  const [tematicaForm, setTematicaForm] = useState<any>({
    thematicLineIds: [],
    PedagogicalStrategies: "",
    CrossCuttingProject: [],
    Coverage: "",
    population: [],
    experiencesCovidPandemic: ""
  });
  const [nivelesForm, setNivelesForm] = useState<any>({
    niveles: {
      Primaria: { checked: false, grados: [] },
      Secundaria: { checked: false, grados: [] },
      Media: { checked: false, grados: [] }
    },
  });
  const [grupoPoblacional, setGrupoPoblacional] = useState<number[]>([]);

  // Sincroniza grupoPoblacional con populationGradeIds de tematicaForm
  useEffect(() => {
    if (Array.isArray(tematicaForm.populationGradeIds)) {
      setGrupoPoblacional(tematicaForm.populationGradeIds);
    }
  }, [tematicaForm.populationGradeIds]);
  const [tiempo, setTiempo] = useState<any>({});
  const [objectiveExperience, setObjectiveExperience] = useState<any>({});
  const [seguimientoEvaluacion, setSeguimientoEvaluacion] = useState<any>({});
  const [informacionApoyo, setInformacionApoyo] = useState<any>({});
  const [identificacionInstitucional, setIdentificacionInstitucional] = useState<any>({});
  const [pdfFile, setPdfFile] = useState<any>({});

  // hydrate states when initialData is provided (used for view/edit existing experience)
  useEffect(() => {
    if (!initialData) return;
    try {
      if (initialData.leaders) setLideres(initialData.leaders);
      if (initialData.identificacionForm) setIdentificacionForm(initialData.identificacionForm);
      if (initialData.tematicaForm) setTematicaForm(initialData.tematicaForm);
      if (initialData.nivelesForm) setNivelesForm(initialData.nivelesForm);
      if (initialData.grupoPoblacional) setGrupoPoblacional(initialData.grupoPoblacional);
      if (initialData.tiempo) setTiempo(initialData.tiempo);
      if (initialData.objectiveExperience) setObjectiveExperience(initialData.objectiveExperience);
      if (initialData.seguimientoEvaluacion) setSeguimientoEvaluacion(initialData.seguimientoEvaluacion);
      if (initialData.informacionApoyo) setInformacionApoyo(initialData.informacionApoyo);
      if (initialData.identificacionInstitucional) setIdentificacionInstitucional(initialData.identificacionInstitucional);
      if (initialData.pdfFile) setPdfFile(initialData.pdfFile);
      if (initialData.documents && Array.isArray(initialData.documents) && initialData.documents.length > 0) setPdfFile(initialData.documents[0]);
    } catch (err) {
      console.warn('AddExperience hydrate initialData failed', err);
    }
  }, [initialData]);

  // Asegurar que el campo `thematicFocus` (id) esté también disponible en `identificacionForm`
  // porque el componente IdentificationForm lo espera en `value.thematicFocus`.
  useEffect(() => {
    if (!initialData) return;
    try {
      const tf = initialData.tematicaForm?.thematicFocus ?? undefined;
      if (tf !== undefined && tf !== null) {
        setIdentificacionForm((prev: any) => ({ ...(prev || {}), thematicFocus: tf }));
      }
    } catch (e) {
      // noop
    }
  }, [initialData]);

  const steps: string[] = [
    "Identificación Institucional",
    "Líder",
    "Identificación Experiencia",
    "Temática y Desarrollo",
    "Componentes",
    "Testimonios / Soportes",
    "Monitoreos",
    "Documentos",
  ];

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();


    // 2) GRADES -> convertimos nivelesForm a array y filtramos solo los grados válidos
    const nivelesArray: any[] = Object.values(nivelesForm.niveles);

    const grades: { gradeId: number; description: string }[] = nivelesArray
      .flatMap((nivel) => nivel.grados)
      .filter((g): g is Grade => g !== undefined && typeof g.gradeId === "number")
      .map((g) => ({
        gradeId: g.gradeId as number,
        description: g.description || "",
      }));

    // 3) POPULATION GRADE IDS
    // Prefer explicit `grupoPoblacional` state; fallback to any array provided by `tematicaForm.populationGradeIds` / `populationGrades` / `tematicaForm.population`
    const populationGradeIds = Array.isArray(grupoPoblacional)
      ? grupoPoblacional
      : Array.isArray(tematicaForm?.populationGradeIds)
      ? tematicaForm.populationGradeIds
      : Array.isArray(tematicaForm?.populationGrades)
      ? tematicaForm.populationGrades
      : Array.isArray(tematicaForm?.population)
      ? tematicaForm.population
      : [];

    // Try to convert common slug names to numeric ids the backend expects.
    const populationSlugToId: Record<string, number> = {
      negritudes: 1,
      afrodescendiente: 2,
      palenquero: 3,
      raizal: 4,
      rom_gitano: 5,
      victima_del_conflicto: 6,
      discapacidad: 7,
      talentos_excepcionales: 8,
      indigenas: 9,
      trastornos_especificos: 10,
      ninguno_de_los_anteriores: 11,
    };

    const numericPopulationGradeIds = Array.isArray(populationGradeIds)
      ? populationGradeIds
          .map((v: any) => {
            if (v === null || v === undefined) return null;
            if (typeof v === 'number') return Number.isFinite(v) ? Math.trunc(v) : null;
            if (typeof v === 'string' && v.trim() !== '') {
              const s = v.trim();
              const n = Number(s);
              if (!Number.isNaN(n) && Number.isFinite(n)) return Math.trunc(n);
              const normalized = s.toLowerCase().replace(/[^a-z0-9]+/g, '_');
              return populationSlugToId[normalized] ?? null;
            }
            if (typeof v === 'object') {
              if (v.id) return Number.isFinite(Number(v.id)) ? Math.trunc(Number(v.id)) : null;
              if (v.name) {
                const normalized = String(v.name).toLowerCase().replace(/[^a-z0-9]+/g, '_');
                return populationSlugToId[normalized] ?? null;
              }
            }
            return null;
          })
          .filter((x: any) => x !== null)
      : [];

    const stringPopulationGrades = Array.isArray(populationGradeIds)
      ? populationGradeIds
          .map((v: any) => (v === null || v === undefined ? '' : (typeof v === 'string' ? v : (typeof v === 'number' ? String(v) : (v?.name ?? v?.label ?? '')))))
          .filter((s: string) => s && s.length > 0)
      : [];

    // 4) OBJECTIVES
    const objectives = [
      {
        descriptionProblem: objectiveExperience.descriptionProblem || "",
        objectiveExperience: objectiveExperience.objectiveExperience || "",
        enfoqueExperience: objectiveExperience.enfoqueExperience || "",
        methodologias: objectiveExperience.methodologias || "",
        innovationExperience: objectiveExperience.innovationExperience || "",
        resulsExperience: seguimientoEvaluacion.resulsExperience || "",
        sustainabilityExperience: informacionApoyo.sustainabilityExperience || "",
        tranfer: seguimientoEvaluacion.tranfer || "",
        summary: seguimientoEvaluacion.summary || "",
        metaphoricalPhrase: seguimientoEvaluacion.metaphoricalPhrase || "",
        testimony: seguimientoEvaluacion.testimony || "",
        followEvaluation: seguimientoEvaluacion.followEvaluation || "",
      },
    ];

    // 5) DOCUMENTS
    const documents = pdfFile
      ? [
        {
          name: pdfFile.name || "Documento PDF",
          urlPdf: pdfFile.urlPdf || "",
          urlLink: pdfFile.urlLink || "",
        },
      ]
      : [];

    // 6) HISTORY EXPERIENCES
    const historyExperiences = [
        {
          action: "Creación",
          tableName: "Experience",
          // userId intentionally omitted: backend should derive creator from the auth token
        },
    ];

    // 7) PAYLOAD FINAL (match Swagger JSON structure)
    // Build documents[] from pdfFile: single document that contains two PDFs
    // - `urlPdf`: first PDF (pdfFile.urlPdf)
    // - `urlPdfExperience`: second PDF (pdfFile.urlPdf2)
    const documentsSwagger: any[] = [];
    if (pdfFile) {
      const stripDataPrefix = (s: any) => {
        if (!s || typeof s !== 'string') return '';
        const idx = s.indexOf(',');
        if (s.startsWith('data:') && idx > -1) return s.substring(idx + 1);
        return s;
      };

      const rawPdf = pdfFile.urlPdf || "";
      const rawPdfExperience = pdfFile.urlPdf2 || pdfFile.urlPdfExperience || "";
      const doc: any = {
        name: pdfFile.name || pdfFile.name2 || "Documento PDF",
        urlLink: pdfFile.urlLink || "",
        urlPdf: stripDataPrefix(rawPdf) || "",
        urlPdfExperience: stripDataPrefix(rawPdfExperience) || "",
        // Enviar base64 puro (sin prefijo) para ambos PDFs
        fileBase64: stripDataPrefix(rawPdf) || undefined,
        fileBase64Experience: stripDataPrefix(rawPdfExperience) || undefined,
      };
      documentsSwagger.push(doc);
    }

    // Debug: log follow-up / support states to inspect shapes
    try { console.log("seguimientoEvaluacion (state):", JSON.stringify(seguimientoEvaluacion, null, 2)); } catch (e) { console.log("seguimientoEvaluacion (raw)", seguimientoEvaluacion); }
    try { console.log("informacionApoyo (state):", JSON.stringify(informacionApoyo, null, 2)); } catch (e) { console.log("informacionApoyo (raw)", informacionApoyo); }

    // Build objectives array matching Swagger: supportInformations[] and monitorings[] inside each objective
    // Normalize inputs because some subcomponents store values as arrays (e.g., summary: [{...}]) while backend expects objects/strings
    const normalizeSupportInformation = (info: any) => {
      const empty = { summary: "", metaphoricalPhrase: "", testimony: "", followEvaluation: "" };
      if (!info) return empty;

      const coerceToString = (v: any): string => {
        if (v === undefined || v === null) return "";
        if (typeof v === 'string') return v;
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        if (Array.isArray(v)) {
          return v
            .map((x) => (typeof x === 'string' ? x : (x && typeof x === 'object' ? (x.summary ?? x.monitoringEvaluation ?? x.text ?? "") : String(x))))
            .filter(Boolean)
            .join("\n");
        }
        if (typeof v === 'object') {
          return String(v.summary ?? v.monitoringEvaluation ?? v.text ?? "");
        }
        return String(v);
      };

      const rawSummary = (() => {
        if (Array.isArray(info.summary) && info.summary.length > 0) return info.summary;
        if (info.summary !== undefined) return info.summary;
        if (info.summaryText) return info.summaryText;
        if (info.monitoringEvaluation) return info.monitoringEvaluation;
        return undefined;
      })();

      return {
        summary: coerceToString(rawSummary),
        metaphoricalPhrase: coerceToString(info.metaphoricalPhrase ?? info.metaphoricalPhraseText ?? info.metaphoricalPhraseValue),
        testimony: coerceToString(info.testimony ?? info.testimonyText),
        followEvaluation: coerceToString(info.followEvaluation ?? info.followEvaluationText),
      };
    };

    const normalizeMonitoring = (mon: any) => {
      if (!mon) return { monitoringEvaluation: "", result: "", sustainability: "", tranfer: "" };
      if (Array.isArray(mon.summary) && mon.summary.length > 0 && typeof mon.summary[0] === 'object') {
        const first = mon.summary[0];
        return {
          monitoringEvaluation: first.monitoringEvaluation ?? mon.monitoringEvaluation ?? "",
          result: first.result ?? mon.result ?? mon.resulsExperience ?? "",
          sustainability: first.sustainability ?? mon.sustainability ?? mon.sustainabilityExperience ?? "",
          tranfer: first.tranfer ?? mon.tranfer ?? "",
        };
      }
      return {
        monitoringEvaluation: mon.monitoringEvaluation || "",
        result: mon.result || mon.resulsExperience || "",
        sustainability: mon.sustainability || mon.sustainabilityExperience || "",
        tranfer: mon.tranfer || "",
      };
    };

    // Prefer FollowUpEvaluation (`seguimientoEvaluacion`) when it contains data, otherwise use `informacionApoyo`.
    const supportSource = (seguimientoEvaluacion && (seguimientoEvaluacion.summary || seguimientoEvaluacion.followEvaluation || seguimientoEvaluacion.testimony))
      ? seguimientoEvaluacion
      : informacionApoyo;
    const supportInfoNormalized = normalizeSupportInformation(supportSource);
    // Ensure sustainability is always set in monitorings, preferring seguimientoEvaluacion, but falling back to informacionApoyo
    let monitoringNormalized = normalizeMonitoring(seguimientoEvaluacion);
    if (!monitoringNormalized.sustainability && informacionApoyo.sustainability) {
      monitoringNormalized = {
        ...monitoringNormalized,
        sustainability: informacionApoyo.sustainability,
      };
    }

    const objectivesSwagger = [
      {
        descriptionProblem: objectiveExperience.descriptionProblem || "",
        objectiveExperience: objectiveExperience.objectiveExperience || "",
        enfoqueExperience: objectiveExperience.enfoqueExperience || "",
        methodologias: objectiveExperience.methodologias || "",
        innovationExperience: objectiveExperience.innovationExperience || "",
        pmi: objectiveExperience.pmi || "",
        nnaj: objectiveExperience.nnaj || "",
        supportInformations: [
          {
            summary: supportInfoNormalized.summary || "",
            metaphoricalPhrase: supportInfoNormalized.metaphoricalPhrase || "",
            testimony: supportInfoNormalized.testimony || "",
            followEvaluation: supportInfoNormalized.followEvaluation || "",
          },
        ],
        monitorings: [
          {
            monitoringEvaluation: monitoringNormalized.monitoringEvaluation || "",
            result: monitoringNormalized.result || "",
         sustainability: monitoringNormalized.sustainability ?? "",

            tranfer: monitoringNormalized.tranfer || "",
          },
        ],
      },
    ];

    try { console.log("objectivesSwagger (mapeado):", JSON.stringify(objectivesSwagger, null, 2)); } catch (e) { console.log("objectivesSwagger (raw)", objectivesSwagger); }

    // Build leaders array (map existing lideres state)
    const leadersSwagger = Array.isArray(lideres)
      ? lideres.map((l: any) => ({
          nameLeaders: l.nameLeaders || l.name || "",
          identityDocument: l.identityDocument || l.firstIdentityDocument || "",
          email: l.email || l.firdtEmail || "",
          position: l.position || l.firstPosition || "",
          phone: l.phone || l.firstPhone || 0,
        }))
      : [];

    // Build developments array from tematicaForm
    const developmentsSwagger = [
      {
   crossCuttingProject: Array.isArray(tematicaForm.CrossCuttingProject)
  ? tematicaForm.CrossCuttingProject.join(', ')
  : tematicaForm.CrossCuttingProject || "",
        // population: prefer tematicaForm.population (string or array) but if it's an array, join to a comma list for the backend text field
population: Array.isArray(tematicaForm.Population)
  ? tematicaForm.Population.join(', ')
  : (tematicaForm.Population || ""),

Population: Array.isArray(tematicaForm.Population)
  ? tematicaForm.Population.join(', ')
  : (tematicaForm.Population || ""),

        pedagogicalStrategies: Array.isArray(tematicaForm.PedagogicalStrategies)
  ? tematicaForm.PedagogicalStrategies.join(', ')
  : tematicaForm.PedagogicalStrategies || "",
        
  coverage: Array.isArray(tematicaForm.Coverage)
  ? tematicaForm.Coverage.join(', ')
  : tematicaForm.Coverage || "",
      },
    ];

    // Try to extract a numeric userId from the JWT token (if available)
    const jwtToken = getToken();
    const parseJwt = (t: string) => {
      try {
        const parts = t.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = decodeURIComponent(
          atob(payload)
            .split('')
            .map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        return JSON.parse(decoded);
      } catch {
        return null;
      }
    };

    const tryExtractUserId = (t?: string | null) => {
      if (!t) return null;
      const parsed = parseJwt(t);
      if (!parsed || typeof parsed !== 'object') return null;
      const candidates = [
        'sub',
        'id',
        'userId',
        'user_id',
        'nameid',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
      ];
      for (const k of candidates) {
        const v = (parsed as any)[k];
        if (v !== undefined && v !== null) {
          const num = Number(v);
          if (!Number.isNaN(num) && Number.isFinite(num) && num > 0) return Math.trunc(num);
        }
      }
      return null;
    };

    const extractedUserId = tryExtractUserId(jwtToken);

    // Determine stateExperienceId from any subform where the user may have set it
    const stateCandidate = identificacionInstitucional?.stateExperienceId ?? identificacionForm?.stateExperienceId ?? identificacionForm?.estado ?? identificacionInstitucional?.estado;
    const parseStateId = (v: any): number | null => {
      if (v === undefined || v === null) return null;
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.trunc(v);
      if (typeof v === 'string') {
        const n = Number(v);
        if (!Number.isNaN(n) && Number.isFinite(n) && n > 0) return Math.trunc(n);
      }
      return null;
    };
    const finalStateId = parseStateId(stateCandidate);

    const payload: any = {
      // Prefer the experience name entered in the Identification step; fall back to any institution-provided helper
      nameExperiences: identificacionForm?.nameExperience || identificacionInstitucional.nameExperiences || identificacionInstitucional.name || "",
      // Prefer code from identification subform or institutional identification (codeDane), fall back to legacy formData.code
      code: identificacionForm?.code || identificacionInstitucional?.code || identificacionInstitucional?.codeDane || formData.code || "",
      thematicLocation: tematicaForm.thematicLocation || "",
      // Only include developmenttime when a value exists. If omitted, backend won't attempt to parse it.
      ...(tiempo && tiempo.developmenttime ? { developmenttime: tiempo.developmenttime } : {}),
      // recognition: prefer value from tematicaForm (where ThematicForm stores it), fallback to tiempo
      recognition: tematicaForm?.recognitionText || tematicaForm?.recognition || tiempo.recognition || "",
      // socialization: ThematicForm now stores an array of slugs/labels under `socialization`/`socializationLabels`.
      // Backend expects a text field; send joined string and also provide an auxiliary array if needed.
      socialization: Array.isArray(tematicaForm?.socialization)
        ? tematicaForm.socialization.join(', ')
        : Array.isArray(tematicaForm?.socializationLabels)
        ? tematicaForm.socializationLabels.join(', ')
        : (typeof tematicaForm?.socialization === 'string' ? tematicaForm.socialization : (typeof tematicaForm?.socializationLabels === 'string' ? tematicaForm?.socializationLabels : (tiempo.socialization || ""))),
      socializationLabels: Array.isArray(tematicaForm?.socialization)
        ? tematicaForm.socialization
        : Array.isArray(tematicaForm?.socializationLabels)
        ? tematicaForm.socializationLabels
        : undefined,
      // CAMPOS CORREGIDOS: apoyo recibido y PEI
      pedagogicalStrategies: tematicaForm.PedagogicalStrategies || [],
      coverage: tematicaForm.Coverage || "",
      coverageText: tematicaForm.CoverageText || "",
      // Sustainability (seguimiento y evaluación de la experiencia, SupportInformationForm)
      sustainability: informacionApoyo.sustainability || "",
      // Include stateExperienceId when any subform provided a valid numeric id
      ...(finalStateId ? { stateExperienceId: finalStateId } : {}),
      institution: {
        name: identificacionInstitucional.name || "",
        address: identificacionInstitucional.address || "",
        phone: identificacionInstitucional.phone || 0,
        codeDane: identificacionInstitucional.codeDane || "",
        emailInstitucional: identificacionInstitucional.emailInstitucional || "",
        nameRector: identificacionInstitucional.nameRector || "",
        caracteristic: identificacionInstitucional.caracteristic || "",
        territorialEntity: identificacionInstitucional.territorialEntity || "",
        testsKnow: identificacionInstitucional.testsKnow || "",
        // Build addresses as objects (AddressInfoRequest-like) instead of plain strings
        addresses: (() => {
          // If the institutional form already provides an `addresses` array, normalize it
          const src = identificacionInstitucional.addresses ?? (identificacionInstitucional.address ? [identificacionInstitucional.address] : []);
          if (!Array.isArray(src) || src.length === 0) return [];
          return src.map((a: any) => {
            if (!a) return null;
            if (typeof a === 'string') {
              return {
                address: a,
                municipality: identificacionInstitucional.municipality || undefined,
                departament: identificacionInstitucional.departament || undefined,
                commune: identificacionInstitucional.communes || undefined,
                eZone: identificacionInstitucional.eZone || undefined,
              };
            }
            // assume it's already an object with expected keys
            return {
              address: a.address || a.addressLine || a.street || identificacionInstitucional.address || "",
              municipality: a.municipality || a.city || identificacionInstitucional.municipality || undefined,
              departament: a.departament || a.department || identificacionInstitucional.departament || undefined,
              commune: a.commune || a.communeName || identificacionInstitucional.communes || undefined,
              eZone: a.eZone || a.zone || identificacionInstitucional.eZone || undefined,
            };
          }).filter((x: any) => x !== null);
        })(),
        // Normalize other lists to arrays of { name } objects (NameItem[]), but accept already-structured values
        communes: Array.isArray(identificacionInstitucional.communes)
          ? identificacionInstitucional.communes.map((c: any) => (typeof c === 'string' ? { name: c } : c))
          : identificacionInstitucional.communes
          ? [{ name: identificacionInstitucional.communes }]
          : [],
        departamentes: identificacionInstitucional.departament
          ? [{ name: identificacionInstitucional.departament }]
          : Array.isArray(identificacionInstitucional.departamentes)
          ? identificacionInstitucional.departamentes.map((d: any) => (typeof d === 'string' ? { name: d } : d))
          : [],
        eeZones: identificacionInstitucional.eZone
          ? [{ name: identificacionInstitucional.eZone }]
          : Array.isArray(identificacionInstitucional.eeZones)
          ? identificacionInstitucional.eeZones.map((z: any) => (typeof z === 'string' ? { name: z } : z))
          : [],
        municipalities: identificacionInstitucional.municipality
          ? [{ name: identificacionInstitucional.municipality }]
          : Array.isArray(identificacionInstitucional.municipalities)
          ? identificacionInstitucional.municipalities.map((m: any) => (typeof m === 'string' ? { name: m } : m))
          : [],
      },
      documents: documentsSwagger,
      objectives: objectivesSwagger,
      leaders: leadersSwagger,
      developments: developmentsSwagger,
      // Send history entries; include userId only when we could extract it from the token
      historyExperiences: historyExperiences.map(({ action, tableName }) => (
        extractedUserId ? { action, tableName, userId: extractedUserId } : { action, tableName }
      )),
      // populationGradeIds: prefer numeric ids; include populationGrades (names) as fallback if needed
      populationGradeIds: numericPopulationGradeIds,
      populationGrades: stringPopulationGrades.length ? stringPopulationGrades : undefined,
      thematicLineIds: formData.thematicLineIds?.length ? formData.thematicLineIds : tematicaForm.thematicLineIds || [],
      grades: (grades && grades.length > 0)
        ? grades
        : Array.isArray(tematicaForm?.grades)
        ? tematicaForm.grades.map((g: any) => (typeof g === 'string' ? { gradeId: 0, description: g } : g))
        : Array.isArray(tematicaForm?.gradeId)
        ? tematicaForm.gradeId.map((g: any) => (typeof g === 'string' ? { gradeId: 0, description: g } : g))
        : [],
    };

    // Normalize userId usage: if we have an extractedUserId, ensure it's applied where appropriate.
    // If we don't have a valid extractedUserId, remove any userId keys from the payload to avoid sending invalid ids.
    const normalizeOrRemoveUserId = (obj: any, userIdValue: number | null) => {
      if (!obj || typeof obj !== 'object') return;
      Object.keys(obj).forEach((k) => {
        try {
          const v = obj[k];
          if (k === 'userId') {
            if (userIdValue && Number.isFinite(userIdValue) && userIdValue > 0) {
              obj[k] = userIdValue;
            } else {
              delete obj[k];
            }
            return;
          }
          if (Array.isArray(v)) {
            v.forEach((item) => normalizeOrRemoveUserId(item, userIdValue));
          } else if (typeof v === 'object') {
            normalizeOrRemoveUserId(v, userIdValue);
          }
        } catch {}
      });
    };
    // If there's an extracted user id (from token) or a stored userId in localStorage, include it at top-level
    const storedUserId = Number(localStorage.getItem('userId')) || null;
    const finalUserId = extractedUserId ?? (storedUserId && Number.isFinite(storedUserId) && storedUserId > 0 ? storedUserId : null);
    if (finalUserId) {
      payload.userId = finalUserId;
    }

    // Normalize/remove any nested userId keys according to whether we have a valid id
    normalizeOrRemoveUserId(payload, finalUserId ?? null);

    // debug: log lideres state and mapped leaders before sending
    try {
      console.log("Estado 'lideres' antes de enviar:", JSON.stringify(lideres, null, 2));
    } catch (e) {
      console.log("Estado 'lideres' (no serializable)", lideres);
    }
    try {
      console.log("leadersSwagger (mapeado):", JSON.stringify(leadersSwagger, null, 2));
    } catch (e) {
      console.log("leadersSwagger (no serializable)", leadersSwagger);
    }
    try {
      console.log("pdfFile (raw):", JSON.stringify(pdfFile, null, 2));
    } catch (e) {
      console.log("pdfFile (no serializable)", pdfFile);
    }
    try {
      console.log("documentsSwagger (mapeado):", JSON.stringify(documentsSwagger, null, 2));
    } catch (e) {
      console.log("documentsSwagger (no serializable)", documentsSwagger);
    }

    // log payload for debugging
    console.log("Objeto enviado al backend:", JSON.stringify(payload, null, 2));

    try {
      setErrorMessage("");
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
      const endpoint = `${API_BASE}/api/Experience/register`;

      // Use the normalized token value from getToken() for Authorization header
      const authToken = jwtToken ?? localStorage.getItem("token");
      // Try primary endpoint; if network/protocol error occurs and we're targeting localhost via https,
      // retry the call using http (useful for local dev where Kestrel may not serve HTTPS correctly).
      let res: Response | null = null;
      const doFetch = async (url: string) =>
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(payload),
        });

      try {
        res = await doFetch(endpoint);
      } catch (networkErr: any) {
        console.warn("Network error when calling Experience/register:", networkErr);
        // Only attempt http fallback for localhost targets using https
        try {
          const u = new URL(endpoint);
          if ((u.hostname === 'localhost' || u.hostname === '127.0.0.1') && u.protocol === 'https:') {
            const fallback = `http:${u.href.substring(u.origin.length)}`;
            console.info(`Retrying Experience/register using HTTP fallback: ${fallback}`);
            res = await doFetch(fallback);
          } else {
            throw networkErr;
          }
        } catch (innerErr) {
          // rethrow the original network error if we couldn't recover
          console.error('Fallback attempt failed:', innerErr);
          throw networkErr;
        }
      }

      if (!res.ok) {
        // Mejor manejo de error: mostrar siempre el mensaje del backend
        let errorText = `Error al registrar la experiencia (HTTP ${res.status})`;
        let backendMsg = "";
        try {
          // Intenta parsear como JSON
          const errorData = await res.clone().json();
          // If the backend returns structured validation errors, show them clearly
          if (errorData?.errors) {
            backendMsg = JSON.stringify(errorData.errors);
            // also attach field errors to state for inline display when possible
            try {
              const fieldErrs: Record<string, string> = {};
              Object.entries(errorData.errors).forEach(([k, v]) => {
                fieldErrs[k] = Array.isArray(v) ? (v as any[]).join(" ") : String(v);
              });
              setFieldErrors(fieldErrs);
            } catch {}
          } else {
            backendMsg = errorData?.message || errorData?.error || JSON.stringify(errorData);
          }
        } catch {
          try {
            // Si no es JSON, intenta como texto
            backendMsg = await res.clone().text();
          } catch {}
        }
        if (backendMsg && backendMsg !== "") {
          errorText += `: ${backendMsg}`;
        }
        setErrorMessage(errorText);
        // show styled alert like LoginPage
        try {
          Swal.fire({ title: 'Error', text: backendMsg || errorText, icon: 'error', confirmButtonText: 'Aceptar' });
        } catch (e) {
          // ignore if Swal not available for some reason
        }
        // También loguea el payload para depuración
        console.error("Payload enviado:", payload);
        return;
      }

      // Try to parse created resource to obtain its id
      let created: any = null;
      try {
        created = await res.clone().json();
      } catch (e) {
        // response may be empty or non-json
      }

      // Determine id from response body or Location header
      const extractIdFromLocation = (loc: string | null) => {
        if (!loc) return null;
        const m = loc.match(/\/(\d+)(?:\/|$)/);
        return m ? Number(m[1]) : null;
      };

      let createdId: number | null = null;
      const tryCoerceId = (value: unknown): number | null => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
        if (typeof value === 'string' && value.trim() !== '') {
          const coerced = Number(value);
          return Number.isFinite(coerced) && coerced > 0 ? coerced : null;
        }
        return null;
      };

      const findIdDeep = (source: unknown, depth = 0): number | null => {
        if (depth > 5 || source === null || source === undefined) return null;
        const direct = tryCoerceId(source);
        if (direct) return direct;

        if (Array.isArray(source)) {
          for (const item of source) {
            const found = findIdDeep(item, depth + 1);
            if (found) return found;
          }
          return null;
        }

        if (typeof source === 'object') {
          const obj = source as Record<string, unknown>;
          const preferredKeys = ['experienceId', 'ExperienceId', 'id', 'Id', 'result'];
          for (const key of preferredKeys) {
            if (key in obj) {
              const found = findIdDeep(obj[key], depth + 1);
              if (found) return found;
            }
          }
          for (const value of Object.values(obj)) {
            const found = findIdDeep(value, depth + 1);
            if (found) return found;
          }
        }
        return null;
      };

      if (created) {
        createdId = findIdDeep(created);
      }

      if (!createdId) {
        const loc = res.headers.get('Location');
        createdId = extractIdFromLocation(loc);
      }

      if (!createdId) {
        const location = res.headers.get('Location');
        if (location) {
          try {
            const parsed = new URL(location, window.location.origin);
            const fromQuery = parsed.searchParams.get('experienceId') || parsed.searchParams.get('id') || parsed.searchParams.get('experience');
            createdId = tryCoerceId(fromQuery);
          } catch {
            // ignore URL parsing errors
          }
        }
      }

      if (!createdId) {
        console.warn('Experience created but id could not be determined; notification may not be sent');
      }

      // If we have an id, call the generate-pdf endpoint and download/open the PDF
      if (createdId && Number.isFinite(createdId) && createdId > 0) {
        // Notificar por SignalR (el backend debe emitir la notificación)
        await notifyExperienceCreated(createdId);
        const pdfEndpoint = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/Experience/${createdId}/generate-pdf`;
        try {
          const pdfRes = await fetch(pdfEndpoint, {
            method: 'GET',
            headers: {
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
          });
          if (pdfRes.ok) {
            const blob = await pdfRes.blob();
            const url = URL.createObjectURL(blob);
            setTimeout(() => URL.revokeObjectURL(url), 60000);
          } else {
            console.warn('Fallo al generar PDF:', await pdfRes.text().catch(() => '')); 
            try { await Swal.fire({ title: 'Éxito', text: 'Experiencia registrada. Falló la generación del PDF.', icon: 'warning', confirmButtonText: 'Aceptar' }); } catch {}
            if (onVolver) onVolver();
            return;
          }
        } catch (pdfErr) {
          console.error('Error al descargar PDF:', pdfErr);
          try { await Swal.fire({ title: 'Éxito', text: 'Experiencia registrada. No se pudo obtener el PDF.', icon: 'warning', confirmButtonText: 'Aceptar' }); } catch {}
          if (onVolver) onVolver();
          return;
        }
      }
      // Eliminado modal de PDF generado. Solo mostrar mensaje de éxito simple.

      try {
        await Swal.fire({ title: 'Éxito', text: 'Experiencia registrada correctamente', icon: 'success', confirmButtonText: 'Aceptar' });
      } catch (e) {}
      if (onVolver) onVolver();
    } catch (err: any) {
      const msg = err?.message || "Error inesperado al registrar la experiencia";
      setErrorMessage(msg);
      try {
        Swal.fire({ title: 'Error', text: msg, icon: 'error', confirmButtonText: 'Aceptar' });
      } catch (e) {}
    }
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateCurrentStep = (): boolean => {
    if (disableValidation) return true;
    setFieldErrors({});
    // Step 0: InstitutionalIdentification required fields (field-level errors)
    if (currentStep === 0) {
      const inst = identificacionInstitucional || {};
      const errors: Record<string, string> = {};
      if (!inst.codeDane || String(inst.codeDane).trim() === "") errors.codeDane = "Código DANE es obligatorio";
      if (!inst.name || String(inst.name).trim() === "") errors.name = "Nombre del establecimiento es obligatorio";
      if (!inst.nameRector || String(inst.nameRector).trim() === "") errors.nameRector = "Nombre del rector es obligatorio";
      if (!inst.departament || String(inst.departament).trim() === "") errors.departament = "Departamento es obligatorio";
      if (!inst.municipality || String(inst.municipality).trim() === "") errors.municipality = "Municipio es obligatorio";
      if (!inst.eZone || String(inst.eZone).trim() === "") errors.eZone = "Zona del EE es obligatoria";
      if (!inst.address || String(inst.address).trim() === "") errors.address = "Dirección es obligatoria";
      if (!inst.phone || String(inst.phone).trim() === "") errors.phone = "Teléfonos de contacto es obligatorio";
      if (!inst.emailInstitucional || String(inst.emailInstitucional).trim() === "") errors.emailInstitucional = "Correo institucional es obligatorio";
      if (!inst.caracteristic || String(inst.caracteristic).trim() === "") errors.caracteristic = "Características del EE es obligatorio";
      if (!inst.territorialEntity || String(inst.territorialEntity).trim() === "") errors.territorialEntity = "Entidad Territorial Certificada (ETC) es obligatoria";
      if (!inst.testsKnow || String(inst.testsKnow).trim() === "") errors.testsKnow = "Debe seleccionar si participará en el evento Compartir de Saberes";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }

    // Step 1: Leader required fields
    if (currentStep === 1) {
      const leader = (lideres && lideres[0]) || {};
      const errors: Record<string, string> = {};
      if (!leader.nameLeaders || String(leader.nameLeaders).trim() === "") errors.leaderName = "Nombre del líder es obligatorio";
      if (!leader.identityDocument || String(leader.identityDocument).trim() === "") errors.identityDocument = "Documento de identidad es obligatorio";
      if (!leader.email || String(leader.email).trim() === "") errors.leaderEmail = "Correo del líder es obligatorio";
      if (!leader.position || String(leader.position).trim() === "") errors.position = "Cargo es obligatorio";
      if (!leader.phone || leader.phone === 0 || String(leader.phone).trim() === "") errors.phone = "Teléfono es obligatorio";
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }

    // Step 2: Identification required fields
    if (currentStep === 2) {
      const ident = identificacionForm || {};
      const errors: Record<string, string> = {};
      if (!ident.nameExperience || String(ident.nameExperience).trim() === "") errors.nameExperience = "Nombre de la experiencia es obligatorio";
      if (!ident.thematicFocus || String(ident.thematicFocus).trim() === "") errors.thematicFocus = "Enfoque temático es obligatorio";
      const dev = ident.development || {};
      // Permitir 0 como valor válido para días, meses o años
      const hasDev = [dev.days, dev.months, dev.years].some(
        (v) => v !== undefined && v !== null && String(v).trim() !== "" && !isNaN(Number(v))
      );
      if (!hasDev) errors.development = "Seleccione el tiempo de desarrollo";
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }

    // Step 3: Thematic required fields
    if (currentStep === 3) {
      const thematic = tematicaForm || {};
      const errors: Record<string, string> = {};
      if (!thematic.thematicLocation || !thematic.thematicLineIds || !Array.isArray(thematic.thematicLineIds) || thematic.thematicLineIds.length === 0) errors.thematicLocation = "Debe seleccionar un área principal";
      if (!thematic.Population || !Array.isArray(thematic.Population) || thematic.Population.length === 0) errors.Population = "Debe seleccionar al menos un modelo educativo";
      if (!thematic.CrossCuttingProject || !Array.isArray(thematic.CrossCuttingProject) || thematic.CrossCuttingProject.length === 0) errors.CrossCuttingProject = "Debe seleccionar al menos una técnica SENA";
      if (!thematic.grades || !Array.isArray(thematic.grades) || thematic.grades.length === 0) errors.grades = "Debe seleccionar al menos un grado";
      if (!thematic.populationGradeIds || !Array.isArray(thematic.populationGradeIds) || thematic.populationGradeIds.length === 0) errors.populationGradeIds = "Debe seleccionar al menos un grupo poblacional";
      if (!thematic.PedagogicalStrategies || !Array.isArray(thematic.PedagogicalStrategies) || thematic.PedagogicalStrategies.length === 0) errors.PedagogicalStrategies = "Debe seleccionar al menos un apoyo recibido";
      if (!thematic.Coverage || typeof thematic.Coverage !== "string" || thematic.Coverage.trim() === "") errors.Coverage = "Debe seleccionar una opción de PEI";
      if (!thematic.recognition || typeof thematic.recognition !== "string" || thematic.recognition.trim() === "") errors.recognition = "Debe seleccionar una opción de reconocimiento";
      if (!thematic.socialization || !Array.isArray(thematic.socialization) || thematic.socialization.length === 0) errors.socialization = "Debe seleccionar al menos un soporte";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }
    // Step 4: Components required fields
    if (currentStep === 4) {
      const obj = objectiveExperience || {};
      const errors: Record<string, string> = {};
      if (!obj.descriptionProblem || String(obj.descriptionProblem).trim() === "") errors.descriptionProblem = "Descripción del problema es obligatoria";
      if (!obj.objectiveExperience || String(obj.objectiveExperience).trim() === "") errors.objectiveExperience = "Objetivo propuesto es obligatorio";
      if (!obj.enfoqueExperience || String(obj.enfoqueExperience).trim() === "") errors.enfoqueExperience = "Logros obtenidos es obligatorio";
      if (!obj.methodologias || String(obj.methodologias).trim() === "") errors.methodologias = "Productos generados es obligatorio";
      if (!obj.pmi || String(obj.pmi).trim() === "") errors.pmi = "Articulación PEI/PMI es obligatoria";
      if (!obj.nnaj || String(obj.nnaj).trim() === "") errors.nnaj = "Coherencia con contexto es obligatoria";
      if (!obj.innovationExperience || String(obj.innovationExperience).trim() === "") errors.innovationExperience = "Resultados/impacto es obligatorio";
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }
    // Step 5: FollowUpEvaluation required fields
    if (currentStep === 5) {
      const follow = seguimientoEvaluacion || {};
      const errors: Record<string, string> = {};
      const monitoringEvaluation = (follow.summary && follow.summary[0] && follow.summary[0].monitoringEvaluation) || "";
      if (!monitoringEvaluation || String(monitoringEvaluation).trim() === "") errors.monitoringEvaluation = "Reorganización/actualización es obligatoria";
      if (!follow.metaphoricalPhrase || String(follow.metaphoricalPhrase).trim() === "") errors.metaphoricalPhrase = "Empoderamiento es obligatorio";
      if (!follow.testimony || String(follow.testimony).trim() === "") errors.testimony = "Acciones/recursos es obligatorio";
      if (!follow.followEvaluation || String(follow.followEvaluation).trim() === "") errors.followEvaluation = "Transferencia es obligatoria";
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }
    // Step 6: SupportInformationForm required fields
    if (currentStep === 6) {
      const support = informacionApoyo || {};
      const errors: Record<string, string> = {};
      if (!support.monitoringEvaluation || String(support.monitoringEvaluation).trim() === "") errors.monitoringEvaluation = "Referencia para replicar es obligatoria";
      if (!support.sustainability || String(support.sustainability).trim() === "") errors.sustainability = "Seguimiento/evaluación es obligatoria";
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }
    // Step 7: PDFUploader required fields
    if (currentStep === 7) {
      const pdf = pdfFile || {};
      const errors: Record<string, string> = {};
      if (!pdf.urlPdfExperience || String(pdf.urlPdfExperience).trim() === "") errors.urlPdfExperience = "PDF de experiencia es obligatorio";
      if (!pdf.urlPdf || String(pdf.urlPdf).trim() === "") errors.urlPdf = "PDF de oficio es obligatorio";
      if (!pdf.urlLink || String(pdf.urlLink).trim() === "") errors.urlLink = "Enlace de divulgación es obligatorio";
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      setFieldErrors({});
      return true;
    }
    // Other steps: no mandatory validation by default (can be extended)
    return true;
  };

  // Synchronous check used to enable/disable the Next button (no state changes)
  const isCurrentStepValidSync = (): boolean => {
    if (disableValidation) return true;
    if (currentStep === 0) {
      const inst = identificacionInstitucional || {};
      if (!inst.codeDane || String(inst.codeDane).trim() === "") return false;
      if (!inst.name || String(inst.name).trim() === "") return false;
      if (!inst.nameRector || String(inst.nameRector).trim() === "") return false;
      if (!inst.departament || String(inst.departament).trim() === "") return false;
      if (!inst.municipality || String(inst.municipality).trim() === "") return false;
      if (!inst.eZone || String(inst.eZone).trim() === "") return false;
      if (!inst.address || String(inst.address).trim() === "") return false;
      if (!inst.phone || String(inst.phone).trim() === "") return false;
      if (!inst.emailInstitucional || String(inst.emailInstitucional).trim() === "") return false;
      if (!inst.caracteristic || String(inst.caracteristic).trim() === "") return false;
      if (!inst.territorialEntity || String(inst.territorialEntity).trim() === "") return false;
      if (!inst.testsKnow || String(inst.testsKnow).trim() === "") return false;
      return true;
    }
    if (currentStep === 1) {
      const leader = (lideres && lideres[0]) || {};
      if (!leader.nameLeaders || String(leader.nameLeaders).trim() === "") return false;
      if (!leader.identityDocument || String(leader.identityDocument).trim() === "") return false;
      if (!leader.email || String(leader.email).trim() === "") return false;
      if (!leader.position || String(leader.position).trim() === "") return false;
      if (!leader.phone || leader.phone === 0 || String(leader.phone).trim() === "") return false;
      return true;
    }
    if (currentStep === 2) {
      const ident = identificacionForm || {};
      if (!ident.nameExperience || String(ident.nameExperience).trim() === "") return false;
      if (!ident.thematicFocus || String(ident.thematicFocus).trim() === "") return false;
      const dev = ident.development || {};
      // Permitir 0 como valor válido para días, meses o años
      const hasDev = [dev.days, dev.months, dev.years].some(
        (v) => v !== undefined && v !== null && String(v).trim() !== "" && !isNaN(Number(v))
      );
      if (!hasDev) return false;
      return true;
    }
    if (currentStep === 3) {
      const thematic = tematicaForm || {};
      if (!thematic.thematicLocation || !thematic.thematicLineIds || !Array.isArray(thematic.thematicLineIds) || thematic.thematicLineIds.length === 0) return false;
      if (!thematic.Population || !Array.isArray(thematic.Population) || thematic.Population.length === 0) return false;
      if (!thematic.CrossCuttingProject || !Array.isArray(thematic.CrossCuttingProject) || thematic.CrossCuttingProject.length === 0) return false;
      if (!thematic.grades || !Array.isArray(thematic.grades) || thematic.grades.length === 0) return false;
      if (!thematic.populationGradeIds || !Array.isArray(thematic.populationGradeIds) || thematic.populationGradeIds.length === 0) return false;
      if (!thematic.PedagogicalStrategies || !Array.isArray(thematic.PedagogicalStrategies) || thematic.PedagogicalStrategies.length === 0) return false;
      if (!thematic.Coverage || typeof thematic.Coverage !== "string" || thematic.Coverage.trim() === "") return false;
      if (!thematic.recognition || typeof thematic.recognition !== "string" || thematic.recognition.trim() === "") return false;
      if (!thematic.socialization || !Array.isArray(thematic.socialization) || thematic.socialization.length === 0) return false;
      return true;
    }
    if (currentStep === 4) {
      const obj = objectiveExperience || {};
      if (!obj.descriptionProblem || String(obj.descriptionProblem).trim() === "") return false;
      if (!obj.objectiveExperience || String(obj.objectiveExperience).trim() === "") return false;
      if (!obj.enfoqueExperience || String(obj.enfoqueExperience).trim() === "") return false;
      if (!obj.methodologias || String(obj.methodologias).trim() === "") return false;
      if (!obj.pmi || String(obj.pmi).trim() === "") return false;
      if (!obj.nnaj || String(obj.nnaj).trim() === "") return false;
      if (!obj.innovationExperience || String(obj.innovationExperience).trim() === "") return false;
      return true;
    }
    if (currentStep === 5) {
      const follow = seguimientoEvaluacion || {};
      const monitoringEvaluation = (follow.summary && follow.summary[0] && follow.summary[0].monitoringEvaluation) || "";
      if (!monitoringEvaluation || String(monitoringEvaluation).trim() === "") return false;
      if (!follow.metaphoricalPhrase || String(follow.metaphoricalPhrase).trim() === "") return false;
      if (!follow.testimony || String(follow.testimony).trim() === "") return false;
      if (!follow.followEvaluation || String(follow.followEvaluation).trim() === "") return false;
      return true;
    }
    if (currentStep === 6) {
      const support = informacionApoyo || {};
      if (!support.monitoringEvaluation || String(support.monitoringEvaluation).trim() === "") return false;
      if (!support.sustainability || String(support.sustainability).trim() === "") return false;
      return true;
    }
    if (currentStep === 7) {
      const pdf = pdfFile || {};
      if (!pdf.urlPdfExperience || String(pdf.urlPdfExperience).trim() === "") return false;
      if (!pdf.urlPdf || String(pdf.urlPdf).trim() === "") return false;
      if (!pdf.urlLink || String(pdf.urlLink).trim() === "") return false;
      return true;
    }
    return true;
  };

  const isLastStep = () => currentStep === steps.length - 1;
  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="p-6 bg-white rounded-lg shadow max-h-[95vh] overflow-y-auto max-w-7xl mx-auto">
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {showBackButton && (
        <button onClick={onVolver} className="mb-4 text-sky-600 hover:underline">
          ← Volver
        </button>
      )}

      <div>
        {/* Stepper header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-center mb-3">Registro de Experiencia</h2>
          <div className="w-full overflow-x-auto py-4">
            <div className="relative w-full px-4">
              {/* connecting line */}
              <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200" />

              <div className="flex items-start justify-between">
                {steps.map((label, idx) => {
                  const isActive = idx === currentStep;
                  const isCompleted = idx < currentStep;
                  return (
                    <div key={label} className="flex-1 flex flex-col items-center text-center min-w-[90px]">
                      <div
                        className={`z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCompleted ? "bg-sky-500 text-white" : isActive ? "bg-pink-300 text-white border-2 border-pink-200" : "bg-white border border-gray-200 text-gray-500"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className={`mt-2 text-xs ${isActive ? "text-pink-600 font-medium" : "text-gray-500"}`}>
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* step-level alert removed — errors shown inline per field */}
          <div className="space-y-4">
            {/* Estado de edición por sección */}
            {currentStep === 0 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button type="button" className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={() => setEditSection(0)}>Editar</button>
                  )}
                </div>
                <InstitutionalIdentification value={identificacionInstitucional} onChange={setIdentificacionInstitucional} errors={fieldErrors} {...(typeof readOnly !== 'undefined' && { readOnly: readOnly && editSection !== 0 })} />
                {editSection === 0 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button type="button" className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setEditSection(null)}>Cancelar</button>
                    <button type="button" className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={handlePatchInstitutional}>Guardar</button>
                  </div>
                )}
              </FormSection>
            )}

            {currentStep === 1 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button type="button" className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={() => setEditSection(1)}>Editar</button>
                  )}
                </div>
                <LeadersForm value={lideres} onChange={setLideres} index={0} />
                {editSection === 1 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button type="button" className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setEditSection(null)}>Cancelar</button>
                    <button type="button" className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={handlePatchLeaders}>Guardar</button>
                  </div>
                )}
              </FormSection>
            )}

            {currentStep === 2 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button type="button" className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={() => setEditSection(2)}>Editar</button>
                  )}
                </div>
                <IdentificationForm value={identificacionForm} onChange={setIdentificacionForm} />
                {editSection === 2 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button type="button" className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setEditSection(null)}>Cancelar</button>
                    <button type="button" className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={handlePatchIdentification}>Guardar</button>
                  </div>
                )}
              </FormSection>
            )}

            {currentStep === 3 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button type="button" className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={() => setEditSection(3)}>Editar</button>
                  )}
                </div>
                <ThematicForm value={tematicaForm} onChange={setTematicaForm} />
                {editSection === 3 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button type="button" className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setEditSection(null)}>Cancelar</button>
                    <button type="button" className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={handlePatchThematic}>Guardar</button>
                  </div>
                )}
              </FormSection>
            )}

            {currentStep === 4 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button type="button" className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={() => setEditSection(4)}>Editar</button>
                  )}
                </div>
                <Components value={objectiveExperience} onChange={setObjectiveExperience} />
                {editSection === 4 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button type="button" className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setEditSection(null)}>Cancelar</button>
                    <button type="button" className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={handlePatchComponents}>Guardar</button>
                  </div>
                )}
              </FormSection>
            )}

            {currentStep === 5 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button type="button" className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={() => setEditSection(5)}>Editar</button>
                  )}
                </div>
                <FollowUpEvaluation value={seguimientoEvaluacion} onChange={setSeguimientoEvaluacion} />
                {editSection === 5 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button type="button" className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setEditSection(null)}>Cancelar</button>
                    <button type="button" className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={handlePatchFollowUp}>Guardar</button>
                  </div>
                )}
              </FormSection>
            )}

            {currentStep === 6 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (
                    <button type="button" className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={() => setEditSection(6)}>Editar</button>
                  )}
                </div>
                <SupportInformationForm value={informacionApoyo} onChange={setInformacionApoyo} />
                {editSection === 6 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button type="button" className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setEditSection(null)}>Cancelar</button>
                    <button type="button" className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={handlePatchSupportInfo}>Guardar</button>
                  </div>
                )}
              </FormSection>
            )}

            {currentStep === 7 && (
              <FormSection>
                <div className="flex justify-end mb-2">
                  {readOnly && (!('editMode' in window) || !(window as any).editMode) && (
                    <button type="button" className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={() => setEditSection(7)}>Editar</button>
                  )}
                </div>
                <div className="my-6">
                  <PDFUploader value={pdfFile} onChange={setPdfFile} />
                  {pdfFile && (
                    <div className="mt-2 text-center">
                      <span className="font-semibold">PDF seleccionado:</span> {pdfFile.name}
                    </div>
                  )}
                </div>
                {editSection === 7 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button type="button" className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setEditSection(null)}>Cancelar</button>
                    <button type="button" className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={handlePatchDocuments}>Guardar</button>
                  </div>
                )}
              </FormSection>
            )}
          </div>

          <div className="sticky bottom-0 z-20 bg-white/90 backdrop-blur-sm border-t border-gray-100 py-3 flex justify-between items-center mt-6">
            {/* Navegación siempre habilitada, solo edición bloqueada */}
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={prevStep}
              className={`px-4 py-2 rounded ${currentStep === 0 ? "bg-slate-200 text-slate-400" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
            >
              Atrás
            </button>

            {!isLastStep() ? (
              <button
                type="button"
                onClick={() => {
                  if (validateCurrentStep()) nextStep();
                }}
                disabled={!isCurrentStepValidSync()}
                className={`px-4 py-2 rounded ${!isCurrentStepValidSync() ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-sky-500 text-white hover:bg-sky-600"}`}
              >
                Siguiente
              </button>
            ) : (
              readOnly ? (
                <button
                  type="button"
                  onClick={() => { if (onVolver) onVolver(); }}
                  className="px-4 py-2 rounded bg-white border"
                >
                  Cerrar
                </button>
              ) : (
                editMode ? (
                  <button type="button" onClick={handlePatchAll} className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700">
                    Guardar Experiencia
                  </button>
                ) : (
                  <button type="button" onClick={() => handleSubmit()} className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700">
                    Guardar Experiencia
                  </button>
                )
              )
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExperience;
