import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Experience, Development } from "../types/experienceTypes";

interface LineThematic {
  id: number;
  name: string;
}

interface ThematicFormProps {
  value: Experience;
  onChange: (value: Experience) => void;
}

const MAX_CHARACTERS = {
  crossCuttingProject: 10,
  population: 50,
  coverage: 50,
  covidPandemic: 50,
  pedagogicalStrategies: 50,
};

const ThematicForm: React.FC<ThematicFormProps> = ({ value, onChange }) => {
  const [lineasTematicas, setLineasTematicas] = useState<LineThematic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLineasTematicas = async () => {
      try {
        const token = localStorage.getItem("token"); // Si necesitas autenticación
        const response = await axios.get("/api/LineThematic/getAll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLineasTematicas(response.data.data || []);
      } catch (err) {
        setError("Error al cargar las líneas temáticas.");
      }
    };

    fetchLineasTematicas();
  }, []);

  const getCharacterCountStyle = (text: string, max: number) => {
    return text.length >= max ? "text-green-500" : "text-red-500";
  };

  // Helper para obtener pedagogicalStrategies desde developments[0]
  const readPedagogicalStrategies = (exp: Experience): string => {
    return exp.developments && exp.developments.length > 0
      ? exp.developments[0].pedagogicalStrategies ?? ""
      : "";
  };

  // Helper para actualizar pedagogicalStrategies en developments[0]
  const writePedagogicalStrategies = (exp: Experience, text: string) => {
    // Si ya hay developments, actualizamos el primero
    if (exp.developments && exp.developments.length > 0) {
      const newDevelopments = [...exp.developments];
      newDevelopments[0] = { ...newDevelopments[0], pedagogicalStrategies: text } as Development;
      onChange({ ...exp, developments: newDevelopments });
      return;
    }

    // Si no existe developments, creamos uno y lo añadimos
    const newDev: Development = { pedagogicalStrategies: text };
    onChange({ ...exp, developments: [newDev] });
  };

  // Generic reader/writer for fields stored on the first Development
  const readDevProp = (exp: Experience, prop: keyof Development): string => {
    return exp.developments && exp.developments.length > 0
      ? (exp.developments[0][prop] as string) ?? ""
      : "";
  };

  const writeDevProp = (exp: Experience, prop: keyof Development, text: string) => {
    if (exp.developments && exp.developments.length > 0) {
      const newDevelopments = [...exp.developments];
      newDevelopments[0] = { ...newDevelopments[0], [prop]: text } as Development;
      onChange({ ...exp, developments: newDevelopments });
      return;
    }
    const newDev: Development = { [prop]: text } as unknown as Development;
    onChange({ ...exp, developments: [newDev] });
  };

  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold mb-2">Tematica y Desarrollo</h2>
      <p className="text-lg text-gray-600 mb-4">Señale el área principal en la que desarrolla la Experiencia Significativa <span className="text-red-500">*</span></p>

      {error && (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      )}

      {/* Checkbox grid (no box styling) */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          {lineasTematicas.length === 0 && (
            <div className="col-span-3 text-sm text-gray-500">No hay líneas temáticas cargadas.</div>
          )}

          {lineasTematicas.map((linea) => {
            // Determine checked state by supporting multiple shapes the parent may provide
            const v: any = value || {};
            const checked = (
              // thematicLocation might be the name (string) or numeric id in some cases
              v.thematicLocation === linea.name || v.thematicLocation === linea.id ||
              // older fields
              v.thematicLineId === linea.id || (Array.isArray(v.thematicLineIds) && v.thematicLineIds[0] === linea.id)
            );

            return (
              <label key={linea.id} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="thematicLine"
                  className="mt-1 h-4 w-4 border-gray-300 rounded-full"
                  checked={checked}
                  onChange={() => {
                    // set `thematicLocation` as the thematic name (string) which the backend expects,
                    // and keep `thematicLineIds` as numeric compatibility fallback
                    onChange({ ...v, thematicLocation: linea.name, thematicLineIds: [linea.id] });
                  }}
                />
                <span className="leading-tight break-words whitespace-normal">{linea.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Educational model box (styled to match screenshot) */}
<div className="mb-6">
  <label className="block mb-2 font-medium">
    Indique el modelo educativo en el que se enmarca el desarrollo de la Experiencia Significativa
  </label>

  <div className="px-0 py-4 bg-transparent border-0">
    <div className="grid grid-cols-3 gap-3 p-0">

      {[
        { id: 'Tradicional', label: 'Tradicional' },
        { id: 'Escuela Nueva', label: 'Escuela Nueva' },
        { id: 'Aceleración del Aprendizaje', label: 'Aceleración del Aprendizaje' },
        { id: 'Caminar en Secundaria', label: 'Caminar en Secundaria' },
        { id: 'Postprimaria', label: 'Postprimaria' },
        { id: 'Círculo del Aprendizaje', label: 'Círculo del Aprendizaje' },
        { id: 'Programa para Jóvenes en Extraedad y Adultos', label: 'Programa para Jóvenes en Extraedad y Adultos' },
        { id: 'Etnoeducativa', label: 'Etnoeducativa' },
        { id: 'Media Rural', label: 'Media Rural' },
      ].map((opt) => {
        const checked = (value as any).Population?.includes(opt.id) || false;

        return (
          <label key={opt.id} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5 accent-green-600 rounded"
              checked={checked}
              onChange={(e) => {
                const current = new Set((value as any).Population || []);
                if (e.target.checked) current.add(opt.id);
                else current.delete(opt.id);

                onChange({
                  ...(value as any),
                  Population: Array.from(current),
                });
              }}
            />

            {/* Aquí agregamos mayúscula al inicio siempre */}
            <span className="leading-tight break-words whitespace-normal">
              {opt.label.charAt(0).toUpperCase() + opt.label.slice(1)}
            </span>
          </label>
        );
      })}
    </div>
  </div>
</div>



      {/* inputs removed per request (kept only checkboxes) */}
      {/* SENA techniques checklist (placed below the last section) */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Seleccione la o las Técnicas en articulación con el SENA vinculadas <span className="text-red-500">*</span></label>
        <div className="px-0 py-4 bg-transparent border-0">
          <div className="grid grid-cols-3 gap-3 p-0">
            {[
              'Contabilización De Operaciones Contables Y Financieras',
              'Asistencia Administrativa',
              'Mantenimiento De Equipos De Computo',
              'Alistamiento De Laboratorismd E Microbiologia Y Biotecnologia',
              'Cocina (Es Academica)',
              'Operación Turistica',
              'Programación De Software',
              'Mantenimiento E Instalacion De Sistemas Solares Fotovoltaicos',
              'Asesoria Comercial',
              'Asesoria Comercial Y Ventas',
              'Sistemas Teleinformaticos',
              'Servicio De Agencias De Viajes',
              'Mantenimiento Y Ensamblaje De Equipos Electronicos',
              'Implementacion Y Mantenimiento De Equipos Electronicos Industriales',
              'Ensamblaje Y Mantenimiento De Equipos De Computo',
              'Integracion De Contenidos Digitales',
              'Confecciones',
              'Panificacion',
              'Automatizacion De Sistemas Industriales',
              'Sistemas Agropecuarios Ecologicos',
              'Agroindustria',
              'Elaboracion De Productos Alimenticios',
              'Ninguna De Las Anteriores',
            ]
              .map((label) => {
                const id = label; // <-- Guarda el texto tal cual
                const cross = (value as any).CrossCuttingProject || [];
                const checked = Array.isArray(cross) ? cross.includes(label) : false;
                return (
                  <label key={id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-green-600 rounded mt-1"
                      checked={checked}
                      onChange={(e) => {
                        const current = new Set((value as any).CrossCuttingProject || []);
                        if (e.target.checked) current.add(id);
                        else current.delete(id);
                        onChange({ ...(value as any), CrossCuttingProject: Array.from(current) });
                      }}
                    />
                    <span className="leading-tight break-words whitespace-normal">{label}</span>
                  </label>
                );
              })}
          </div>
        </div>

        {/* Articulación y proyectos transversales (en developments[0].crossCuttingProject) */}
        <div className="relative">
          <label className="block mb-2 font-medium">
            Articulación y proyectos transversales
          </label>
          <input
            className="border rounded p-2 w-full"
            type="text"
            placeholder="Articulación y proyectos transversales"
            value={readDevProp(value, "crossCuttingProject")}
            maxLength={MAX_CHARACTERS.crossCuttingProject} // Restricción de caracteres
            onChange={(e) => writeDevProp(value, "crossCuttingProject", e.target.value)}
          />
          <span
            className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
              readDevProp(value, "crossCuttingProject"),
              MAX_CHARACTERS.crossCuttingProject
            )}`}
          >
            {readDevProp(value, "crossCuttingProject").length || 0}/{MAX_CHARACTERS.crossCuttingProject}
          </span>
        </div>

        {/* Cobertura (en developments[0].coverage) */}
        <div className="relative">
          <label className="block mb-2 font-medium">Cobertura</label>
          <input
            className="border rounded p-2 w-full"
            type="text"
            placeholder="Cobertura"
            value={readDevProp(value, "coverage")}
            maxLength={MAX_CHARACTERS.coverage} // Restricción de caracteres
            onChange={(e) => writeDevProp(value, "coverage", e.target.value)}
          />
          <span
            className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
              readDevProp(value, "coverage"),
              MAX_CHARACTERS.coverage
            )}`}
          >
            {readDevProp(value, "coverage").length || 0}/{MAX_CHARACTERS.coverage}
          </span>
        </div>
      </div>

          {/* Support received checklist (new) */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">Seleccione de quien o quienes a recibido apoyo para la formulación, fundamentación y/o desarrollo <span className="text-red-500">*</span></label>
            <div className="bg-white px-0 py-4">
              <div className="grid grid-cols-1 gap-3 pl-0">
                {[
                  'Tutor PTA asignado a la Institución Educativa',
                  'Practicante de Universidad pública',
                  'Practicante de Universidad privada',
                  'Empresa del Sector público',
                  'Empresa del sector privado',
                  'Docentes Universitarios',
                  'Ninguno',
                ].map((label) => {
                  const id = label;
                  const existing = Array.isArray((value as any).PedagogicalStrategies)
                    ? (value as any).PedagogicalStrategies.map((v: any) => String(v))
                    : [];
                  const checked = existing.includes(id);
                  return (
                    <label key={id} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-green-600 rounded mt-1"
                        checked={checked}
                        onChange={(e) => {
                          const current = new Set(existing);
                          if (e.target.checked) current.add(id);
                          else current.delete(id);
                          const arr = Array.from(current);
                          const payload: any = { ...(value as any), PedagogicalStrategies: arr };
                          console.debug("ThematicForm - PedagogicalStrategies changed:", arr);
                          onChange(payload);
                        }}
                      />
                      <span className="leading-tight break-words whitespace-normal">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

      
      
              {/* PEI linkage (radio) - new field inserted below supportReceived) */}
              <div className="mb-6">
                <label className="block mb-2 font-medium">La Experiencia Significativa se encuentra vinculada en el Proyecto Educativo Institucional <span className="text-red-500">*</span></label>
                <div className="px-0 py-4 bg-transparent border-0">
                  <div className="grid grid-cols-1 gap-3 p-0">
                    {[
                      'Sí, Componente pedagógico - Plan de estudios',
                      'Sí, Componente pedagógico - Proyectos Pedagógicos Transversales',
                      'Sí, Componente pedagógico - Experiencias Significativas',
                      'Sí, Componente pedagógico -Proyectos de Investigación - Ondas',
                      'Sí , Componente Gestión Comunitaria',
                      'No',
                    ].map((label) => {
                     const id = label;
                      const checked = (value as any).Coverage === id || (value as any).CoverageText === label;
                      return (
                        <label key={id} className="flex items-start gap-2 text-sm">
                          <input
                            type="radio"
                            name="peiComponent"
                            className="mt-1 h-4 w-4 border-gray-300 rounded-full"
                            checked={checked}
                            onChange={() => {
                              const payload: any = { ...(value as any), Coverage: id, CoverageText: label };
                              onChange(payload);
                            }}
                          />
                          <span className="leading-tight break-words whitespace-normal">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

    {/* Recognition (radio) - added per request */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">¿La Experiencia significativa ha tenido algún reconocimiento? <span className="text-red-500">*</span></label>
        <div className="px-0 py-4 bg-transparent border-0">
          <div className="grid grid-cols-1 gap-3 p-0">
            {[
              'Sí, al interior de la Institución Educativa',
              'Sí, por parte de una entidad privada o pública externa',
              'Aún no cuenta con reconocimiento',
            ].map((label) => {
              const id = label;
              const checked = (value as any).recognition === id || (value as any).recognitionText === label;
              return (
                <label key={id} className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name="recognition"
                    className="mt-1 h-4 w-4 border-gray-300 rounded-full"
                    checked={checked}
                    onChange={() => {
                      const payload: any = { ...(value as any), recognition: id, recognitionText: label };
                      onChange(payload);
                    }}
                  />
                  <span className="leading-tight break-words whitespace-normal">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Experience assets / supports (checkboxes) - added per request */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">La Experiencia Significativa cuenta con: <span className="text-red-500">*</span></label>
        <div className="px-0 py-4 bg-transparent border-0">
          <div className="grid grid-cols-1 gap-3 p-0">
            {[
              'Producciones (videos, cuentas de redes sociales)',
              'Publicaciones (libros, paginas web, software, cartillas)',
              'Constancia de participación en eventos de divulgación',
              'Ninguna de las anteriores',
            ].map((label) => {
             const id = label;
              const existing = Array.isArray((value as any).socialization)
                ? (value as any).socialization.map((v: any) => String(v))
                : Array.isArray((value as any).socializationLabels)
                ? (value as any).socializationLabels.map((v: any) => String(v))
                : [];
              const checked = existing.includes(id);
              return (
                <label key={id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-green-600 rounded mt-1"
                    checked={checked}
                    onChange={(e) => {
                      const current = new Set(existing);
                      if (e.target.checked) current.add(id);
                      else current.delete(id);
                      const arr = Array.from(current);
                      const payload: any = { ...(value as any), socialization: arr, socializationLabels: arr };
                      console.debug("ThematicForm - socialization changed:", arr);
                      onChange(payload);
                    }}
                  />
                  <span className="leading-tight break-words whitespace-normal">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThematicForm;
