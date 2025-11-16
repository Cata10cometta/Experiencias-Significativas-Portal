import React from "react";
import { CriteriaEvaluation, Evaluation } from "../types/evaluation";

interface CriteriaResultsProps {
  value: Evaluation;
  onChange: (value: Evaluation) => void;
  errors: Record<string, string>;
}

const CriteriaResults: React.FC<CriteriaResultsProps> = ({ value, onChange, errors }) => {
  const CRITERIA_ID = 4; // ID real para Resultados

  // Buscar si ya existe este criterio en la evaluación
  const criteria =
    value.criteriaEvaluations.find((c: any) => c.criteriaId === CRITERIA_ID) ??
    {
			score: 0,
			descriptionContribution: "",
			evaluationId: 0,
      criteriaId: CRITERIA_ID,
			id: 0,
			state: true,
			createdAt: "",
			deletedAt: ""
    };

  const updateScore = (score: number) => {
    const updatedCriteria: CriteriaEvaluation = {
      ...criteria,
      score,
    };

    onChange({
      ...value,
      criteriaEvaluations: [
  ...value.criteriaEvaluations.filter((c: any) => c.criteriaId !== CRITERIA_ID),
        updatedCriteria,
      ],
    });
  };

  const updateDescription = (desc: string) => {
    const updatedCriteria: CriteriaEvaluation = {
      ...criteria,
      descriptionContribution: desc,
    };

    onChange({
      ...value,
      criteriaEvaluations: [
        ...value.criteriaEvaluations.filter((c: any) => c.criteriaId !== CRITERIA_ID),
        updatedCriteria,
      ],
    });
  };

  return (
    <section className="w-full px-0 mt-4 min-h-[400px]">
      <div className="bg-[#e9ecef] rounded-t-xl px-8 py-6">
        <h2 className="text-2xl font-bold !text-[#2196f3]">Criterio: Resultados</h2>
      </div>
      <div className="px-8 pt-8 pb-8">
        {/* Intro */}
        <div className="mb-2">
          <span className="font-bold !text-[#2196f3] text-lg">Resultados,</span>
          <span className="text-gray-800 font-normal">
            {" "}
            Examina los logros obtenidos frente a los objetivos planteados, la mejora en aprendizajes estudiantiles, el
            impacto institucional y posibles reconocimientos, premios o incentivos recibidos.
          </span>
        </div>
        <p className="mb-2 text-gray-800">
          Soló podrá seleccionar un Estado y valorar de manera cuantitativa  de acuerdo a su concepto como tutor/evaluador, al igual  podrá  realizar aportes  para el mejoramiento.  Una vez realizada la valoración,  las demás preguntas se debe seleccionar {" "}
          <span className="font-bold">No aplica.</span>
        </p>
        <p className="mb-6 text-gray-800">
          Durante la implementación de la experiencia significativa, no se identifica la obtención de logros o son mínimos en relación con los objetivos propuestos. Los resultados obtenidos no han generado un impacto en la solución de las necesidades o problemáticas identificadas.
        </p>

        {/* Primer bloque */}
        <div className="flex flex-row gap-8">
          {[0, 1, 2, 3, 4, 5, -1].map((val) => (
            <label key={val} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="resultados1"
                className="custom-radio"
                value={val}
                checked={criteria.score === val}
                onChange={() => updateScore(val)}
              />
              <span className="ml-2">{val === -1 ? "No aplica" : val}</span>
            </label>
          ))}
        </div>

       

        <hr className="my-8 border-gray-300" />

        {/* Segundo bloque */}
        <div className="mb-8">
          <p className="mb-6 text-gray-800">
            Evidencia la obtención de todos los objetivos propuestos. Los resultados obtenidos evidencian impacto en la solución total de las necesidades o problemáticas identificadas.
          </p>
          <div className="flex flex-row gap-8">
            {[11, 12, 13, 14, 15].map((val) => (
              <label key={val} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="resultados2"
                  className="custom-radio"
                  value={val}
                  checked={criteria.score === val}
                  onChange={() => updateScore(val)}
                />
                <span className="ml-2">{val}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="mb-2">
          <label className="block font-semibold !text-[#2196f3] mb-2">
            Aportes para el mejoramiento frente al criterio evaluado Resultados (Si no hay aportes favor escribir "NO
            APLICA")
          </label>
          <textarea
            className="w-full border rounded p-2 min-h-[60px] focus:ring-2 focus:ring-[#2196f3]"
            placeholder="Tu respuesta"
            value={criteria.descriptionContribution ?? ""}
            onChange={(e) => updateDescription(e.target.value)}
          />
          {errors.descriptionContributionResultados && (
  <p className="text-red-500 text-sm mt-2">{errors.descriptionContributionResultados}</p>
)}
        </div>
      </div>
    </section>
  );
};

export default CriteriaResults;
