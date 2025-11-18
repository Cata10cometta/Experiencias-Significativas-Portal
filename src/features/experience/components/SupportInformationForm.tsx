import React from "react";
import type { Objective, SupportInformation } from "../types/experienceTypes";

interface SupportInformationFormProps {
  value: Objective & Partial<SupportInformation>;
  onChange: (val: Objective & Partial<SupportInformation>) => void;
}

const MAX_CHARACTERS = {
  summary: 150,
  metaphoricalPhrase: 100,
  testimony: 200,
};

const SupportInformationForm: React.FC<SupportInformationFormProps> = ({ value, onChange }) => {
  const getCharacterCountStyle = (text: string, max: number) => {
    return text.length >= max ? "text-green-500" : "text-red-500";
  };

  return (
    <div className=" mb-6">
      <h2 className="font-semibold mb-4">INFORMACIÓN DE APOYO</h2>

      {/* Resumen */}
      <div className="mb-4 relative">
        <label htmlFor="summary" className="font-semibold">
          Resumen
        </label>
        <p className="text-sm text-gray-600 mb-1">
          En media página, como máximo, sintetice la experiencia significativa. • Con una o dos palabras indique el tipo de experiencia significativa (programa, proyecto, plan, estrategia etc). • En una frase de dos renglones el objetivo principal de la experiencia significativa. • En un texto de máximo 4 renglones describir las principales acciones para cumplir el o los objetivos. • En un texto de máximo 4 renglones mencionar los principales resultados de la experiencia significativa.
        </p>
        <textarea
          id="summary"
          className="w-full border rounded p-2"
          rows={5}
          value={value.summary || ""}
          onChange={(e) => onChange({ ...value, summary: e.target.value })}
          maxLength={MAX_CHARACTERS.summary} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.summary || "",
            MAX_CHARACTERS.summary
          )}`}
        >
          {value.summary?.length || 0}/{MAX_CHARACTERS.summary}
        </span>
      </div>

      {/* Frase o metáfora */}
      <div className="mb-4 relative">
        <label htmlFor="metaphoricalPhrase" className="font-semibold">
          Frase o metáfora inspiradora (Opcional)
        </label>
        <p className="text-sm text-gray-600 mb-1">
          En máximo 3 líneas escriba una frase inspiradora o metáfora relacionada con la experiencia significativa. Si la frase es de un personaje deben incluir la cita.
        </p>
        <textarea
          id="metaphoricalPhrase"
          className="w-full border rounded p-2"
          rows={3}
          value={value.metaphoricalPhrase || ""}
          onChange={(e) =>
            onChange({ ...value, metaphoricalPhrase: e.target.value })
          }
          maxLength={MAX_CHARACTERS.metaphoricalPhrase} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.metaphoricalPhrase || "",
            MAX_CHARACTERS.metaphoricalPhrase
          )}`}
        >
          {value.metaphoricalPhrase?.length || 0}/{MAX_CHARACTERS.metaphoricalPhrase}
        </span>
      </div>

      {/* Testimonio */}
      <div className="mb-4 relative">
        <label htmlFor="testimony" className="font-semibold">
          Testimonio (Opcional)
        </label>
        <p className="text-sm text-gray-600 mb-1">
          En máximo seis líneas, escriba el testimonio de uno o dos integrantes
          de la comunidad educativa referido al impacto que ha tenido la
          experiencia significativa.
        </p>
        <textarea
          id="testimony"
          className="w-full border rounded p-2"
          rows={3}
          value={value.testimony || ""}
          onChange={(e) =>
            onChange({ ...value, testimony: e.target.value })
          }
          maxLength={MAX_CHARACTERS.testimony} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.testimony || "",
            MAX_CHARACTERS.testimony
          )}`}
        >
          {value.testimony?.length || 0}/{MAX_CHARACTERS.testimony}
        </span>
      </div>
    </div>
  );
};

export default SupportInformationForm;
