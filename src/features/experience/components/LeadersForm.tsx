import React from "react";
import { Leader } from "../types/experienceTypes";

interface LeadersFormProps {
  value: Leader[];
  onChange: (lideres: Leader[]) => void;
}

const MAX_CHARACTERS = {
  nameLeaders: 50,
  identityDocument: 10,
  email: 100,
  position: 50,
  phone: 10,
};

const LeadersForm: React.FC<LeadersFormProps> = ({ value, onChange }) => {
  const handleChange = (index: number, field: keyof Leader, newValue: string) => {
    const nuevosLideres = [...value];
    // ensure the leader object exists
    if (!nuevosLideres[index]) nuevosLideres[index] = { nameLeaders: "", identityDocument: "", email: "", position: "", phone: 0 } as Leader;
    if (field === "phone") {
      // store numeric phone
      (nuevosLideres[index][field] as any) = Number(newValue) || 0;
    } else {
      (nuevosLideres[index][field] as any) = newValue;
    }
    onChange(nuevosLideres);
  };

  const getCharacterCountStyle = (text: string, max: number) => {
    return text.length >= max ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="font-semibold mb-4">
        DATOS DEL LÍDER (ES) DE LA EXPERIENCIA SIGNIFICATIVA
      </h2>
      <div className="grid grid-cols-2 gap-6">
        {value.map((lider, i) => (
          <div key={i}>
            <p className="text-[#00aaff] font-semibold">
              {i === 0 ? "Primer Líder/Autor" : "Segundo Líder/Autor"}
            </p>

            {/* Nombre */}
            <div className="relative">
              <input
                placeholder="Nombre(s) y apellido(s)"
                className="w-full border rounded p-2 mt-1"
                value={lider?.nameLeaders || ""}
                maxLength={MAX_CHARACTERS.nameLeaders} // Restricción de caracteres
                onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  handleChange(i, "nameLeaders", val);
                }}
              />
              <span
                className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
                  lider?.nameLeaders || "",
                  MAX_CHARACTERS.nameLeaders
                )}`}
              >
                {lider?.nameLeaders?.length || 0}/{MAX_CHARACTERS.nameLeaders}
              </span>
            </div>

            {/* Documento de identidad */}
            <div className="relative">
              <input
                placeholder="Documento de identidad"
                className="w-full border rounded p-2 mt-2"
                value={lider?.identityDocument || ""}
                maxLength={MAX_CHARACTERS.identityDocument} // Restricción de caracteres
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ""); // Solo números
                  handleChange(i, "identityDocument", val);
                }}
              />
              <span
                className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
                  lider?.identityDocument || "",
                  MAX_CHARACTERS.identityDocument
                )}`}
              >
                {lider?.identityDocument?.length || 0}/{MAX_CHARACTERS.identityDocument}
              </span>
            </div>

            {/* Correo electrónico */}
            <input
              placeholder="Correo electrónico"
              className="w-full border rounded p-2 mt-2"
              value={lider?.email || ""}
              onChange={(e) => handleChange(i, "email", e.target.value)}
            />

            {/* Cargo */}
            <div className="relative">
              <input
                placeholder="Cargo"
                className="w-full border rounded p-2 mt-2"
                value={lider?.position || ""}
                maxLength={MAX_CHARACTERS.position} // Restricción de caracteres
                onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  handleChange(i, "position", val);
                }}
              />
              <span
                className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
                  lider?.position || "",
                  MAX_CHARACTERS.position
                )}`}
              >
                {lider?.position?.length || 0}/{MAX_CHARACTERS.position}
              </span>
            </div>

            {/* Teléfono */}
            <input
              placeholder="Teléfono"
              className="w-full border rounded p-2 mt-2"
              value={lider?.phone?.toString() || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); // Solo números
                handleChange(i, "phone", val);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadersForm;

