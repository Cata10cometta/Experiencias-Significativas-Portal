// src/components/AgregarExperiencia/FollowUpEvaluation.tsx
import React from "react";
import type { Objective } from "../types/experienceTypes";


interface FollowUpEvaluationProps {
  value: Objective;
  onChange: (val: Objective) => void;
}

const MAX_CHARACTERS = {
  followEvaluation: 150,
  resulsExperience: 200,
  sustainabilityExperience: 150,
  tranfer: 150,
};

const FollowUpEvaluation: React.FC<FollowUpEvaluationProps> = ({ value, onChange }) => {
  const getCharacterCountStyle = (text: string, max: number) => {
    return text.length >= max ? "text-green-500" : "text-red-500";
  };

  // valor para mostrar en textarea (usa optional chaining y fallback)
  const monitoringText = value.monitorings?.[0]?.monitoringEvaluation ?? "";
  // valor para el campo 'resultados' que ahora vive en monitorings[0].result
  const monitoringResult = value.monitorings?.[0]?.result ?? "";
  // valor para sostenibilidad y transferencia que ahora viven en monitorings[0]
  const monitoringSustainability = value.monitorings?.[0]?.sustainability ?? "";
  const monitoringTranfer = value.monitorings?.[0]?.tranfer ?? "";

  return (
    <div className=" mb-6">
      <h2 className="text-lg font-semibold mb-4">SEGUIMIENTO Y EVALUACIÓN</h2>

      {/* Seguimiento y evaluación */}
      <div className="mb-6 relative">
        <label className="block font-medium">SEGUIMIENTO Y EVALUACIÓN</label>
        <p className="text-sm text-gray-600 mb-2">
          Describa la metodología y los mecanismos establecidos...
        </p>
        <textarea
          rows={4}
          className="w-full border rounded p-2"
          value={monitoringText}
          onChange={(e) => {
            const newMonitoring = {
              ...(value.monitorings?.[0] ?? {}),
              monitoringEvaluation: e.target.value,
            };
            onChange({
              ...value,
              monitorings: [newMonitoring],
            });
          }}
          maxLength={MAX_CHARACTERS.followEvaluation} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.monitorings?.[0]?.monitoringEvaluation || "",
            MAX_CHARACTERS.followEvaluation
          )}`}
        >
          {(value.monitorings?.[0]?.monitoringEvaluation?.length || 0)}/{MAX_CHARACTERS.followEvaluation}
        </span>
      </div>

      {/* Resultados */}
      <div className="mb-6 relative">
        <label className="block font-medium">RESULTADOS</label>
        <p className="text-sm text-gray-600 mb-2">
          Especifique cuáles han sido los logros obtenidos...
        </p>
        <textarea
          rows={3}
          className="w-full border rounded p-2"
          value={monitoringResult}
          onChange={(e) => {
            const newMonitoring = {
              ...(value.monitorings?.[0] ?? {}),
              result: e.target.value,
            };
            onChange({ ...value, monitorings: [newMonitoring] });
          }}
          maxLength={MAX_CHARACTERS.resulsExperience} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.monitorings?.[0]?.result || "",
            MAX_CHARACTERS.resulsExperience
          )}`}
        >
          {value.monitorings?.[0]?.result?.length || 0}/{MAX_CHARACTERS.resulsExperience}
        </span>
      </div>

      {/* Sostenibilidad */}
      <div className="mb-6 relative">
        <label className="block font-medium">SOSTENIBILIDAD</label>
        <p className="text-sm text-gray-600 mb-2">
          Mencione las estrategias previstas para garantizar la continuidad...
        </p>
        <textarea
          rows={3}
          className="w-full border rounded p-2"
          value={monitoringSustainability}
          onChange={(e) => {
            const newMonitoring = {
              ...(value.monitorings?.[0] ?? {}),
              sustainability: e.target.value,
            };
            onChange({ ...value, monitorings: [newMonitoring] });
          }}
          maxLength={MAX_CHARACTERS.sustainabilityExperience} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.monitorings?.[0]?.sustainability || "",
            MAX_CHARACTERS.sustainabilityExperience
          )}`}
        >
          {value.monitorings?.[0]?.sustainability?.length || 0}/{MAX_CHARACTERS.sustainabilityExperience}
        </span>
      </div>

      {/* Transferencia */}
      <div className="relative">
        <label className="block font-medium">TRANSFERENCIA</label>
        <p className="text-sm text-gray-600 mb-2">
          Especifique los procesos, metodologías, mecanismos...
        </p>
        <textarea
          rows={3}
          className="w-full border rounded p-2"
          value={monitoringTranfer}
          onChange={(e) => {
            const newMonitoring = {
              ...(value.monitorings?.[0] ?? {}),
              tranfer: e.target.value,
            };
            onChange({ ...value, monitorings: [newMonitoring] });
          }}
          maxLength={MAX_CHARACTERS.tranfer} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.monitorings?.[0]?.tranfer || "",
            MAX_CHARACTERS.tranfer
          )}`}
        >
          {value.monitorings?.[0]?.tranfer?.length || 0}/{MAX_CHARACTERS.tranfer}
        </span>
      </div>
    </div>
  );
};

export default FollowUpEvaluation;
