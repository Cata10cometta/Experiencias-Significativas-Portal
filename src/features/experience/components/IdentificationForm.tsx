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
        <p>{value.estado}</p>
        <p className="mb-2">Ubicación Temática</p>
        <div className="grid grid-cols-3 gap-2">
          {temas.map((tema) => (
            <label key={tema.id} className="flex items-center">
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

