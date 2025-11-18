import React, { useEffect, useState } from "react";
import { getEnum } from "../../../Api/Services/Helper";
import { DataSelectRequest } from "../../../shared/types/HelperTypes";
import { Experience } from "../types/experienceTypes";  

type IdentificationValue = Partial<Experience> & {
  estado?: string;
  ubicaciones?: number[];
  otroTema?: string;
  thematicLocation?: string;
  nameExperience?: string; // UI-only helper (will be mapped to backend field later)
  development?: { days?: string; months?: string; years?: string };
  thematicFocus?: string;
};

interface IdentificationFormProps {
  value: IdentificationValue;
  onChange: (value: IdentificationValue) => void;
}

const IdentificationForm: React.FC<IdentificationFormProps> = ({ value, onChange }) => {
  const [temas, setTemas] = useState<DataSelectRequest[]>([]);

  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const temasEnum: DataSelectRequest[] = await getEnum("ThematicLocation");
        setTemas(temasEnum);

        // estado fijo: "Naciente" (Id=1 en la DB)
        if (!value.estado) {
          onChange({ ...value, estado: "Naciente" });
        }
      } catch (error) {
        console.error("Error cargando ThematicLocation", error);
      }
    };
    fetchTemas();
  }, []);

  const handleUbicacionChange = (tema: DataSelectRequest) => {
    const temaId = tema.id;
    const current = value.ubicaciones ?? [];
    let nuevasUbicaciones: number[];

    if (current.includes(temaId)) {
      nuevasUbicaciones = current.filter((t) => t !== temaId);
    } else {
      nuevasUbicaciones = [...current, temaId];
    }

    onChange({
      ...value,
      ubicaciones: nuevasUbicaciones,
      thematicLocation: nuevasUbicaciones.length > 0
        ? temas
            .filter((t) => nuevasUbicaciones.includes(Number(t.id)))
            .map((t) => t.displayText)
            .join(", ")
        : "",
    });
  };

  const handleOtroCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onChange({
        ...value,
        thematicLocation: "Otro",
      });
    } else {
      onChange({
        ...value,
        thematicLocation: "",
        otroTema: "",
      });
    }
  };

  const handleOtroTemaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, otroTema: e.target.value });
  };

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold mb-1">Identificacion De La Experiencia Significativa</h1>
      <p className="text-sm text-gray-600 mb-6">Registrar los datos solicitados de las experiencia significativa</p>

      {/* Nombre experiencia - full width */}
      <div className="mb-4">
        <label className="block font-medium">Nombre con que se conoce la experiencia <span className="text-red-500">*</span></label>
        <input
          className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
          placeholder="Nombre de la experiencia"
          value={(value as any).nameExperience || ""}
          onChange={(e) => onChange({ ...value, nameExperience: e.target.value })}
        />
      </div>

      {/* Estado (radios) */}
      <div className="mb-4">
        <p className="mb-2 text-sm">Seleccione el Estado de desarrollo en el que se encuentra la Experiencia Significativa (realizar la autoevaluación)</p>
        <div className="flex items-center gap-6">
          {['Naciente','Creciente','Inspiradora'].map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name="estado"
                value={opt}
                checked={value.estado === opt}
                onChange={() => onChange({ ...value, estado: opt })}
                className="form-radio h-4 w-4 text-yellow-400 border-yellow-300"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tiempo de desarrollo */}
      <div className="mb-4">
        <label className="block font-medium">Seleccione el tiempo de desarrollo de la Experiencia Significativa. <span className="text-red-500">*</span></label>
        <div className="flex items-center gap-4 mt-2">
          <input
            placeholder="Días"
            className="w-20 border border-gray-200 rounded-md p-2 text-sm"
            value={(value as any).development?.days ?? ''}
            onChange={(e) => onChange({ ...value, development: { ...(value as any).development, days: e.target.value } })}
          />
          <input
            placeholder="Meses"
            className="w-20 border border-gray-200 rounded-md p-2 text-sm"
            value={(value as any).development?.months ?? ''}
            onChange={(e) => onChange({ ...value, development: { ...(value as any).development, months: e.target.value } })}
          />
          <input
            placeholder="Años"
            className="w-20 border border-gray-200 rounded-md p-2 text-sm"
            value={(value as any).development?.years ?? ''}
            onChange={(e) => onChange({ ...value, development: { ...(value as any).development, years: e.target.value } })}
          />
        </div>
      </div>

      {/* Enfoque temático */}
      <div className="mb-6">
        <label className="block font-medium">Enfoque temático de la Experiencia Significativa <span className="text-red-500">*</span></label>
        <input
          className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
          placeholder="Enfoque temático"
          value={(value as any).thematicFocus || ''}
          onChange={(e) => onChange({ ...value, thematicFocus: e.target.value })}
        />
      </div>

      {/* Ubicación Temática removed as requested */}
    </div>
  );
};

export default IdentificationForm;

