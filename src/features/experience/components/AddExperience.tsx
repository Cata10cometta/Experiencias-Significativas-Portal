import React, { useState } from "react";
import LeadersForm from "./LeadersForm";
import IdentificationForm from "./IdentificationForm";
import ThematicForm from "./ThematicForm";
import PopulationGroupForm from "./PopulationGroup";
import TimeForm from "./TimeForm";
import InstitutionalIdentification from "./InstitutionalIdentification";
import Components from "./Components";
import FollowUpEvaluation from "./FollowUpEvaluation";
import SupportInformationForm from "./SupportInformationForm";
import PDFUploader from "./PDF";

import type { Grade } from "../types/experienceTypes";
import LevelsForm from "./LevelsForm";
import type { LevelsFormValue, Nivel } from "./LevelsForm";

interface AddExperienceProps {
  onVolver: () => void;
}

const AddExperience: React.FC<AddExperienceProps> = ({ onVolver }) => {
  const [errorMessage, setErrorMessage] = useState("");

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
  const [lideres, setLideres] = useState<any[]>([{}, {}]); // Array para 2 líderes
  const [identificacionForm, setIdentificacionForm] = useState<any>({
    estado: "",
    ubicaciones: [],
    otroTema: "",
    thematicLocation: ""
  });
  const [tematicaForm, setTematicaForm] = useState<any>({
    thematicLineIds: [],
    PedagogicalStrategies: "",
    CrossCuttingProject: [],
    Coverage: "",
    population: [],
    experiencesCovidPandemic: ""
  });
  const [nivelesForm, setNivelesForm] = useState<LevelsFormValue>({
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    // 2) GRADES -> convertimos nivelesForm a array y filtramos solo los grados válidos
    const nivelesArray: Nivel[] = Object.values(nivelesForm.niveles);

    const grades: { gradeId: number; description: string }[] = nivelesArray
      .flatMap((nivel) => nivel.grados)
      .filter((g): g is Grade => g !== undefined && typeof g.gradeId === "number")
      .map((g) => ({
        gradeId: g.gradeId as number,
        description: g.description || "",
      }));

    // 3) POPULATION GRADE IDS
    const populationGradeIds = Array.isArray(grupoPoblacional) ? grupoPoblacional : [];

    // 4) OBJECTIVES
    const objectives = [
      {
        descriptionProblem: objectiveExperience.descriptionProblem || "",
        objectiveExperience: objectiveExperience.objectiveExperience || "",
        enfoqueExperience: objectiveExperience.enfoqueExperience || "",
        methodologias: objectiveExperience.methodologias || "",
        innovationExperience: objectiveExperience.innovationExperience || "",
        resulsExperience: seguimientoEvaluacion.resulsExperience || "",
        sustainabilityExperience: seguimientoEvaluacion.sustainabilityExperience || "",
        tranfer: seguimientoEvaluacion.tranfer || "",
        summary: informacionApoyo.summary || "",
        metaphoricalPhrase: informacionApoyo.metaphoricalPhrase || "",
        testimony: informacionApoyo.testimony || "",
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
        departament: identificacionInstitucional.departament || "",
        municipality: identificacionInstitucional.municipality || "",
        commune: identificacionInstitucional.commune || "",
        nameRector: identificacionInstitucional.nameRector || "",
        eZone: identificacionInstitucional.eZone || "",
        caracteristic: identificacionInstitucional.caracteristic || "",
        territorialEntity: identificacionInstitucional.territorialEntity || "",
        testsKnow: identificacionInstitucional.testsKnow || "",
      },

      documents: documents,
      objectives: objectives,
  // Do not send stateId inside historyExperiences if backend removed that relation
  historyExperiences: historyExperiences.map(({ action, tableName }) => ({ action, tableName })),


    };

    console.log("Objeto enviado al backend:", JSON.stringify(payload, null, 2));

    try {
      setErrorMessage("");
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
      const endpoint = `${API_BASE}/api/Experience/register`;

      const token = localStorage.getItem("token");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Mejor manejo de error: mostrar siempre el mensaje del backend
        let errorText = `Error al registrar la experiencia (HTTP ${res.status})`;
        let backendMsg = "";
        try {
          // Intenta parsear como JSON
          const errorData = await res.clone().json();
          backendMsg = errorData?.message || errorData?.error || JSON.stringify(errorData);
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
        // También loguea el payload para depuración
        console.error("Payload enviado:", payload);
        return;
      }

      alert("Experiencia registrada correctamente");
      onVolver();
    } catch (err: any) {
      setErrorMessage(err?.message || "Error inesperado al registrar la experiencia");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow max-h-[80vh] overflow-y-auto">
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <button onClick={onVolver} className="mb-4 text-sky-600 hover:underline">
        ← Volver
      </button>

      <form onSubmit={handleSubmit}>
  <InstitutionalIdentification value={identificacionInstitucional} onChange={setIdentificacionInstitucional} />
  <LeadersForm value={lideres} onChange={setLideres} />
  <IdentificationForm value={identificacionForm} onChange={setIdentificacionForm} />
  <ThematicForm value={tematicaForm} onChange={setTematicaForm} />
  <LevelsForm value={nivelesForm} onChange={setNivelesForm} />
  <PopulationGroupForm value={grupoPoblacional} onChange={(val) => setGrupoPoblacional(val ?? [])} />
  <TimeForm value={tiempo} onChange={setTiempo} />
  <Components value={objectiveExperience} onChange={setObjectiveExperience} />
  <FollowUpEvaluation value={seguimientoEvaluacion} onChange={setSeguimientoEvaluacion} />
  <SupportInformationForm value={informacionApoyo} onChange={setInformacionApoyo} />

        <div className="my-6">
          <PDFUploader value={pdfFile} onChange={setPdfFile} />
          {pdfFile && (
            <div className="mt-2 text-center">
              <span className="font-semibold">PDF seleccionado:</span> {pdfFile.name}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600">
            Guardar Experiencia
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExperience;


