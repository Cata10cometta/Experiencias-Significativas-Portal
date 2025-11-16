import React from "react";
import { CriteriaEvaluation, Evaluation } from "../types/evaluation";

interface CriteriaFoundationProps {
  value: Evaluation;
  onChange: (value: Evaluation) => void;
  errors: Record<string, string>;
}

const CriteriaFoundation: React.FC<CriteriaFoundationProps> = ({ value, onChange, errors }) => {
  const CRITERIA_ID = 2; // ID real para Fundamentación

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
        <h2 className="text-2xl font-bold !text-[#2196f3]">Criterio: Fundamentación</h2>
      </div>
      <div className="px-8 pt-8 pb-8">
        <div className="mb-2">
          <span className="font-bold !text-[#2196f3] text-lg">Fundamentación:</span>
          <span className="text-gray-800 font-normal">
            {" "}
            Valora la claridad y solidez de los marcos conceptuales, pedagógicos y
            metodológicos que sustentan la experiencia, así como su articulación con
            proyectos institucionales (PEI, PMI) y referentes disciplinares
          </span>
        </div>

        <p className="mb-2 text-gray-800">
          Sólo podrá seleccionar una opción de las tres descripciones del Estado y
          valorar de manera cuantitativa de acuerdo a su concepto como Evaluador, al
          igual podrá realizar aportes para el mejoramiento. Una vez realizada la
          valoración del criterio.
        </p>

        <p className="mb-6 text-gray-800">
          Aún es incipiente o se está ampliando la relación de la experiencia con los
          elementos del PEI o de los PEC, los planes de vida y de etnodesarrollo, así
          como con el PMI. Los referentes teóricos y metodológicos están en proceso de
          formulación, consolidación o validación.
        </p>

        {/* Primer bloque */}
        <div className="flex flex-row gap-8">
          {[0, 1, 2].map((val) => (
            <label key={val} className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="fundamentacion"
                className="custom-radio"
                value={val}
                checked={criteria.score === val}
                onChange={() => updateScore( val)}
              />
              <span className="ml-2">{val}</span>
            </label>
          ))}
        </div>

        {/* Segundo bloque */}
        <div className="mb-8 mt-8">
          <p className="mb-6 text-gray-800">
            La experiencia se relaciona claramente con alguno o varios elementos del
            PEI o PEC, los planes de vida y de etnodesarrollo y del PMI fortaleciendo
            así al EE. En la descripción de los referentes conceptuales y
            metodológicos, se evidencia cómo se fortalece la orientación teórica y
            metodológica.
          </p>
          <div className="flex flex-row gap-8">
            {[3, 4, 5].map((val) => (
              <label key={val} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="fundamentacion1"
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

        {/* Tercer bloque */}
        <div className="mb-8">
          <p className="mb-6 text-gray-800">
            Es clara la relación lograda por la experiencia con el PEI o el PEC, los
            planes de vida y de etnodesarrollo y con el PMI, y ha sido o puede ser
            referente para otros establecimientos educativos. Se han validado los
            elementos de soporte teórico y las metodologías de la experiencia con los
            pares académicos y la comunidad.
          </p>
          <div className="flex flex-row gap-8">
            {[6, 7, 8, 9, 10].map((val) => (
              <label key={val} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="fundamentacion2"
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
            Aportes para el mejoramiento frente al criterio evaluado Fundamentación
            (Si no hay aportes favor escribir "NO APLICA")
          </label>
          <textarea
            className="w-full border rounded p-2 min-h-[60px] focus:ring-2 focus:ring-[#2196f3]"
            placeholder="Tu respuesta"
            value={criteria.descriptionContribution ?? ""}
            onChange={(e) => updateDescription(e.target.value)}
          />
          {errors.descriptionContributionFoundation && (
  <p className="text-red-500 text-sm mt-2">{errors.descriptionContributionFoundation}</p>
)}
        </div>
      </div>
    </section>
  );
};

export default CriteriaFoundation;
