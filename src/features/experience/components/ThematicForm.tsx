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
    <div className="border rounded-lg p-4 mb-6">
      <h2 className="font-semibold mb-4">TEMÁTICA Y DESARROLLO</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Temática de la experiencia significativa */}
        <div>
          <label className="block mb-2 font-medium">
            Temática de la experiencia significativa
          </label>
          <select
            className="border rounded p-2 w-full"
            value={value.thematicLineIds?.join(", ") || ""}
            onChange={(e) =>
              onChange({
                ...value,
                thematicLineIds: e.target.value.split(",").map(Number),
              })
            }
          >
            <option value="" disabled>
              Seleccione una temática
            </option>
            {lineasTematicas.map((linea) => (
              <option key={linea.id} value={linea.id}>
                {linea.name}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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

        {/* Poblaciones (en developments[0].population) */}
        <div className="relative">
          <label className="block mb-2 font-medium">Poblaciones</label>
          <input
            className="border rounded p-2 w-full"
            type="text"
            placeholder="Poblaciones"
            value={readDevProp(value, "population")}
            maxLength={MAX_CHARACTERS.population} // Restricción de caracteres
            onChange={(e) => writeDevProp(value, "population", e.target.value)}
          />
          <span
            className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
              readDevProp(value, "population"),
              MAX_CHARACTERS.population
            )}`}
          >
            {readDevProp(value, "population").length || 0}/{MAX_CHARACTERS.population}
          </span>
        </div>

        {/* Experiencias de Pandemia Covid 19 (en developments[0].covidPandemic) */}
        <div className="relative">
          <label className="block mb-2 font-medium">
            Experiencias de Pandemia Covid 19
          </label>
          <input
            className="border rounded p-2 w-full"
            type="text"
            placeholder="Experiencias de Pandemia Covid 19"
            value={readDevProp(value, "covidPandemic")}
            maxLength={MAX_CHARACTERS.covidPandemic} // Restricción de caracteres
            onChange={(e) => writeDevProp(value, "covidPandemic", e.target.value)}
          />
          <span
            className={`absolute bottom-2 right-2 text-xs ${getCharacterCountStyle(
              readDevProp(value, "covidPandemic"),
              MAX_CHARACTERS.covidPandemic
            )}`}
          >
            {readDevProp(value, "covidPandemic").length || 0}/{MAX_CHARACTERS.covidPandemic}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThematicForm;
