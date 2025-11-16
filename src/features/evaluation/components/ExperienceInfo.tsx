import React from "react";
import type { Evaluation } from "../types/evaluation";
import "./radioCustom.css";

interface Props {
  value: Evaluation;
  onChange: (changes: Partial<Evaluation>) => void;
  errors: Record<string, string>; // Recibir errores como props
}

const ExperienceInfo: React.FC<Props> = ({ value, onChange, errors }) => {
  return (
    <>
      <div className="bg-gray-100 rounded-t-lg px-6 py-3 mb-6 mt-4">
        <span className="text-lg font-semibold !text-[#00aaff]">
          2. Información de la experiencia Significativa a evaluar
        </span>
      </div>
      <p className="!text-[#00aaff] text-sm mb-6 px-2">
        En esta sección se selecciona los datos de la experiencia significativa a
        evaluar según la información suministrada por la SEM a través de la ficha
        de registro / actualización
      </p>
      <div className="mb-6">
        <label className="block font-medium mb-1 text-gray-700">
          Seleccione la Institución Educativa a la que pertenece:{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border rounded p-2 bg-white"
          placeholder="Nombre de la institución"
          value={value.institutionName}
          onChange={e => onChange({ institutionName: e.target.value })}
        />
        {errors.institutionName && (
          <p className="text-red-500 text-sm mt-1">
            {errors.institutionName}
          </p>
        )}
      </div>
      <div className="mb-6">
        <label className="block font-medium mb-1 text-gray-700">
          Enfoque temático de la Experiencia Significativa{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border rounded p-2 bg-white"
          placeholder="Enfoque temático"
          value={value.thematicLineNames[0] || ""}
          onChange={e => onChange({ thematicLineNames: [e.target.value] })}
        />
        {errors.thematicLineNames && (
          <p className="text-red-500 text-sm mt-1">
            {errors.thematicLineNames}
          </p>
        )}
      </div>
      <div className="mb-6">
        <label className="block font-medium mb-1 text-gray-700 mb-2">
          Estado de desarrollo en el que se encuentra actualmente la experiencia{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="estado"
              className="custom-radio"
              checked={value.stateId === 1}
              onChange={() => onChange({ stateId: 1 })}
            />
            <span className="ml-2">Naciente</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="estado"
              className="custom-radio"
              checked={value.stateId === 2}
              onChange={() => onChange({ stateId: 2 })}
            />
            <span className="ml-2">Creciente</span>
          </label>
          <label className="inline-flex items-center si">
            <input
              type="radio"
              name="estado"
              className="custom-radio"
              checked={value.stateId === 3}
              onChange={() => onChange({ stateId: 3 })}
            />
            <span className="ml-2">Inspiradora</span>
          </label>
        </div>
        {errors.stateId && (
          <p className="text-red-500 text-sm mt-1">{errors.stateId}</p>
        )}
      </div>
      <div className="mb-6">
        <label className="block font-medium mb-1 text-gray-700">
          Nombre de la Experiencia Significativa.{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-175 border rounded p-2 bg-white"
          placeholder="Ingrese el nombre de la experiencia"
          value={value.experienceName}
          onChange={e => onChange({ experienceName: e.target.value })}
        />
        {errors.experienceName && (
          <p className="text-red-500 text-sm mt-1">{errors.experienceName}</p>
        )}
      </div>
    </>
  );
};

export default ExperienceInfo;
