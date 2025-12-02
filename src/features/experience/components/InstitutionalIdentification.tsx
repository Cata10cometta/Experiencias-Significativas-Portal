import React, { useState, useEffect } from "react";
import { Institution, Experience } from "../types/experienceTypes";
import { getEnum } from "../../../Api/Services/Helper";
import { DataSelectRequest } from "../../../shared/types/HelperTypes";
import axios from "axios";

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
  errors?: Record<string, string>;
}

const MAX_CHARACTERS = {
  caracteristic: 100, // Restricción de caracteres para "Características del EE"
};

const InstitutionalIdentification: React.FC<Props> = ({ value, onChange, errors }) => {
  const [codigoDaneOptions, setCodigoDaneOptions] = useState<DataSelectRequest[]>([]);
  const [emailInstitucionalOptions, setEmailInstitucionalOptions] = useState<DataSelectRequest[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [statesOptions, setStatesOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [statesError, setStatesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      const token = localStorage.getItem("token");
      const attempts = [
        { url: `/api/StateExperience/getAll`, config: { params: { OnlyActive: true } } },
        { url: `/api/State/getAll`, config: { params: { OnlyActive: true } } },
      ];
      for (const attempt of attempts) {
        try {
          const res = await axios.get(attempt.url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            ...(attempt.config || {}),
          } as any);
          let items: any[] = [];
          if (Array.isArray(res.data)) items = res.data;
          else if (Array.isArray(res.data.data)) items = res.data.data;
          else if (Array.isArray(res.data.data?.data)) items = res.data.data.data;

          const normalized = (items || []).map((s: any) => ({ id: s.id ?? s.stateId ?? 0, name: s.name ?? s.displayText ?? String(s.id) }));
          setStatesOptions(normalized);
          setStatesError(null);
          return;
        } catch (err: any) {
          // try next
          continue;
        }
      }
      setStatesError("No se pudieron cargar los estados");
    };
    fetchStates();
  }, []);
  

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
    return text.length >= max ? "text-green-500" : "text-gray-500";
  };

  const getFieldError = (field: string, val: any) => {
    // priority to parent-provided errors
    if (errors && errors[field]) return errors[field];
    if (touched[field]) {
      if (val === undefined || val === null || String(val).trim() === "") return "Este campo es obligatorio";
    }
    return "";
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="px-6 py-6 mb-6">
        <h1 className="text-3xl font-bold text-[#00aaff]">Identificación Institucional</h1>
        <p className="text-sm text-gray-600 mt-2">Información básica del establecimiento educativo</p>
      </div>

      {/* Primera fila: Código DANE y Nombre EE (imagen) */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="font-medium">Código DANE del establecimiento educativo <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="text"
              name="codigoDane"
              value={value.codeDane || ""}
              onChange={(e) => onChange({ ...value, codeDane: e.target.value })}
              onFocus={() => onChange({ ...value, _codigoDaneFocus: true })}
              onBlur={() => {
                setTimeout(() => onChange({ ...value, _codigoDaneFocus: false }), 100);
                setTouched((s) => ({ ...s, codeDane: true }));
              }}
              aria-required
              aria-invalid={!!getFieldError("codeDane", value.codeDane)}
              className={`w-full bg-gray-50 border ${getFieldError("codeDane", value.codeDane) ? "border-red-500" : "border-gray-200"} rounded-md p-3 mt-1`}
              placeholder="Seleccione o escriba..."
              autoComplete="off"
            />
            {getFieldError("codeDane", value.codeDane) && <p className="text-red-600 text-sm mt-1">{getFieldError("codeDane", value.codeDane)}</p>}
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
          <label className="font-medium">Nombre del establecimiento educativo <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={value.name || ""}
            onChange={e => onChange({ ...value, name: e.target.value.replace(/[^A-Za-z\s]/g, "") })}
            onBlur={() => setTouched((s) => ({ ...s, name: true }))}
            aria-required
            aria-invalid={!!getFieldError("name", value.name)}
            className={`w-full bg-white border ${getFieldError("name", value.name) ? "border-red-500" : "border-gray-200"} rounded-md p-2 mt-1 text-sm`}
            placeholder="Nombre del establecimiento"
          />
          {getFieldError("name", value.name) && <p className="text-red-600 text-sm mt-1">{getFieldError("name", value.name)}</p>}
        </div>
      </div>

      {/* Segunda fila: Nombre del rector (fila completa en la imagen) */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="font-medium">Nombre del rector (a) o director (a) <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="nameRector"
            value={value.nameRector || ""}
            onChange={e => onChange({ ...value, nameRector: e.target.value.replace(/[^A-Za-z\s]/g, "") })}
            onBlur={() => setTouched((s) => ({ ...s, nameRector: true }))}
            aria-required
            aria-invalid={!!getFieldError("nameRector", value.nameRector)}
            className={`w-full bg-white border ${getFieldError("nameRector", value.nameRector) ? "border-red-500" : "border-gray-200"} rounded-md p-2 mt-1 text-sm`}
            placeholder="Nombre del rector o director"
          />
          {getFieldError("nameRector", value.nameRector) && <p className="text-red-600 text-sm mt-1">{getFieldError("nameRector", value.nameRector)}</p>}
        </div>
      </div>

      {/* Tercera fila: Municipio y Departamento */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="font-medium">Municipio / Ciudad <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="municipality"
            value={value.municipality || ""}
            onChange={e => onChange({ ...value, municipality: e.target.value.replace(/[^A-Za-z\s]/g, "") })}
            onBlur={() => setTouched((s) => ({ ...s, municipality: true }))}
            aria-required
            aria-invalid={!!getFieldError("municipality", value.municipality)}
            className={`w-full bg-white border ${getFieldError("municipality", value.municipality) ? "border-red-500" : "border-gray-200"} rounded-md p-2 mt-1 text-sm`}
            placeholder="Municipio o ciudad"
          />
          {getFieldError("municipality", value.municipality) && <p className="text-red-600 text-sm mt-1">{getFieldError("municipality", value.municipality)}</p>}
        </div>
        <div>
          <label className="font-medium">Departamento <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="departament"
            value={value.departament || ""}
            onChange={e => onChange({ ...value, departament: e.target.value.replace(/[^A-Za-z\s]/g, "") })}
            onBlur={() => setTouched((s) => ({ ...s, departament: true }))}
            aria-required
            aria-invalid={!!getFieldError("departament", value.departament)}
            className={`w-full bg-white border ${getFieldError("departament", value.departament) ? "border-red-500" : "border-gray-200"} rounded-md p-2 mt-1 text-sm`}
            placeholder="Departamento"
          />
          {getFieldError("departament", value.departament) && <p className="text-red-600 text-sm mt-1">{getFieldError("departament", value.departament)}</p>}
        </div>
      </div>

      {/* Cuarta fila: Zona y Dirección */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="font-medium">Zona del EE</label>
          <input
            type="text"
            name="eZone"
            value={value.eZone || ""}
            onChange={e => onChange({ ...value, eZone: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
            placeholder="Zona del EE"
          />
          {errors?.eZone && <p className="text-red-600 text-sm mt-1">{errors.eZone}</p>}
        </div>
        <div>
          <label className="font-medium">Dirección</label>
          <input
            type="text"
            name="address"
            value={value.address || ""}
            onChange={e => onChange({ ...value, address: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
            placeholder="Dirección"
          />
          {errors?.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
        </div>
      </div>

      {/* Teléfonos de contacto (solo una fila, ya está la Zona arriba) */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div>
          <label className="font-medium">Teléfonos de contacto</label>
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
            className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
            placeholder="Teléfonos de contacto"
          />
          {errors?.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Sexta fila: Correos institucionales */}
      <div className="mb-6">
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
            className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 mt-1"
            placeholder="Seleccione o escriba..."
            autoComplete="off"
          />
              {errors?.emailInstitucional && <p className="text-red-600 text-sm mt-1">{errors.emailInstitucional}</p>}
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
      <div className="mb-6 relative">
        <label className="block font-medium">CARACTERÍSTICAS DEL EE</label>
        <p className="text-sm text-gray-600 mb-2">
          Describa en máximo cuatro líneas las características del establecimiento educativo.
        </p>
        <textarea
          rows={3}
          className="w-full bg-white border border-gray-200 rounded-md p-2 text-sm"
          value={value.caracteristic || ""}
          onChange={(e) => onChange({ ...value, caracteristic: e.target.value })}
          maxLength={MAX_CHARACTERS.caracteristic} // Restricción de caracteres
        />
        {errors?.caracteristic && <p className="text-red-600 text-sm mt-1">{errors.caracteristic}</p>}
        <span
          className={`absolute bottom-2 right-2 inline-flex items-center justify-center w-12 h-6 bg-gray-100 border border-gray-200 rounded text-xs ${getCharacterCountStyle(
            value.caracteristic || "",
            MAX_CHARACTERS.caracteristic
          )}`}
        >
          {value.caracteristic?.length || 0}/{MAX_CHARACTERS.caracteristic}
        </span>
      </div>

      {/* Octava fila: ETC y radios */}
      <div className="grid grid-cols-2 gap-6 items-end mb-4">
        <div>
          <label>Entidad Territorial Certificada (ETC)</label>
          <input
            type="text"
            name="territorialEntity"
            value={value.territorialEntity || ""}
            onChange={(e) => onChange({ ...value, territorialEntity: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
            placeholder="Entidad Territorial Certificada"
          />
          {errors?.territorialEntity && <p className="text-red-600 text-sm mt-1">{errors.territorialEntity}</p>}
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
          {errors?.testsKnow && <p className="text-red-600 text-sm mt-1">{errors.testsKnow}</p>}
        </div>
      </div>


    </div>
  );
};

export default InstitutionalIdentification;

