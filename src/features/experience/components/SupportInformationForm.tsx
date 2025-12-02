import React from "react";
import type { Monitoring } from "../types/experienceTypes";

interface SupportInformationFormProps {
  value: Monitoring ;
  onChange: (val: Monitoring) => void;
}

const SupportInformationForm: React.FC<SupportInformationFormProps> = ({ value, onChange }) => {
  // Validación de campos obligatorios
  const requiredFields = [value.monitoringEvaluation, value.sustainability];
  const isFieldEmpty = (field: any) => {
    return field === undefined || field === null || String(field).trim() === "";
  };
  const hasErrors = requiredFields.some(isFieldEmpty);

  return (
    <div className=" mb-6">
      <h2 className="font-semibold mb-4">MONITOREOS</h2>

      {/* Resumen */}
      <div className="mb-4">
        <label className="font-semibold block mb-3">
          ¿Existen metodologías o mecanismos que sirven de referencia para replicar la Experiencia Significativa en otros escenarios?:
        </label>
        <div className="flex flex-col gap-3">
          {[{ id: "si", label: "Si" }, { id: "no", label: "No" }].map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="MonitoringEvaluation"
                value={opt.id}
                checked={String(value.monitoringEvaluation || "") === opt.id}
                onChange={() => onChange({ ...value, monitoringEvaluation: opt.id })}
                className={`h-5 w-5 accent-green-600 ${isFieldEmpty(value.monitoringEvaluation) ? "border-red-500" : ""}`}
              />
              <span className="leading-tight">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Frase o metáfora */}
      <div className="mb-4">
        <label className="font-semibold block mb-3">
          ¿Cuenta con mecanismos para el seguimiento y evaluación de la implementación de la Experiencia Significativa?:
        </label>
        <div className="flex flex-col gap-3">
          {[{ id: "si", label: "Si" }, { id: "no", label: "No" }].map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="sustainability"
                value={opt.id}
                checked={String(value.sustainability || "") === opt.id}
                onChange={() => onChange({ ...value, sustainability: opt.id })}
                className={`h-5 w-5 accent-green-600 ${isFieldEmpty(value.sustainability) ? "border-red-500" : ""}`}
              />
              <span className="leading-tight">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportInformationForm;
