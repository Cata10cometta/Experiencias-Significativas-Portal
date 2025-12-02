import React from "react";
import { CriteriaEvaluation, Evaluation } from "../types/evaluation";

interface CriteriaTransformationProps {
  value: Evaluation;
  onChange: (newValue: Evaluation) => void;
  errors: Record<string, string>;
}

const CriteriaTransformation: React.FC<CriteriaTransformationProps> = ({ value, onChange, errors }) => {
  const CRITERIA_ID = 7; // ID real para Transformación

  // Buscar si ya existe el objeto para este criterioId
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
    const updated: CriteriaEvaluation = {
      ...criteria,
      score,
    };

    onChange({ criteriaEvaluation: updated } as any);
  };

  const updateDescription = (desc: string) => {
    const updated: CriteriaEvaluation = { ...criteria, descriptionContribution: desc };

    onChange({
      criteriaEvaluations: [
        ...value.criteriaEvaluations.filter((c: any) => c.criteriaId !== CRITERIA_ID),
        updated,
      ],
    } as any);
  };

  return (
    <section className="w-full px-0 mt-4 min-h-[400px]">
      <div className="bg-[#e9ecef] rounded-t-xl px-8 py-6">
        <h2 className="text-2xl font-bold !text-[#2196f3]">Criterio: Transformación</h2>
      </div>
      <div className="px-8 pt-8 pb-8">
        <div className="mb-2">
          <span className="font-bold !text-[#2196f3] text-lg">Transformación:</span>
          <span className="text-gray-800 font-normal">
            Evalúa la capacidad de la experiencia para provocar cambios relevantes y sostenibles en las prácticas,
            saberes y relaciones escolares, impactando positivamente en la cultura institucional y los aprendizajes
          </span>
        </div>
        <p className="mb-2 text-gray-800">
          Solo podrá seleccionar un Estado y valorar de manera cuantitativa de acuerdo a su concepto como tutor/evaluador,
          al igual podrá realizar aportes para el mejoramiento. Una vez realizada la valoración, las demás preguntas se
          debe seleccionar <span className="font-bold">No aplica</span>.
        </p>
        <p className="mb-6 text-gray-800">
          Se encuentran proyectando procesos autorreflexivos y valorativos para reorganizar y actualizar elementos
          conceptuales, metodológicos e instrumentales, de acuerdo con los resultados de su implementación, con el
          propósito de generar acciones de mejoramiento tanto de la práctica, como del proceso educativo en general. No
          se identifica cómo ha aprendido de sus resultados, ni si los ha usado para su mejoramiento.
        </p>

        {/* Primer bloque */}
        <div className="flex flex-row gap-8">
          {[0, 1, 2, -1].map((val) => (
            <label key={val} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name={`transformacion1-${CRITERIA_ID}`}
                className="custom-radio"
                value={val}
                checked={criteria.score === val}
                onChange={() => updateScore(val)}
              />
              <span className="ml-2">{val === -1 ? "No aplica" : val}</span>
            </label>
          ))}
        </div>

        {/* Primer bloque extendido */}
        <div className="mt-12 mb-8">
          <p className="mb-6 text-gray-800">
            Existen o se están implementando nuevos elementos conceptuales, metodológicos e instrumentales, para generar,
            a lo largo del tiempo, acciones de mejoramiento tanto de la práctica, como del proceso educativo en general y
            en función del desarrollo integral de niños, niñas, adolescentes, jóvenes y adultos.
          </p>
        </div>

        <hr className="my-8 border-gray-300" />

        {/* Segundo bloque */}
        <div className="mb-8">
          <p className="mb-6 text-gray-800">
            La experiencia se ha convertido en punto de referencia en la implementación de elementos conceptuales,
            metodológicos, instrumentales para la formulación de acciones pedagógicas de los docentes del establecimiento
            educativo. Se identifican elementos que le permiten a la experiencia trascender como plan, programa, proyecto
            o intervención, aportando nuevos conocimientos para el desarrollo integral de los niños, niñas, adolescentes,
            jóvenes y adultos, de las áreas de gestión y de las prácticas, culturas y políticas institucionales.
          </p>
          <div className="flex flex-row gap-8">
            {[6, 7, 8, 9, 10].map((val) => (
              <label key={val} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`transformacion2-${CRITERIA_ID}`}
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

        {/* Textarea de aportes */}
        <div className="mb-2">
          <label className="block font-semibold !text-[#2196f3] mb-2">
            Aportes para el mejoramiento frente al criterio evaluado Transformación (Si no hay aportes favor escribir "NO APLICA")
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
          {errors.descriptionContributionTransformation && (
            <p className="text-red-500 text-sm mt-2">{errors.descriptionContributionTransformation}</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default CriteriaTransformation;
