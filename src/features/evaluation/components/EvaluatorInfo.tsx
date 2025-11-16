import React, { useEffect, useState } from "react";
import { getEnum } from "../../../Api/Services/Helper";
import type { Evaluation } from "../types/evaluation";

interface Props {
  value: Evaluation;
  onChange: (changes: Partial<Evaluation>) => void;
  errors: Record<string, string>; // Recibir errores como props
}

const EvaluatorInfo: React.FC<Props> = ({ value, onChange, errors }) => {
  const [evaluationTypes, setEvaluationTypes] = useState<{ id: number; displayText: string }[]>([]);

  useEffect(() => {
    const fetchEvaluationTypes = async () => {
      const result = await getEnum("TypeEvaluation");
      setEvaluationTypes(result || []);
    };
    fetchEvaluationTypes();
  }, []);
  const [roles, setRoles] = useState<{ id: number; displayText: string }[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const result = await getEnum("AccompanimentRole");
      setRoles(result || []);
    };
    fetchRoles();
  }, []);

  return (
    <>
      <div className="bg-gray-100 rounded-t-lg px-6 py-3 mb-6">
        <span className="text-lg font-semibold !text-[#374151]">
          1. Información del Evaluador
        </span>
      </div>
      <p className="!text-[#374151] text-sm mb-6 px-2">
        En esta sección se registra los datos básicos del evaluador asignado a cada una de las experiencias significativas
      </p>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Rol en el acompañamiento de la experiencia significativa <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded p-2 bg-white"
            value={value.accompanimentRole}
            onChange={e => onChange({ accompanimentRole: e.target.value })}
          >
            <option value="" disabled>Elegir</option>
            {roles.map(role => (
              <option key={role.id} value={role.displayText}>{role.displayText}</option>
            ))}
          </select>
          {errors.accompanimentRole && (
            <p className="text-red-500 text-sm mt-1">{errors.accompanimentRole}</p>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="Ingrese el nombre completo"
            value={value.comments}
            onChange={e => onChange({ comments: e.target.value })}
          />
          {errors.comments && (
            <p className="text-red-500 text-sm mt-1">{errors.comments}</p>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Tipo de evaluación que aplicará a la experiencia significativa <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded p-2 bg-white"
            value={value.typeEvaluation}
            onChange={e => onChange({ typeEvaluation: e.target.value })}
          >
            <option value="" disabled>Elegir</option>
            {evaluationTypes.map(type => (
              <option key={type.id} value={type.displayText}>{type.displayText}</option>
            ))}
          </select>
          {errors.typeEvaluation && (
            <p className="text-red-500 text-sm mt-1">{errors.typeEvaluation}</p>
          )}
        </div>
      </form>
    </>
  );
};

export default EvaluatorInfo;
