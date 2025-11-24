import React from "react";
import { CriteriaEvaluation, Evaluation } from "../types/evaluation";

interface CriterioPertinenciaProps {
  value: Evaluation;
  onChange: (newValue: Evaluation) => void;
  errors: Record<string, string>; // Recibir errores como props
}

const MAX_CHARACTERS = {
  descriptionContribution: 50, // Restricción de caracteres para el campo de aportes
};

const CriterioPertinencia: React.FC<CriterioPertinenciaProps> = ({ value, onChange, errors }) => {
  const CRITERIA_ID = 1; // ID real para Pertinencia
  // Buscar el criterio por ID, o inicializarlo
  const criteria =
  value.criteriaEvaluations.find((c: any) => c.criteriaId === CRITERIA_ID) ?? {
      score: 0,
      descriptionContribution: "",
      evaluationId: 0,
      criteriaId: CRITERIA_ID,
      id: 0,
      state: true,
      createdAt: "",
      deletedAt: "",
    };

  // Manejo de puntajes
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

  // Manejo de aportes
  const updateDescription = (text: string) => {
    const updatedCriteria: CriteriaEvaluation = {
      ...criteria,
      descriptionContribution: text,
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
        <h2 className="text-2xl font-bold !text-[#2196f3]">Criterio: Pertinencia</h2>
      </div>
      <div className="px-8 pt-8 pb-8">
        <div className="mb-2">
          <span className="font-bold !text-[#2196f3] text-lg">Pertinencia:</span>
        </div>
        <p className="mb-2 text-gray-800">
          Evalúa el grado en que la experiencia responde a las necesidades, problemáticas y características del contexto educativo en que se implementa, asegurando su utilidad real y concreta para la comunidad beneficiada.
        </p>
        <p className="mb-2 text-gray-800">
          Sólo podrá seleccionar una opción de las tres descripciones del Estado y valorar de manera cuantitativa de acuerdo a su concepto como Evaluador, al igual podrá realizar aportes para el mejoramiento.
        </p>

        {/* Primer bloque */}
        <p className="mb-6 text-gray-800">
          La experiencia significativa se encuentra en un proceso de identificación de la relación y coherencia con el contexto en el cual se circunscribe, con las acciones a desarrollar, con las necesidades y problemáticas identificadas en función del desarrollo integral.
        </p>
        <div className="flex flex-row gap-8">
          {[0, 1, 2, -1].map((num) => (
            <label key={num} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="pertinencia-bloque1"
                className="custom-radio"
                value={num}
                checked={criteria.score === num}
                onChange={() => updateScore(num)}
              />
              <span className="ml-2">{num === -1 ? "No aplica" : num}</span>
            </label>
          ))}
        </div>

        {/* Segundo bloque */}
        <hr className="my-8 border-gray-300" />
        <p className="mb-6 text-gray-800">
          Se muestran avances en el proceso de identificación de la relación y coherencia con el contexto, ofreciendo respuestas consistentes con las necesidades identificadas.
        </p>
        <div className="flex flex-row gap-8">
          {[3, 4, 5].map((num) => (
            <label key={num} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="pertinencia-bloque2"
                className="custom-radio"
                value={num}
                checked={criteria.score === num}
                onChange={() => updateScore(num)}
              />
              <span className="ml-2">{num}</span>
            </label>
          ))}
        </div>

        {/* Tercer bloque */}
        <hr className="my-8 border-gray-300" />
        <p className="mb-6 text-gray-800">
          Se identifican de manera clara y detallada la relación y coherencia con el contexto, señalando cómo la experiencia aborda y desarrolla acciones para resolver las causas atribuidas a las problemáticas.
        </p>
        <div className="flex flex-row gap-8">
          {[6, 7, 8, 9, 10].map((num) => (
            <label key={num} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="pertinencia-bloque3"
                className="custom-radio"
                value={num}
                checked={criteria.score === num}
                onChange={() => updateScore(num)}
              />
              <span className="ml-2">{num}</span>
            </label>
          ))}
        </div>

        {/* Textarea de aportes */}
        <div className="mt-8">
          <label className="block font-semibold !text-[#2196f3] mb-2">
            Aportes para el mejoramiento frente al criterio evaluado Pertinencia (Si no hay aportes favor escribir "NO APLICA")
          </label>
          <div className="relative">
            <textarea
              rows={3}
              className={`w-full border rounded p-2 focus:ring-2 ${
                errors.descriptionContribution ? "border-red-500 focus:ring-red-500" : "focus:ring-[#2196f3]"
              }`}
              placeholder="Tu respuesta"
              value={criteria.descriptionContribution || ""}
              maxLength={MAX_CHARACTERS.descriptionContribution}
              onChange={(e) => updateDescription(e.target.value)}
            />
            <span
              className={`absolute bottom-2 right-2 text-xs ${
                criteria.descriptionContribution.length >= MAX_CHARACTERS.descriptionContribution
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {criteria.descriptionContribution?.length || 0}/{MAX_CHARACTERS.descriptionContribution}
            </span>
            {errors.descriptionContributionPertinencia && (
              <p className="text-red-500 text-sm mt-2">{errors.descriptionContributionPertinencia}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CriterioPertinencia;
