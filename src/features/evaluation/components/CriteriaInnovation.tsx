import React from "react";
import { CriteriaEvaluation, Evaluation } from "../types/evaluation";

interface CriteriaInnovationProps {
  value: Evaluation;
  onChange: (value: Evaluation) => void;
  errors: Record<string, string>;
}

const CriteriaInnovation: React.FC<CriteriaInnovationProps> = ({ value, onChange, errors }) => {
  const CRITERIA_ID = 3; // ID real para Innovación

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
        <h2 className="text-2xl font-bold !text-[#2196f3]">Criterio: Innovación</h2>
      </div>
      <div className="px-8 pt-8 pb-8">
        <div className="mb-2">
          <span className="font-bold !text-[#2196f3] text-lg">Innovación:</span>
        </div>

        <p className="mb-2 text-gray-800">
          Indica la incorporación de prácticas novedosas que transforman las
          costumbres institucionales, aportan nuevos enfoques teóricos o
          metodológicos y generan cambios sustanciales en los procesos
          educativos
        </p>

        <p className="mb-2 text-gray-800">
          Sólo podrá seleccionar una opción de las tres descripciones del Estado
          y valorar de manera cuantitativa de acuerdo a su concepto como
          Evaluador, al igual podrá realizar aportes para el mejoramiento. Una
          vez realizada la valoración del criterio.
        </p>

        <p className="mb-6 text-gray-800">
          La ES se encuentra en un proceso de búsqueda y definición de acciones
          novedosas, de cambios significativos en el diseño y uso de métodos,
          materiales, contenidos y recursos tecnológicos y no tecnológicos, para
          propiciar aprendizajes significativos, el desarrollo integral y la
          transformación de las prácticas, culturas y políticas institucionales.
        </p>

        {/* Primer bloque */}
        <div className="flex flex-row gap-8">
          {[0, 1, 2, 3, 4, 5].map((val) => (
              <label key={val} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`innovacion-bloque1-${val}`} // Unique name for each radio button
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
            Se ha identificado, definido e iniciado la implementación de
            acciones novedosas, con cambios significativos en el diseño y uso de
            métodos, materiales, contenidos y recursos tecnológicos y no
            tecnológicos, para propiciar aprendizajes significativos, el
            desarrollo integral y la transformación de las prácticas, culturas y
            políticas institucionales.
          </p>
          <div className="flex flex-row gap-8">
            {[6, 7, 8, 9, 10].map((val) => (
                <label
                  key={val}
                  className="inline-flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`innovacion-bloque2-${val}`} // Unique name for each radio button
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

        <hr className="my-8 border-gray-300" />

        {/* Segundo bloque extendido */}
        <div className="mb-8">
          <p className="mb-6 text-gray-800">
            Se han implementado acciones novedosas, con cambios significativos
            en el diseño y uso de métodos, materiales, contenidos y recursos
            tecnológicos y no tecnológicos y se han validado con los pares
            académicos y la comunidad.
          </p>
          <div className="flex flex-row gap-8">
            {[11, 12, 13, 14, 15].map((val) => (
                <label
                  key={val}
                  className="inline-flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`innovacion-bloque3-${val}`} // Unique name for each radio button
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
            Aportes para el mejoramiento frente al criterio evaluado Innovación
            (Si no hay aportes favor escribir "NO APLICA")
          </label>
          <textarea
            className="w-full border rounded p-2 min-h-[60px] focus:ring-2 focus:ring-[#2196f3]"
            placeholder="Tu respuesta"
            value={criteria.descriptionContribution ?? ""}
            onChange={(e) => updateDescription(e.target.value)}
          />
          {errors.descriptionContributionInnovation && (
  <p className="text-red-500 text-sm mt-2">{errors.descriptionContributionInnovation}</p>
)}
        </div>
      </div>
    </section>
  );
};

export default CriteriaInnovation;
