import React from "react";
import { CriteriaEvaluation, Evaluation } from "../types/evaluation";

interface CriteriaEmpowermentProps {
  value: Evaluation;
  onChange: (value: Evaluation) => void;
  errors: Record<string, string>;
}

const CriteriaEmpowerment: React.FC<CriteriaEmpowermentProps> = ({ value, onChange, errors }) => {
  const CRITERIA_ID = 5; // ID real para Empoderamiento

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
      deletedAt: "",
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
        <h2 className="text-2xl font-bold !text-[#2196f3]">Criterio: Empoderamiento</h2>
      </div>
      <div className="px-8 pt-8 pb-8">
        <div className="mb-2">
          <span className="font-bold !text-[#2196f3] text-lg">Empoderamiento (liderazgo),</span>
        </div>

        <p className="mb-2 text-gray-800">
          Mide el nivel de apropiación, apoyo y promoción de la experiencia por parte de los líderes
          y la comunidad educativa, demostrando liderazgo efectivo y compromiso institucional para
          su desarrollo y sostenibilidad
        </p>

        <p className="mb-2 text-gray-800">
          Solo podrá seleccionar un Estado y valorar de manera cuantitativa de acuerdo a su concepto
          como tutor/evaluador, al igual podrá realizar aportes para el mejoramiento. Una vez
          realizada la valoración, las demás preguntas se debe seleccionar No aplica.
        </p>

        <p className="mb-6 text-gray-800">
          La experiencia significativa permanece en el contexto del aula y es poco conocida por el
          establecimiento educativo. La aceptación, apropiación y participación de diferentes
          miembros de la comunidad educativa es incipiente.
        </p>

        {/* Primer bloque */}
        <div className="flex flex-row gap-8">
          {[0, 1, 2].map((val) => (
            <label key={val} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="empoderamiento-bloque1"
                className="custom-radio"
                value={val}
                checked={criteria.score === val}
                onChange={() => updateScore(val)}
              />
              <span className="ml-2">{val}</span>
            </label>
          ))}
        </div>

        {/* Primer bloque extendido */}
        <div className="mt-12 mb-8">
          <p className="mb-6 text-gray-800">
            El líder o los líderes han orientado estrategias para el reconocimiento, aceptación,
            apropiación y participación de la comunidad en la concepción y ejecución de la
            experiencia significativa en el establecimiento educativo y se han superado las
            dificultades encontradas.
          </p>
        </div>

        <hr className="my-8 border-gray-300" />

        {/* Segundo bloque extendido */}
        <div className="mb-8">
          <p className="mb-6 text-gray-800">
            Se ha logrado una completa autonomía en el funcionamiento de la experiencia, con el apoyo
            de la comunidad educativa. Se evidencia reconocimiento, aceptación, apropiación y
            participación de la comunidad educativa en la experiencia significativa, de manera que
            esta ejerce un liderazgo activo sobre su ejecución.
          </p>
          <div className="flex flex-row gap-8">
            {[6, 7, 8, 9, 10].map((val) => (
              <label key={val} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="empoderamiento-bloque2"
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
            Aportes para el mejoramiento frente al criterio evaluado Empoderamiento (Si no hay aportes
            favor escribir "NO APLICA")
          </label>
          <textarea
            className="w-full border rounded p-2 min-h-[60px] focus:ring-2 focus:ring-[#2196f3]"
            placeholder="Tu respuesta"
            value={criteria.descriptionContribution ?? ""}
            onChange={(e) => updateDescription(e.target.value)}
          />
          {errors.descriptionContributionEmpowerment && (
  <p className="text-red-500 text-sm mt-2">{errors.descriptionContributionEmpowerment}</p>
)}
        </div>
      </div>
    </section>
  );
};

export default CriteriaEmpowerment;
