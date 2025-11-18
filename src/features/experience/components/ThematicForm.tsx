import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Experience } from "../types/experienceTypes";

interface LineThematic {
  id: number;
  name: string;
}

interface ThematicFormProps {
  value: Experience;
  onChange: (value: Experience) => void;
}


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

  // helpers removed: inputs with character counters have been removed per request

  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold mb-2">Tematica y Desarrollo</h2>
      <p className="text-lg text-black-600 mb-4">Señale el área principal en la que desarrolla la Experiencia Significativa <span className="text-red-500">*</span></p>

      {/* Checkbox grid (no box styling) */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          {lineasTematicas.length === 0 && (
            <div className="col-span-3 text-sm text-gray-500">No hay líneas temáticas cargadas.</div>
          )}

          {lineasTematicas.map((linea) => {
            const checked = (value.thematicLineIds || []).includes(linea.id);
            return (
              <label key={linea.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 border-gray-300 rounded"
                  checked={checked}
                  onChange={(e) => {
                    const current = new Set(value.thematicLineIds || []);
                    if (e.target.checked) current.add(linea.id);
                    else current.delete(linea.id);
                    onChange({ ...value, thematicLineIds: Array.from(current) });
                  }}
                />
                <span className="leading-tight">{linea.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Educational level checklist added below */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Indique el nivel educativo en el cual se desarrolla la Experiencia Significativa <span className="text-red-500">*</span></label>
        <div className="flex flex-col gap-2">
          {[
            { id: 'primera', label: 'Primera Infancia (jardín -transición)' },
            { id: 'primaria', label: 'Primaria' },
            { id: 'basica', label: 'Básica' },
            { id: 'media', label: 'Media' },
            { id: 'clei', label: 'CLEI' },
            { id: 'todas', label: 'Todas las anteriores' },
          ].map((opt) => {
            const checked = (value as any).educationLevels?.includes(opt.id) || false;
            return (
              <label key={opt.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 border-gray-300 rounded"
                  checked={checked}
                  onChange={(e) => {
                    const current = new Set((value as any).educationLevels || []);
                    if (e.target.checked) current.add(opt.id);
                    else current.delete(opt.id);
                    onChange({ ...(value as any), educationLevels: Array.from(current) });
                  }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Educational model box (styled to match screenshot) */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Indique el modelo educativo en el que se enmarca el desarrollo de la Experiencia Significativa</label>
        <div className="bg-white px-0 py-4">
          <div className="flex flex-col gap-2 pl-0">
          {[
            { id: 'tradicional', label: 'Tradicional' },
            { id: 'escuelaNueva', label: 'Escuela Nueva' },
            { id: 'aceleracion', label: 'Aceleración del Aprendizaje' },
            { id: 'caminarSecundaria', label: 'Caminar en Secundaria' },
            { id: 'postprimaria', label: 'Postprimaria' },
            { id: 'circuloAprendizaje', label: 'Circulo del Aprendizaje' },
            { id: 'programaJovenes', label: 'Programa para Jóvenes en Extraedad y adultos' },
            { id: 'etnoeducativa', label: 'Etnoeducativa' },
            { id: 'mediaRural', label: 'Media Rural' },
          ].map((opt) => {
            const checked = (value as any).educationModels?.includes(opt.id) || false;
            return (
              <label key={opt.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-green-600 rounded"
                  checked={checked}
                  onChange={(e) => {
                    const current = new Set((value as any).educationModels || []);
                    if (e.target.checked) current.add(opt.id);
                    else current.delete(opt.id);
                    onChange({ ...(value as any), educationModels: Array.from(current) });
                  }}
                />
                <span className="leading-tight">{opt.label}</span>
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
          <div className="bg-white px-0 py-4">
            <div className="flex flex-col gap-2 pl-0">
              {[
                'CONTABILIZACIÓN DE OPERACIONES CONTABLES Y FINANCIERAS',
                'ASISTENCIA ADMINISTRATIVA',
                'MANTENIMIENTO DE EQUIPOS DE COMPUTO',
                'ALISTAMIENTO DE LABORATORISMD E MICROBIOLOGIA Y BIOTECNOLOGIA',
                'COCINA (ES ACADEMICA)',
                'OPERACIÓN TURISTICA',
                'PROGRAMACIÓN DE SOFTWARE',
                'MANTENIMIENTO E INSTALACION DE SISTEMAS SOLARES FOTOVOLTAICOS',
                'ASESORIA COMERCIAL',
                'ASESORIA COMERCIAL Y VENTAS',
                'SISTEMAS TELEINFORMATICOS',
                'SERVICIO DE AGENCIAS DE VIAJES',
                'MANTENIMIENTO Y ENSAMBLAJE DE EQUIPOS ELECTRONICOS',
                'IMPLEMENTACION Y MANTENIMIENTO DE EQUIPOS ELECTRONICOS INDUSTRIALES',
                'ENSAMBLAJE Y MANTENIMIENTO DE EQUIPOS DE COMPUTO',
                'INTEGRACION DE CONTENIDOS DIGITALES',
                'CONFECCIONES',
                'PANIFICACION',
                'AUTOMATIZACION DE SISTEMAS INDUSTRIALES',
                'SISTEMAS AGROPECUARIOS ECOLOGICOS',
                'AGROINDUSTRIA',
                'ELABORACION DE PRODUCTOS ALIMENTICIOS',
                'NINGUNA DE LAS ANTERIORES',
              ].map((label) => {
                const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                const checked = (value as any).senaTechniques?.includes(id) || false;
                return (
                  <label key={id} className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-green-600 rounded mt-1"
                      checked={checked}
                      onChange={(e) => {
                        const current = new Set((value as any).senaTechniques || []);
                        if (e.target.checked) current.add(id);
                        else current.delete(id);
                        onChange({ ...(value as any), senaTechniques: Array.from(current) });
                      }}
                    />
                    <span className="leading-tight">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Grades checklist (placed below SENA, as requested) */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Indique el o los grados en el que se desarrolla la experiencia significativa <span className="text-red-500">*</span></label>
          <div className="bg-white px-0 py-4">
            <div className="flex flex-col gap-2 pl-0">
              {[
                'Preescolar',
                'Primero',
                'Segundo',
                'Tercero',
                'Cuarto',
                'Quinto',
                'Sexto',
                'Séptimo',
                'Octavo',
                'Noveno',
                'Décimo',
                'Undecimo',
                'Todas las anteriores',
              ].map((label) => {
                const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                const checked = (value as any).educationGrades?.includes(id) || false;
                return (
                  <label key={id} className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-green-600 rounded mt-1"
                      checked={checked}
                      onChange={(e) => {
                        const current = new Set((value as any).educationGrades || []);
                        if (e.target.checked) current.add(id);
                        else current.delete(id);
                        onChange({ ...(value as any), educationGrades: Array.from(current) });
                      }}
                    />
                    <span className="leading-tight">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Population group checklist (placed below grades) */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Grupo poblacional que hacen parte de la experiencia significativa <span className="text-red-500">*</span></label>
        <div className="bg-white px-0 py-4">
          <div className="flex flex-col gap-2 pl-0">
            {[
              'Negritudes',
              'Afrodescendiente',
              'Palenquero',
              'Raizal',
              'Rom/Gitano',
              'Víctima del Conflicto',
              'Discapacidad',
              'Talentos Excepcionales',
              'Indígenas',
              'Trastornos Específicos',
              'Ninguno de los anteriores',
            ].map((label) => {
              const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
              const checked = (value as any).populationGroups?.includes(id) || false;
              return (
                <label key={id} className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-green-600 rounded mt-1"
                    checked={checked}
                    onChange={(e) => {
                      const current = new Set((value as any).populationGroups || []);
                      if (e.target.checked) current.add(id);
                      else current.delete(id);
                      onChange({ ...(value as any), populationGroups: Array.from(current) });
                    }}
                  />
                  <span className="leading-tight">{label}</span>
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
