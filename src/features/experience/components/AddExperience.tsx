import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { getToken } from "../../../Api/Services/Auth";
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
}

const AddExperience: React.FC<AddExperienceProps> = ({ onVolver, initialData = null, readOnly = false, disableValidation = false, showBackButton = true }) => {
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
    Population: [],
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
        if (!s || typeof s !== 'string') return s;
        const idx = s.indexOf(',');
        if (s.startsWith('data:') && idx > -1) return s.substring(idx + 1);
        return s;
      };

      const rawPdf = pdfFile.urlPdf || "";
      const rawPdfExperience = pdfFile.urlPdf2 || pdfFile.urlPdfExperience || "";
      const doc: any = {
        name: pdfFile.name || pdfFile.name2 || "Documento PDF",
        urlLink: pdfFile.urlLink || "",
        // send raw base64 payload (without data:...;base64, prefix) which some backends expect
        urlPdf: stripDataPrefix(rawPdf) || "",
        urlPdfExperience: stripDataPrefix(rawPdfExperience) || "",
        // Compatibility fallbacks: also include the original base64 strings with prefix
        fileBase64: rawPdf || undefined,
        fileBase64Experience: rawPdfExperience || undefined,
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
    const monitoringNormalized = normalizeMonitoring(seguimientoEvaluacion);

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
            sustainability: monitoringNormalized.sustainability || "",
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

populationGrade: Array.isArray(tematicaForm.PopulationGrade)
  ? tematicaForm.PopulationGrade.join(', ')
  : (tematicaForm.PopulationGrade || ""),

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
      if (created) {
        createdId = created?.id || created?.data?.id || created?.experience?.id || created?.result?.id || null;
        if (typeof createdId === 'string') createdId = Number(createdId);
        if (!createdId && created?.data && typeof created.data === 'number') createdId = created.data;
      }

      if (!createdId) {
        const loc = res.headers.get('Location');
        createdId = extractIdFromLocation(loc);
      }

      // If we have an id, call the generate-pdf endpoint and download/open the PDF
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
      if (!leader.email || String(leader.email).trim() === "") errors.leaderEmail = "Correo del líder es obligatorio";
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
      if (!(dev.days || dev.months || dev.years)) errors.development = "Seleccione el tiempo de desarrollo";
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
      return true;
    }
    if (currentStep === 1) {
      const leader = (lideres && lideres[0]) || {};
      if (!leader.nameLeaders || String(leader.nameLeaders).trim() === "") return false;
      if (!leader.email || String(leader.email).trim() === "") return false;
      return true;
    }
    if (currentStep === 2) {
      const ident = identificacionForm || {};
      if (!ident.nameExperience || String(ident.nameExperience).trim() === "") return false;
      if (!ident.thematicFocus || String(ident.thematicFocus).trim() === "") return false;
      const dev = ident.development || {};
      if (!(dev.days || dev.months || dev.years)) return false;
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
            {currentStep === 0 && (
              <FormSection>
                <InstitutionalIdentification value={identificacionInstitucional} onChange={setIdentificacionInstitucional} errors={fieldErrors} />
              </FormSection>
            )}

            {currentStep === 1 && (
              <FormSection>
                <LeadersForm value={lideres} onChange={setLideres} index={0} />
              </FormSection>
            )}

            {currentStep === 2 && (
              <FormSection>
                <IdentificationForm value={identificacionForm} onChange={setIdentificacionForm} />
              </FormSection>
            )}

            {currentStep === 3 && (
              <FormSection>
                <ThematicForm value={tematicaForm} onChange={setTematicaForm} />
              </FormSection>
            )}

            {currentStep === 4 && (
              <FormSection>
                <Components value={objectiveExperience} onChange={setObjectiveExperience} />
              </FormSection>
            )}

            {currentStep === 5 && (
              <FormSection>
                <FollowUpEvaluation value={seguimientoEvaluacion} onChange={setSeguimientoEvaluacion} />
              </FormSection>
            )}

            {currentStep === 6 && (
              <FormSection>
                <SupportInformationForm value={informacionApoyo} onChange={setInformacionApoyo} />
              </FormSection>
            )}

            {currentStep === 7 && (
              <FormSection>
                <div className="my-6">
                  <PDFUploader value={pdfFile} onChange={setPdfFile} />
                  {pdfFile && (
                    <div className="mt-2 text-center">
                      <span className="font-semibold">PDF seleccionado:</span> {pdfFile.name}
                    </div>
                  )}
                </div>
              </FormSection>
            )}
          </div>

          <div className="sticky bottom-0 z-20 bg-white/90 backdrop-blur-sm border-t border-gray-100 py-3 flex justify-between items-center mt-6">
            {readOnly ? (
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={() => { if (onVolver) onVolver(); }}
                  className="px-4 py-2 rounded bg-white border"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
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
                  <button type="button" onClick={() => handleSubmit()} className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700">
                    Guardar Experiencia
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExperience;


