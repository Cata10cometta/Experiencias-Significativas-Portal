import React from "react";
import { Leader } from "../types/experienceTypes";

interface LeadersFormProps {
  value: Leader[];
  onChange: (lideres: Leader[]) => void;
  // optional: when provided, only render the leader at this index (0 or 1)
  index?: number;
  errors?: Record<string, string>;
}

const MAX_CHARACTERS = {
  nameLeaders: 50,
  identityDocument: 10,
  email: 100,
  position: 50,
  phone: 10,
};

const LeadersForm: React.FC<LeadersFormProps> = ({ value, onChange, index, errors }) => {
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
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-[#0b6fa8] mb-1">Líder Principal De La Experiencia</h1>
      <p className="text-sm text-gray-600 mb-4">Información básica del líder de la experiencia</p>

      {(index !== undefined ? [value[index] ?? ({} as Leader)] : value).map((lider, i) => {
        const actualIndex = index !== undefined ? index : i;
        return (
          <div key={actualIndex} className="mb-6">

            {/* Nombre - full width */}
            <div className="mb-4">
              <label className="block font-medium">Nombre (s) y apellido (s) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  placeholder="Nombre(s) y apellido(s)"
                  className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
                  value={lider?.nameLeaders || ""}
                  maxLength={MAX_CHARACTERS.nameLeaders}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
                    handleChange(actualIndex, "nameLeaders", val);
                  }}
                />
                {(errors?.leaderName || errors?.nameLeaders) && (
                  <p className="text-red-600 text-sm mt-1">{errors.leaderName || errors.nameLeaders}</p>
                )}
                <span className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(lider?.nameLeaders || "", MAX_CHARACTERS.nameLeaders)}`}>
                  {lider?.nameLeaders?.length || 0}/{MAX_CHARACTERS.nameLeaders}
                </span>
              </div>
            </div>

            {/* Documento y Correo - two columns */}
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block font-medium">Documentos de identidad <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    placeholder="Documento de identidad"
                    className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
                    value={lider?.identityDocument || ""}
                    maxLength={MAX_CHARACTERS.identityDocument}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      handleChange(actualIndex, "identityDocument", val);
                    }}
                  />
                  <span className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(lider?.identityDocument || "", MAX_CHARACTERS.identityDocument)}`}>
                    {lider?.identityDocument?.length || 0}/{MAX_CHARACTERS.identityDocument}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium">Correo electrónico <span className="text-red-500">*</span></label>
                <input
                  placeholder="Correo electrónico"
                  className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
                  value={lider?.email || ""}
                  onChange={(e) => handleChange(actualIndex, "email", e.target.value)}
                />
                {(errors?.leaderEmail || errors?.email) && (
                  <p className="text-red-600 text-sm mt-1">{errors.leaderEmail || errors.email}</p>
                )}
              </div>
            </div>

            {/* Cargo y Teléfono - two columns */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-medium">Cargo <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    placeholder="Cargo"
                    className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
                    value={lider?.position || ""}
                    maxLength={MAX_CHARACTERS.position}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
                      handleChange(actualIndex, "position", val);
                    }}
                  />
                  <span className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(lider?.position || "", MAX_CHARACTERS.position)}`}>
                    {lider?.position?.length || 0}/{MAX_CHARACTERS.position}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium">Teléfonos de contacto</label>
                <input
                  placeholder="Teléfono"
                  className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
                  value={lider?.phone?.toString() || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    handleChange(actualIndex, "phone", val);
                  }}
                />
                {(errors?.leaderPhone || errors?.phone) && (
                  <p className="text-red-600 text-sm mt-1">{errors.leaderPhone || errors.phone}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadersForm;

