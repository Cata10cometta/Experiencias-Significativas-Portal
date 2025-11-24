import React, { useEffect, useState } from "react";
import { getEnum } from "../../../Api/Services/Helper";
import { DataSelectRequest } from "../../../shared/types/HelperTypes";

interface IdentificationFormProps {
  value: {
    estado: string;            // siempre será "Naciente"
    ubicaciones: number[];     // ahora enviamos IDs (del enum en backend)
    otroTema: string;
    thematicLocation: string;  // texto con la descripción del enum o "Otro"
  };
  onChange: (
    value: {
      estado: string;
      ubicaciones: number[];
      otroTema: string;
      thematicLocation: string;
    }
  ) => void;
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
    let nuevasUbicaciones: number[];
    console.log(value.ubicaciones.includes(temaId));

    if (value.ubicaciones.includes(temaId)) {
      nuevasUbicaciones = value.ubicaciones.filter((t) => t !== temaId);
    } else {
      nuevasUbicaciones = [...value.ubicaciones, temaId];
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
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="font-semibold mb-4">
        IDENTIFICACIÓN DE LA EXPERIENCIA SIGNIFICATIVA
      </h2>

      {/* Ubicación Temática */}
      <div className="mb-4">
        <label className="block font-medium">Nombre con que se conoce la experiencia <span className="text-red-500">*</span></label>
        <input
          className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
          placeholder="Nombre de la experiencia"
          value={(value as any).nameExperience || ""}
          onChange={(e) => onChange({ ...value, nameExperience: e.target.value })}
        />
      </div>

      {/* Estado (radio buttons tipo óvalo) */}
      <div className="mb-4">
        <p className="mb-2 text-sm">Seleccione el Estado de desarrollo en el que se encuentra la Experiencia Significativa (realizar la autoevaluación)</p>
        {loadingStates ? (
          <div className="text-sm text-gray-500">Cargando estados...</div>
        ) : (
          <div className="flex items-center gap-6">
            {(statesOptions.length > 0 ? statesOptions : [
              { id: 1, name: 'Naciente' },
              { id: 2, name: 'Creciente' },
              { id: 3, name: 'Inspiradora' }
            ]).map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 cursor-pointer hover:bg-yellow-50 transition-all" style={{ boxShadow: (String(value.stateExperienceId) === String(opt.id)) ? '0 0 0 2px #facc15' : undefined }}>
                <input
                  type="radio"
                  name="stateExperienceId"
                  value={opt.id}
                  checked={String(value.stateExperienceId) === String(opt.id)}
                  onChange={() => onChange({ ...value, stateExperienceId: opt.id })}
                  className="form-radio h-4 w-4 text-yellow-400 border-yellow-300"
                  style={{ accentColor: '#facc15' }}
                />
                <span className="text-sm">{opt.name}</span>
              </label>
            ))}
          </div>
        )}
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
        {loadingLines ? (
          <div className="text-sm text-gray-500 mt-2">Cargando opciones...</div>
        ) : lineThematics.length > 0 ? (
          <div>
            <select
              className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
              value={(value as any).thematicFocus || (showOtro ? "__otro__" : "")}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__otro__") {
                  setShowOtro(true);
                  onChange({ ...value, thematicFocus: "" });
                } else {
                  setShowOtro(false);
                  onChange({ ...value, thematicFocus: val });
                }
              }}
            >
              <option value="">Seleccione enfoque temático</option>
              {lineThematics.map((lt) => (
                <option key={lt.id} value={lt.displayText}>
                  {lt.displayText}
                </option>
              ))}
            </select>

            {showOtro && (
              <input
                type="checkbox"
                checked={value.ubicaciones?.includes(Number(tema.id))}
                onChange={() => handleUbicacionChange(tema)}
                className="mr-2"
              />
              {tema.displayText}
            </label>
          ))}

          {/* Otro */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value.thematicLocation === "Otro"}
              onChange={handleOtroCheckbox}
              className="mr-2"
            />
            Otro
            <input
              placeholder="¿Cuál?"
              className="ml-2 border rounded p-1 w-32"
              value={value.otroTema}
              onChange={handleOtroTemaChange}
              disabled={value.thematicLocation !== "Otro"}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default IdentificationForm;

