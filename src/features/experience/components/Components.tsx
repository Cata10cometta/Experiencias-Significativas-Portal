// src/components/AgregarExperiencia/Componentes.tsx

import React from "react";
import type { Objective } from "../types/experienceTypes";

interface Props {
  value: Objective;
  onChange: (val: Objective) => void;
}

const MAX_CHARACTERS = {
  descriptionProblem: 100,
  objectiveExperience: 100,
  enfoqueExperience: 100,
  methodologias: 150,
  innovationExperience: 150,
};

const Components: React.FC<Props> = ({ value, onChange }) => {
  const getCharacterCountStyle = (text: string, max: number) => {
    return text.length >= max ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="w-full border rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">COMPONENTES</h2>

      {/* Problema o necesidad */}
      <div className="mb-6 relative">
        <label className="block font-medium">
          PROBLEMA O NECESIDAD QUE ORIGINÓ LA EXPERIENCIA
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Describa la problemática o necesidad, que dio origen a la experiencia significativa, sus antecedentes, el escenario en el que se ha desarrollado y a quiénes beneficia...
        </p>
        <textarea
          rows={4}
          className="w-full border rounded p-2"
          value={value.descriptionProblem || ""}
          onChange={(e) => onChange({ ...value, descriptionProblem: e.target.value })}
          maxLength={MAX_CHARACTERS.descriptionProblem} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.descriptionProblem || "",
            MAX_CHARACTERS.descriptionProblem
          )}`}
        >
          {value.descriptionProblem?.length || 0}/{MAX_CHARACTERS.descriptionProblem}
        </span>
      </div>

      {/* Objetivo */}
      <div className="mb-6 relative">
        <label className="block font-medium">OBJETIVO(S)</label>
        <p className="text-sm text-gray-600 mb-2">
          Enuncie el (o los) objetivo(s) propuesto(s) para la experiencia significativa.
        </p>
        <textarea
          rows={3}
          className="w-full border rounded p-2"
          value={value.objectiveExperience || ""}
          onChange={(e) => onChange({ ...value, objectiveExperience: e.target.value })}
          maxLength={MAX_CHARACTERS.objectiveExperience} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.objectiveExperience || "",
            MAX_CHARACTERS.objectiveExperience
          )}`}
        >
          {value.objectiveExperience?.length || 0}/{MAX_CHARACTERS.objectiveExperience}
        </span>
      </div>

      {/* Enfoque teórico */}
      <div className="mb-6 relative">
        <label className="block font-medium">ENFOQUE TEÓRICO - FUNDAMENTACIÓN</label>
        <p className="text-sm text-gray-600 mb-2">
          Especifique los principales referentes pedagógicos, conceptuales, metodológicos, evaluativos, instrumentales, entre otros, que sustentan la experiencia significativa.
        </p>
        <textarea
          rows={3}
          className="w-full border rounded p-2"
          value={value.enfoqueExperience || ""}
          onChange={(e) => onChange({ ...value, enfoqueExperience: e.target.value })}
          maxLength={MAX_CHARACTERS.enfoqueExperience} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.enfoqueExperience || "",
            MAX_CHARACTERS.enfoqueExperience
          )}`}
        >
          {value.enfoqueExperience?.length || 0}/{MAX_CHARACTERS.enfoqueExperience}
        </span>
      </div>

      {/* Metodología */}
      <div className="mb-6 relative">
        <label className="block font-medium">CÓMO SE DESARROLLA - METODOLOGÍA</label>
        <p className="text-sm text-gray-600 mb-2">
          Describa las estrategias, acciones, mecanismos e instrumentos adoptados para cumplir los objetivos...
        </p>
        <textarea
          rows={4}
          className="w-full border rounded p-2"
          value={value.methodologias || ""}
          onChange={(e) => onChange({ ...value, methodologias: e.target.value })}
          maxLength={MAX_CHARACTERS.methodologias} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.methodologias || "",
            MAX_CHARACTERS.methodologias
          )}`}
        >
          {value.methodologias?.length || 0}/{MAX_CHARACTERS.methodologias}
        </span>
      </div>

      {/* Innovación */}
      <div className="relative">
        <label className="block font-medium">INNOVACIÓN</label>
        <p className="text-sm text-gray-600 mb-2">
          Mencione si ha diseñado e implementado procesos educativos o pedagógicos de manera novedosa...
        </p>
        <textarea
          rows={3}
          className="w-full border rounded p-2"
          value={value.innovationExperience || ""}
          onChange={(e) => onChange({ ...value, innovationExperience: e.target.value })}
          maxLength={MAX_CHARACTERS.innovationExperience} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.innovationExperience || "",
            MAX_CHARACTERS.innovationExperience
          )}`}
        >
          {value.innovationExperience?.length || 0}/{MAX_CHARACTERS.innovationExperience}
        </span>
      </div>
    </div>
  );
};

export default Components;
