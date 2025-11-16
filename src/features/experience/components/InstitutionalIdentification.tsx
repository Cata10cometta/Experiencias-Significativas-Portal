import React, { useState, useEffect } from "react";
import { Institution, Experience } from "../types/experienceTypes";
import { getEnum } from "../../../Api/Services/Helper";
import { DataSelectRequest } from "../../../shared/types/HelperTypes";

interface Props {
  value: (Institution & Partial<Experience>) & {
    _codigoDaneFocus?: boolean;
    _emailInstitucionalFocus?: boolean;
  };
  onChange: (
    value: (Institution & Partial<Experience>) & {
      _codigoDaneFocus?: boolean;
      _emailInstitucionalFocus?: boolean;
    }
  ) => void;
}

const MAX_CHARACTERS = {
  caracteristic: 100, // Restricción de caracteres para "Características del EE"
};

const InstitutionalIdentification: React.FC<Props> = ({ value, onChange }) => {
  const [codigoDaneOptions, setCodigoDaneOptions] = useState<DataSelectRequest[]>([]);
  const [emailInstitucionalOptions, setEmailInstitucionalOptions] = useState<DataSelectRequest[]>([]);
  const [] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchEnums = async () => {
      const dane = await getEnum("CodeDane");
      setCodigoDaneOptions(dane);

      const emails = await getEnum("EmailInstitucional");
      setEmailInstitucionalOptions(emails);
    };
    fetchEnums();
  }, []);


  

  const getCharacterCountStyle = (text: string, max: number) => {
    return text.length >= max ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="font-semibold mb-4">IDENTIFICACIÓN INSTITUCIONAL</h2>

      {/* Primera fila: Nombre experiencia */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label>Nombre con que se conoce la experiencia</label>
          <input
            type="text"
            name="nameExperiences"
            value={value.nameExperiences || ""}
            onChange={e =>
    onChange({
      ...value,
      nameExperiences: e.target.value.replace(/[^A-Za-z\s]/g, ""), // solo letras y espacios
    })
  }
            className="w-full border rounded p-2 mt-1"
            placeholder="Nombre de la experiencia"
          />
        </div>
      </div>

      {/* Segunda fila: Código DANE y Nombre EE */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label>Código DANE del establecimiento educativo</label>
          <div className="relative">
            <input
              type="text"
              name="codigoDane"
              value={value.codeDane || ""}
              onChange={(e) => onChange({ ...value, codeDane: e.target.value })}
              onFocus={() => onChange({ ...value, _codigoDaneFocus: true })}
              onBlur={() =>
                setTimeout(() => onChange({ ...value, _codigoDaneFocus: false }), 100)
              }
              className="w-full border rounded p-2 mt-1"
              placeholder="Seleccione o escriba..."
              autoComplete="off"
            />
            {value._codigoDaneFocus && (
              <ul className="absolute left-0 z-10 bg-white border border-gray-300 rounded-md w-full mt-1 max-h-40 overflow-y-auto shadow-lg">
                {(value.codeDane
                  ? codigoDaneOptions.filter((opt) =>
                      String(opt.id)
                        .toLowerCase()
                        .includes(value.codeDane?.toLowerCase())
                    )
                  : codigoDaneOptions
                ).map((opt) => (
                  <li
                    key={opt.id}
                    className="px-3 py-2 cursor-pointer hover:bg-indigo-100"
                    onMouseDown={() =>
                      onChange({
                        ...value,
                        codeDane: String(opt.id),
                        _codigoDaneFocus: false,
                      })
                    }
                  >
                    {opt.id}
                  </li>
                ))}
                {value.codeDane &&
                  codigoDaneOptions.filter((opt) =>
                    String(opt.id)
                      .toLowerCase()
                      .includes(value.codeDane?.toLowerCase())
                  ).length === 0 && (
                    <li className="px-3 py-2 text-gray-400">Sin coincidencias</li>
                  )}
              </ul>
            )}
          </div>
        </div>
        <div>
          <label>Nombre del establecimiento educativo</label>
          <input
            type="text"
            name="name"
            value={value.name || ""}
            onChange={e =>
    onChange({
      ...value,
      name: e.target.value.replace(/[^A-Za-z\s]/g, ""), // solo letras y espacios
    })
  }
            className="w-full border rounded p-2 mt-1"
            placeholder="Nombre del establecimiento"
          />
        </div>
      </div>

      {/* Tercera fila: Rector y Departamento */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label>Nombre del rector (a) o director (a)</label>
          <input
            type="text"
            name="nameRector"
            value={value.nameRector || ""}
            onChange={e =>
    onChange({
      ...value,
      nameRector: e.target.value.replace(/[^A-Za-z\s]/g, ""),
    })
  }
            className="w-full border rounded p-2 mt-1"
            placeholder="Nombre del rector o director"
          />
        </div>
        <div>
          <label>Departamento</label>
          <input
            type="text"
            name="departament"
            value={value.departament || ""}
            onChange={e =>
    onChange({
      ...value,
    departament: e.target.value.replace(/[^A-Za-z\s]/g, ""), // solo letras y espacios
    })
  }
            className="w-full border rounded p-2 mt-1"
            placeholder="Departamento"
          />
        </div>
      </div>

      {/* Cuarta fila: Municipio y Dirección */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label>Municipio / Ciudad</label>
          <input
            type="text"
            name="municipality"
            value={value.municipality || ""}
            onChange={e =>
    onChange({
      ...value,
      municipality: e.target.value.replace(/[^A-Za-z\s]/g, ""), // solo letras y espacios
    })
  }
            className="w-full border rounded p-2 mt-1"
            placeholder="Municipio o ciudad"
          />
        </div>
        <div>
          <label>Dirección</label>
          <input
            type="text"
            name="address"
            value={value.address || ""}
            onChange={e => onChange({ ...value, address: e.target.value })}
            className="w-full border rounded p-2 mt-1"
            placeholder="Dirección"
          />
        </div>
      </div>

      {/* Quinta fila: Zona y Teléfonos */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label>Zona del EE</label>
          <input
            type="text"
            name="eZone"
            value={value.eZone || ""}
            onChange={e => onChange({ ...value, eZone: e.target.value })}
            className="w-full border rounded p-2 mt-1"
            placeholder="Zona del EE"
          />
        </div>
        <div>
          <label>Teléfonos de contacto</label>
          <input
            type="text"
            name="phone"
            value={value.phone || ""}
            maxLength={10}
  onChange={(e) =>
    onChange({
      ...value,
      phone: Number(e.target.value.replace(/\D/g, "")), // solo números
    })
  }
            className="w-full border rounded p-2 mt-1"
            placeholder="Teléfonos de contacto"
          />
        </div>
      </div>

      {/* Sexta fila: Correos institucionales */}
      <div className="mb-4">
        <label>Correos electrónicos institucionales</label>
        <div className="relative">
          <input
            type="email"
            name="correos"
            value={value.emailInstitucional || ""}
            onChange={(e) =>
              onChange({ ...value, emailInstitucional: e.target.value })
            }
            onFocus={() =>
              onChange({ ...value, _emailInstitucionalFocus: true })
            }
            onBlur={() =>
              setTimeout(
                () =>
                  onChange({ ...value, _emailInstitucionalFocus: false }),
                100
              )
            }
            className="w-full border rounded p-2 mt-1"
            placeholder="Seleccione o escriba..."
            autoComplete="off"
          />
          {value._emailInstitucionalFocus && (
            <ul className="absolute left-0 z-10 bg-white border border-gray-300 rounded-md w-full mt-1 max-h-40 overflow-y-auto shadow-lg">
              {(value.emailInstitucional
                ? emailInstitucionalOptions.filter((opt) =>
                    opt.displayText
                      .toLowerCase()
                      .includes(value.emailInstitucional?.toLowerCase())
                  )
                : emailInstitucionalOptions
              ).map((opt) => (
                <li
                  key={opt.id}
                  className="px-3 py-2 cursor-pointer hover:bg-indigo-100"
                  onMouseDown={() =>
                    onChange({
                      ...value,
                      emailInstitucional: opt.displayText,
                      _emailInstitucionalFocus: false,
                    })
                  }
                >
                  {opt.displayText}
                </li>
              ))}
              {value.emailInstitucional &&
                emailInstitucionalOptions.filter((opt) =>
                  opt.displayText
                    .toLowerCase()
                    .includes(value.emailInstitucional?.toLowerCase())
                ).length === 0 && (
                  <li className="px-3 py-2 text-gray-400">Sin coincidencias</li>
                )}
            </ul>
          )}
        </div>
      </div>

      {/* Séptima fila: Características del EE */}
      <div className="mb-4 relative">
        <label className="block font-medium">CARACTERÍSTICAS DEL EE</label>
        <p className="text-sm text-gray-600 mb-2">
          Describa en máximo cuatro líneas las características del establecimiento educativo.
        </p>
        <textarea
          rows={4}
          className="w-full border rounded p-2"
          value={value.caracteristic || ""}
          onChange={(e) => onChange({ ...value, caracteristic: e.target.value })}
          maxLength={MAX_CHARACTERS.caracteristic} // Restricción de caracteres
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
            value.caracteristic || "",
            MAX_CHARACTERS.caracteristic
          )}`}
        >
          {value.caracteristic?.length || 0}/{MAX_CHARACTERS.caracteristic}
        </span>
      </div>

      {/* Octava fila: ETC y radios */}
      <div className="grid grid-cols-2 gap-4 items-end mb-2">
        <div>
          <label>Entidad Territorial Certificada (ETC)</label>
          <input
            type="text"
            name="territorialEntity"
            value={value.territorialEntity || ""}
            onChange={(e) => onChange({ ...value, territorialEntity: e.target.value })}
            className="w-full border rounded p-2 mt-1"
            placeholder="Entidad Territorial Certificada"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1">¿Participará en el Evento Compartir de Saberes?</label>
          <div className="flex items-center gap-4 mt-1">
            <label className="flex items-center">
              <input
                type="radio"
                name="participaEvento"
                checked={value.testsKnow === "Sí"}
                onChange={() => onChange({ ...value, testsKnow: "Sí" })}
              />
              <span className="ml-2">Sí</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="participaEvento"
                checked={value.testsKnow === "No"}
                onChange={() => onChange({ ...value, testsKnow: "No" })}
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalIdentification;

