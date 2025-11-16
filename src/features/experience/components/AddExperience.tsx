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
    pedagogicalStrategies: "",
    coordinationTransversalProjects: "",
    coverage: "",
    population: "",
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


