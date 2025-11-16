import React, { useEffect, useState } from "react";
import type { Grade } from "../types/experienceTypes";

// 🔹 Exportar estos tipos para poder usarlos en el padre
export interface Nivel {
  checked: boolean;
  grados: Grade[]; // guardamos {gradeId, description}
  otro?: string;
}

export interface LevelsFormValue {
  niveles: {
    [key: string]: Nivel;
  };
}

interface LevelsFormProps {
  value: LevelsFormValue;
  onChange: (val: LevelsFormValue) => void;
}


const LevelsForm: React.FC<LevelsFormProps> = ({ value, onChange }) => {
  const [gradesOptions, setGradesOptions] = useState<any[]>([]);

  // 🔹 Cargar grados desde la API con token y query params
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem("token"); // tu token guardado
        const queryParams = new URLSearchParams({
          PageSize: "100",
          PageNumber: "1",
          Filter: "",
          AplyPagination: "false",
        });

        const res = await fetch(`/api/Grade/getAll?${queryParams.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error("Error al cargar grados");

        const data = await res.json();
        setGradesOptions(data.data);
      } catch (err) {
        console.error("Error cargando grados:", err);
      }
    };

    fetchGrades();
  }, []);

  // 🔹 Manejar check/uncheck de nivel
  const handleNivelCheck = (nivel: any, checked: boolean) => {
    const newValue: LevelsFormValue = {
      ...value,
      niveles: {
        ...value.niveles,
        [nivel.name]: {
          ...value.niveles[nivel.name],
          checked,
          grados: checked ? [{ gradeId: nivel.id, description: "" }] : [], // inicial vacío
        },
      },
    };
    onChange(newValue);
  };



  // 🔹 Manejar cambio en descripción del grado
  const handleDescripcionChange = (nivel: string, description: string) => {
    const nuevosGrados = value.niveles[nivel]?.grados.map((g) => ({
      ...g,
      description,
    }));

    const newValue: LevelsFormValue = {
      ...value,
      niveles: {
        ...value.niveles,
        [nivel]: {
          ...value.niveles[nivel],
          grados: nuevosGrados || [],
        },
      },
    };
    onChange(newValue);
  };


  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="font-semibold mb-4">
        NIVEL(ES), CICLO(S) Y GRADO(S) EN LOS QUE SE DESARROLLA LA EXPERIENCIA SIGNIFICATIVA
      </h2>

      {gradesOptions.map((nivel) => (
        <div key={nivel.name} className="flex flex-col mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={value.niveles[nivel.name]?.checked}
              onChange={(e) => handleNivelCheck(nivel, e.target.checked)}
            />
            {nivel.name}
          </label>

          {value.niveles[nivel.name]?.checked && (
              <div className="ml-6 mt-2 flex flex-col gap-2">
                {/* Input de descripción */}
                <input
                  type="text"
                  placeholder="Descripción (ej: De 1° a 3°)"
                  className="border rounded p-1"
                  value={value.niveles[nivel.name]?.grados[0]?.description || ""}
                  onChange={(e) => handleDescripcionChange(nivel.name, e.target.value)}
                />
              </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default LevelsForm;



