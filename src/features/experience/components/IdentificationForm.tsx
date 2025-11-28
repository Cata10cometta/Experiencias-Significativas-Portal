import React, { useEffect, useState } from "react";
import { getEnum } from "../../../Api/Services/Helper";
import { DataSelectRequest } from "../../../shared/types/HelperTypes";
import { Experience } from "../types/experienceTypes";
import { getToken } from "../../../Api/Services/Auth";

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
  const [lineThematics, setLineThematics] = useState<DataSelectRequest[]>([]);
  const [loadingLines, setLoadingLines] = useState(false);
  const [showOtro, setShowOtro] = useState(false);
  const [errorLines, setErrorLines] = useState<string | null>(null);
  const [statesOptions, setStatesOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingStates, setLoadingStates] = useState(false);

  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const temasEnum: DataSelectRequest[] = await getEnum("ThematicLocation");
        setTemas(temasEnum);


      } catch (error) {
        console.error("Error cargando ThematicLocation", error);
      }
    };
    fetchTemas();
  }, []);

  // Fetch possible stateExperience options (id + name) to map radio labels to ids
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
        const attempts = [
          API_BASE ? `${API_BASE}/api/StateExperience/getAll` : "https://localhost:7263/api/StateExperience/getAll",
          API_BASE ? `${API_BASE}/api/State/getAll` : "https://localhost:7263/api/State/getAll",
        ];
        const token = getToken();
        for (const url of attempts) {
          try {
            const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
            if (!res.ok) continue;
            const data = await res.json();
            const items = Array.isArray(data) ? data : data?.data ?? [];
            const normalized = (items || []).map((s: any) => ({ id: s.id ?? s.stateId ?? 0, name: s.name ?? s.displayText ?? s.description ?? String(s.id) }));
            setStatesOptions(normalized);
            break;
          } catch (err) {
            continue;
          }
        }
      } catch (err) {
        console.error("Error cargando estados:", err);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  // Fetch Line Thematic options from backend endpoint
  useEffect(() => {
    const fetchLines = async () => {
      setLoadingLines(true);
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
        const endpoint = API_BASE
          ? `${API_BASE}/api/LineThematic/getAll`
          : "https://localhost:7263/api/LineThematic/getAll";

        const token = getToken();
        const res = await fetch(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const msg = `HTTP ${res.status} ${res.statusText}`;
          console.error("LineThematic fetch failed:", msg);
          setErrorLines(msg);
          setLineThematics([]);
          return;
        }
        const data = await res.json();
        // Accept array at root or under .data
        const payload = Array.isArray(data) ? data : data?.data ?? [];
        if (Array.isArray(payload)) {
          const mapped = payload.map((d: any) => ({
            id: d.id ?? d.lineThematicId ?? d.lineId ?? d.id,
            displayText: d.name ?? d.title ?? d.displayText ?? String(d.id ?? d.name ?? d.title ?? ""),
          }));
          setLineThematics(mapped);
          setErrorLines(mapped.length === 0 ? "No se encontraron líneas temáticas." : null);
          const current = (value as any).thematicFocus ?? "";
          // si el valor actual no coincide con ningún id disponible, activamos 'Otro'
          if (current && !mapped.some((m) => String(m.id) === String(current))) setShowOtro(true);
        }
      } catch (err) {
        console.error("Error cargando LineThematic", err);
        setErrorLines((err as any)?.message ?? "Error cargando líneas temáticas");
      } finally {
        setLoadingLines(false);
      }
    };
    fetchLines();
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


      {/* Fechas de desarrollo (ahora sincronizadas con el objeto development) */}
      <div className="mb-4">
        <label className="block font-medium">Seleccione la fecha de inicio y fecha final de la Experiencia Significativa. <span className="text-red-500">*</span></label>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Fecha de inicio (días)</span>
            <input
              type="text"
              placeholder="Días (ej: 1, 15, 30)"
              className="border border-gray-200 rounded-md p-2 text-sm"
              value={value.development?.days ?? ''}
              onChange={e => {
                const days = e.target.value;
                onChange({
                  ...value,
                  development: {
                    ...value.development,
                    days
                  }
                });
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Fecha final (meses)</span>
            <input
              type="text"
              placeholder="Meses (ej: 1, 6, 12)"
              className="border border-gray-200 rounded-md p-2 text-sm"
              value={value.development?.months ?? ''}
              onChange={e => {
                const months = e.target.value;
                onChange({
                  ...value,
                  development: {
                    ...value.development,
                    months
                  }
                });
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Años</span>
            <input
              type="text"
              placeholder="Años (ej: 1, 2, 3)"
              className="border border-gray-200 rounded-md p-2 text-sm"
              value={value.development?.years ?? ''}
              onChange={e => {
                const years = e.target.value;
                onChange({
                  ...value,
                  development: {
                    ...value.development,
                    years
                  }
                });
              }}
            />
          </div>
        </div>
        <span className="text-xs text-gray-400 mt-1 block">Puedes llenar solo uno de los campos (días, meses o años).</span>
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
              value={value.thematicFocus ? String((value as any).thematicFocus) : (showOtro ? "__otro__" : "")}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__otro__") {
                  setShowOtro(true);
                  onChange({ ...value, thematicFocus: "" });
                } else {
                  setShowOtro(false);
                  // guardamos el id numérico de la línea temática
                  const num = Number(val);
                  onChange({ ...value, thematicFocus: Number.isNaN(num) ? val : String(num) });
                }
              }}
            >
              <option value="">Seleccione enfoque temático</option>
                      {lineThematics.map((lt) => (
                        <option key={lt.id} value={String(lt.id)}>
                          {lt.displayText}
                        </option>
                      ))}
            </select>

            {showOtro && (
              <input
                className="w-full bg-white border border-gray-200 rounded-md p-2 mt-3 text-sm"
                placeholder="Especificar otro enfoque temático"
                value={(value as any).thematicFocus || ""}
                onChange={(e) => onChange({ ...value, thematicFocus: e.target.value })}
              />
            )}
          </div>
        ) : (
          <div>
            <input
              className="w-full bg-white border border-gray-200 rounded-md p-2 mt-1 text-sm"
              placeholder="Enfoque temático"
              value={(value as any).thematicFocus || ""}
              onChange={(e) => onChange({ ...value, thematicFocus: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Ubicación Temática removed as requested */}
    </div>
  );
};

export default IdentificationForm;

