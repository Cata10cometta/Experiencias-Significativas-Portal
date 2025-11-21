// src/components/AgregarExperiencia/FollowUpEvaluation.tsx
import React from "react";
import type { SupportInformation } from "../types/experienceTypes";


interface FollowUpEvaluationProps {
  value: SupportInformation;
  onChange: (val: SupportInformation) => void;
}



const FollowUpEvaluation: React.FC<FollowUpEvaluationProps> = ({ value, onChange }) => {
  const getCharacterCountStyle = (text: string, max: number) => {
    return text.length >= max ? "text-green-500" : "text-red-500";
  };

  // (antes se usaban como textareas; ahora son radios 'si'/'no')

  return (
    <div className=" mb-6">
      <h2 className="text-lg font-semibold mb-4">TESTIMONIOS / SOPORTE</h2>

      {/*  */}
      <div className="mb-6">
        <label className="block font-medium mb-3">¿Durante el desarrollo de la Experiencia Significativa se evidencio reorganización y actualización permanente desde el análisis de la implementación, nuevos conocimientos, comprensiones, enfoques y métodos que contribuyen al mejoramiento de la práctica pedagógica?:</label>
        <div className="flex flex-col gap-3">
          {[
            { id: 'si', label: 'Si' },
            { id: 'no', label: 'No' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="monitoringEvaluation"
                value={opt.id}
                checked={String((value as any).summary?.[0]?.monitoringEvaluation || '') === opt.id}
                onChange={() => {
                  const newSummary = {
                    ...((value as any).summary?.[0] ?? {}),
                    monitoringEvaluation: opt.id,
                  };
                  onChange({ ...value, summary: [newSummary] } as unknown as SupportInformation);
                }}
                className="h-5 w-5 accent-green-600"
              />
              <span className="leading-tight">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-6">
        <label className="block font-medium mb-3">¿Existe un nivel alto de empoderamiento, participación y apropiación por parte de toda la comunidad educativa?:</label>
        <div className="flex flex-col gap-3">
          {[
            { id: 'si', label: 'Si' },
            { id: 'no', label: 'No' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="monitoringResult"
                value={opt.id}
                checked={String((value as any).metaphoricalPhrase || '') === opt.id}
                onChange={() => {
                  onChange({ ...value, metaphoricalPhrase: opt.id } as SupportInformation);
                }}
                className="h-5 w-5 accent-green-600"
              />
              <span className="leading-tight">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sostenibilidad */}
      <div className="mb-6">
        <label className="block font-medium mb-3">¿Cuenta con acciones, recursos tecnológicos o no tecnológicos, materiales, métodos, contenidos entre otros novedosos para su desarrollo?:</label>
        <div className="flex flex-col gap-3">
          {[
            { id: 'si', label: 'Si' },
            { id: 'no', label: 'No' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="monitoringSustainability"
                value={opt.id}
                checked={String((value as any).testimony || '') === opt.id}
                onChange={() => {
                  onChange({ ...value, testimony: opt.id } as SupportInformation);
                }}
                className="h-5 w-5 accent-green-600"
              />
              <span className="leading-tight">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Transferencia */}
      <div className="relative mb-6">
        <label className="block font-medium mb-3">¿La Experiencia Significativa cuenta con estrategias y procesos que garantizan la permanencia y mejora continua?:</label>
        <div className="flex flex-col gap-3">
          {[
            { id: 'si', label: 'Si' },
            { id: 'no', label: 'No' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="followEvaluation"
                value={opt.id}
                checked={String((value as any).followEvaluation || '') === opt.id}
                onChange={() => {
                  onChange({ ...value, followEvaluation: opt.id } as SupportInformation);
                }}
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

export default FollowUpEvaluation;
