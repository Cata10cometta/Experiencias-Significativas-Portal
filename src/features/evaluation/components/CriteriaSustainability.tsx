import React from "react";
import { CriteriaEvaluation, Evaluation } from "../types/evaluation";

interface CriteriaSustainabilityProps {
  value: Evaluation;
  onChange: (value: Evaluation) => void;
  errors: Record<string, string>;
}

const CriteriaSustainability: React.FC<CriteriaSustainabilityProps> = ({ value, onChange, errors }) => {
  const CRITERIA_ID = 8; // ID real para Sostenibilidad

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

    onChange({ criteriaEvaluation: updatedCriteria } as any);
  };

  const updateDescription = (desc: string) => {
    const updatedCriteria: CriteriaEvaluation = {
      ...criteria,
      descriptionContribution: desc,
    };

    onChange({
      criteriaEvaluations: [
        ...value.criteriaEvaluations.filter((c: any) => c.criteriaId !== CRITERIA_ID),
        updatedCriteria,
      ],
    } as any);
  };

  return (
    <section className="w-full px-0 mt-4 min-h-[400px]">
      <div className="bg-[#e9ecef] rounded-t-xl px-8 py-6">
        <h2 className="text-2xl font-bold !text-[#2196f3]">Criterio: Sostenibilidad</h2>
      </div>
      <div className="px-8 pt-8 pb-8">
        {/* Intro */}
        <div className="mb-2">
          <span className="font-bold !text-[#2196f3] text-lg">Sostenibilidad,</span>
          <span className="text-gray-800 font-normal">
            {" "}
            Considera la viabilidad de mantener, fortalecer y consolidar la experiencia a lo largo del tiempo, haciendo
            énfasis en recursos humanos, técnicos, financieros e institucionales necesarios para su continuidad.
          </span>
        </div>
        <p className="mb-2 text-gray-800">
          Solo podrá seleccionar un Estado y valorar de manera cuantitativa  de acuerdo a su concepto como tutor/evaluador, al igual  podrá  realizar aportes  para el mejoramiento.  Una vez realizada la valoración,  las demás preguntas se debe seleccionar{" "}
          <span className="font-bold">No aplica.</span>
        </p>
        <p className="mb-6 text-gray-800">
          Los mecanismos que garantizan el mantenimiento, fortalecimiento y consolidación de la experiencia significativa
          dentro del establecimiento educativo son incipientes.
        </p>

        {/* Primer bloque */}
        <div className="flex flex-row gap-8">
          {[0, 1, 2, -1].map((val) => (
            <label key={val} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="sostenibilidad1"
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
            Existen acciones consolidadas que permiten garantizar la sostenibilidad de la experiencia, a partir de la institucionalización y apoyo de la comunidad educativa.  Se implementan estrategias destinadas a la articulación de acciones de cooperación con otras entidades y/o instituciones públicas o privadas, a través de planes, programas y proyectos externos al establecimiento educativo
          </p>
          <div className="flex flex-row gap-8">
            {[6, 7, 8, 9, 10].map((val) => (
              <label key={val} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sostenibilidad2"
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
            Aportes para el mejoramiento frente al criterio evaluado Sostenibilidad (Si no hay aportes favor escribir "NO APLICA")
          </label>
          <div className="relative">
            <textarea
              className="w-full border rounded p-2 min-h-[60px] focus:ring-2 focus:ring-[#2196f3] pr-14 pb-7 resize-none"
              placeholder="Tu respuesta"
              value={criteria.descriptionContribution ?? ""}
              maxLength={50}
              onChange={(e) => updateDescription(e.target.value)}
            />
            <span
              className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none bg-white px-1 z-10"
              style={{ lineHeight: '1', borderRadius: '4px' }}
            >
              {criteria.descriptionContribution?.length || 0}/50
            </span>
          </div>
          {errors.descriptionContributionSustainability && (
            <p className="text-red-500 text-sm mt-2">{errors.descriptionContributionSustainability}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CriteriaSustainability;
