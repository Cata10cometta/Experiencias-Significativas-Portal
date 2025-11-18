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
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4">COMPONENTES</h2>

      {/* Problema o necesidad */}
      <div className="mb-6 relative">
        <label className="block font-medium">
          Descripción del problema:
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Describa la problemática o necesidad, que dio origen a la experiencia significativa
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
        <label className="block font-medium">Objetivo propuesto:</label>
        <p className="text-sm text-gray-600 mb-2">
          Escriba el (o los) objetivo(s) propuesto(s) para la experiencia significativa.
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
        <label className="block font-medium">Logros obtenidos de acuerdo con el (o los) objetivo (s) planteado (s) :</label>
        <p className="text-sm text-gray-600 mb-2">
          Describa cuáles han sido los logros obtenidos de acuerdo con el (o los) objetivo (s) planteado (s) en la experiencia significativa.
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
        <label className="block font-medium">Productos que ha generado la Experiencia Significativa:</label>
        <p className="text-sm text-gray-600 mb-2">
          Menciones cuáles son los productos que ha generado la experiencia significativa.
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

      {/* PEI */}
      <div className="relative mb-6">
        <label className="block font-medium mb-3">¿Existe una articulación de los referentes pedagógicos , conceptuales y metodológicos que guían la Experiencia Significativa con los componentes del PEI y su proyección en el PMI?</label>
        <div className="flex flex-col gap-3">
          {[
            { id: 'si', label: 'Si' },
            { id: 'no', label: 'No' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="Pmi"
                value={opt.id}
                checked={String(value.pmi || '') === opt.id}
                onChange={() => onChange({ ...value, pmi: opt.id })}
                className="h-5 w-5 accent-green-600"
              />
              <span className="leading-tight">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

       {/* PEI */}
      <div className="relative mb-6">
        <label className="block font-medium mb-3">¿Existe coherencia de la Experiencia Significativa con el contexto donde se desarrolla y se evidencia acciones que ofrecen respuesta a las necesidades y al desarrollo integral de los NNAJ?:</label>
        <div className="flex flex-col gap-3">
          {[
            { id: 'si', label: 'Si' },
            { id: 'no', label: 'No' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="NNAJContext"
                value={opt.id}
                checked={String(value.nnaj || '') === opt.id}
                onChange={() => onChange({ ...value, nnaj: opt.id })}
                className="h-5 w-5 accent-green-600"
              />
              <span className="leading-tight">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* PEI */}
      <div className="relative">
        <label className="block font-medium mb-3">¿Cuenta con resultados a nivel de logros obtenidos  de acuerdo con los objetivos propuestos, al impacto y alternativas de solución a las problemáticas identificadas?:</label>
        <div className="flex flex-col gap-3">
          {[
            { id: 'si', label: 'Si' },
            { id: 'no', label: 'No' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="innovationExperience"
                value={opt.id}
                checked={String(value.innovationExperience || '') === opt.id}
                onChange={() => onChange({ ...value, innovationExperience: opt.id })}
                className="h-5 w-5 accent-green-600"
              />
              <span className="leading-tight">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Components;
