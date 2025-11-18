import React, { useState } from "react";
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
  onVolver: () => void;
}

const AddExperience: React.FC<AddExperienceProps> = ({ onVolver }) => {
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
    pedagogicalStrategies: "",
    coordinationTransversalProjects: "",
    coverage: "",
    population: "",
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

  const steps: string[] = [
    "Identificación Institucional",
    "Líder",
    "Identificación",
    "Temática",
    "Objetivos",
    "Seguimiento",
    "Apoyos",
    "PDF",
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

    // 7) PAYLOAD FINAL
    const payload = {
      nameExperiences: identificacionInstitucional.nameExperiences,
      code: formData.code,
      nameFirstLeader: lideres[0]?.nameFirstLeader || "",
      firstIdentityDocument: lideres[0]?.firstIdentityDocument || "",
      firdtEmail: lideres[0]?.firdtEmail || "",
      firstPosition: lideres[0]?.firstPosition || "",
      firstPhone: lideres[0]?.firstPhone || 0,

      nameSecondLeader: lideres[1]?.nameFirstLeader || "",
      secondIdentityDocument: lideres[1]?.firstIdentityDocument || "",
      secondEmail: lideres[1]?.firdtEmail || "",
      secondPosition: lideres[1]?.firstPosition || "",
      secondPhone: lideres[1]?.firstPhone || 0,

      thematicLocation: identificacionForm.thematicLocation || "",
  // backend DTO expects `stateExperienceId` on the Experience object
  stateExperienceId: formData.stateId || 0,
      thematicLineIds: formData.thematicLineIds?.length
        ? formData.thematicLineIds
        : tematicaForm.thematicLineIds || [],
      coordinationTransversalProjects: tematicaForm.coordinationTransversalProjects || "",
      pedagogicalStrategies: tematicaForm.pedagogicalStrategies || "",
      coverage: tematicaForm.coverage || "",
      population: tematicaForm.population || "",
      experiencesCovidPandemic: tematicaForm.experiencesCovidPandemic || "",

      grades: grades,
      populationGradeIds: populationGradeIds,
      developmenttime: tiempo.developmenttime || "",
      recognition: tiempo.recognition || "",
      socialization: tiempo.socialization || "",
  // Do not send userId from the client. The backend must set the experience creator from the authenticated token.

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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateCurrentStep = (): boolean => {
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

    // Other steps: no mandatory validation by default (can be extended)
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

      <button onClick={onVolver} className="mb-4 text-sky-600 hover:underline">
        ← Volver
      </button>

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

        <form onSubmit={handleSubmit}>
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
                  className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
                >
                  Siguiente
                </button>
            ) : (
              <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700">
                Guardar Experiencia
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExperience;


