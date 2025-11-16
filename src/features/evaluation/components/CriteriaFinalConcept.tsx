import React from "react";
import { Evaluation } from "../types/evaluation";

interface CriteriaFinalConceptProps {
  value: Evaluation;
  onChange: (value: Evaluation) => void;
  onSubmit?: () => void;
  isSaving?: boolean;
}

const CriteriaFinalConcept: React.FC<CriteriaFinalConceptProps> = () => {
  return (
    <div className=" flex flex-col p-0">
      <div className="max-w-5xl w-full mx-auto">
        <div className="bg-white rounded-lg p-6 mt-8 mb-8">
          <h2 className="text-2xl font-semibold text-sky-600 mb-4">
            4. Concepto final de Evaluación
          </h2>
          <p className="mb-4 text-gray-700">
            En esta sección se debe emitir el concepto final por cada una de las experiencias significativas, esto con base en las valoraciones anteriormente realizada y a la evolución que esta ha tenido durante su trayectoria.
          </p>
          <div className="mb-4">
            <a
              href="#"
              className="text-sky-600 font-semibold hover:underline block mb-1"
            >
              Guia de valoracion - equivalencia cuantitativa y cualitativa
            </a>
            <span className="block text-sky-600 font-semibold">
              Naciente: Menor o igual a 45 puntos
            </span>
            <span className="block text-sky-600 font-semibold">
              Creciente: Mayor de 46 y menor o igual a 79 puntos
            </span>
            <span className="block text-sky-600 font-semibold">
              Inspiradora: Mayor o igual a 80 puntos
            </span>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center pb-8">
      </div>
    </div>
  );
};

export default CriteriaFinalConcept;
