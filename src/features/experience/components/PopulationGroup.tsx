import React, { useState } from "react";
import type { Experience } from "../types/experienceTypes";

interface PopulationGroupFormProps {
  value: Experience["populationGradeIds"];
  onChange: (val: Experience["populationGradeIds"]) => void;
  options?: { id: number; nombre: string }[];
}

const defaultGrupos = [
  { id: 1, nombre: "Indígenas" },
  { id: 2, nombre: "Mestizos" },
  { id: 3, nombre: "Pequeños productores" },
  { id: 4, nombre: "Rom" },
  { id: 5, nombre: "Afrocolombianos" },
  { id: 6, nombre: "Palenqueros" },
  { id: 7, nombre: "Raizales" },
];

const PopulationGroupForm: React.FC<PopulationGroupFormProps> = ({
  value,
  onChange,
  options,
}) => {
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const selected = value ?? [];
  const grupos = options ?? defaultGrupos;

  const toggle = (id: number, checked: boolean) => {
    let newValue: number[];
    if (checked) {
      newValue = Array.from(new Set([...selected, id])); // evita duplicados
    } else {
  newValue = selected.filter((x: any) => x !== id);
    }
    onChange(newValue);
    validateSelection(newValue); // Validar después de cada cambio
  };

  const validateSelection = (selectedGroups: number[]) => {
    if (selectedGroups.length === 0) {
      setError("Debe seleccionar al menos un grupo poblacional.");
    } else {
      setError(null);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="font-semibold mb-4">GRUPO POBLACIONAL</h2>
      <div className="grid grid-cols-3 gap-2">
        {grupos.map((grupo) => (
          <label key={grupo.id} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="mr-2"
              checked={selected.includes(grupo.id)}
              onChange={(e) => toggle(grupo.id, e.target.checked)}
              aria-checked={selected.includes(grupo.id)}
              aria-label={grupo.nombre}
            />
            {grupo.nombre}
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default PopulationGroupForm;

