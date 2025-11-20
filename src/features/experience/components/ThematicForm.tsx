import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../../Api/Services/Auth";
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

  // Fallback list to display when API doesn't provide the expected items
  const FALLBACK_LINES: string[] = [
    'CIENCIAS ECONOMICAS Y POLITICAS',
    'TECNOLOGIA E INFORMATICA',
    'CIENCIAS NATURALES Y EDUCACIÓN AMBIENTAL',
    'CIENCIAS SOCIALES, HISTORIA, GEOGRAFÍA, CONSTITUCIÓN POLÍTICA Y DEMOCRACIA',
    'CONVIVENCIA Y COMPORTAMIENTO',
    'EDUCACIÓN ARTÍSTICA Y CULTURAL',
    'EDUCACIÓN ÉTICA Y EN VALORES HUMANOS',
    'EDUCACIÓN FÍSICA, RECREACIÓN Y DEPORTES',
    'EDUCACIÓN RELIGIOSA',
    'EMPRENDIMIENTO',
    'HUMANIDADES Y LENGUA CASTELLANA',
    'IDIOMA EXTRANJERO',
    'MATEMÁTICAS',
    'FILOSOFÍA',
    'QUIMICA'
  ];

  useEffect(() => {
    const fetchLineasTematicas = async () => {
      try {
        // Use central getToken() so token format is consistent across the app
        const token = getToken() ?? "";

        const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
        const endpoint = API_BASE ? `${API_BASE}/api/LineThematic/getAll` : "/api/LineThematic/getAll";

        const response = await axios.get(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // Ignore API results and always use the user's provided list
        const fallback = FALLBACK_LINES.map((name, idx) => ({ id: idx + 1, name }));
        setLineasTematicas(fallback);
      } catch (err) {
        // axios error handling
        const status = (err as any)?.response?.status;
        if (status === 401) {
          setError("No autorizado. Por favor inicia sesión.");
        } else {
          setError("Error al cargar las líneas temáticas.");
        }
        console.error("Error fetching LineThematic", err);
      }
    };

    fetchLineasTematicas();
  }, []);

  // helpers removed: inputs with character counters have been removed per request

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
        <label className="block mb-2 font-medium">Indique el modelo educativo en el que se enmarca el desarrollo de la Experiencia Significativa</label>
        <div className="px-0 py-4 bg-transparent border-0">
          <div className="grid grid-cols-3 gap-3 p-0">
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
                    onChange({ ...(value as any), Population: Array.from(current) });
                  }}
                />
                <span className="leading-tight break-words whitespace-normal">{opt.label}</span>
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
                const cross = (value as any).CrossCuttingProject || [];
                const checked = Array.isArray(cross) ? cross.includes(id) : false;
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

              {/* Grades checklist (placed below SENA, as requested) */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Indique el o los grados en el que se desarrolla la experiencia significativa <span className="text-red-500">*</span></label>
          <div className="px-0 py-4 bg-transparent border-0">
            <div className="grid grid-cols-3 gap-3 p-0">
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
                // normalize existing values to strings for reliable comparison
                const gradeArr = Array.isArray((value as any).gradeId)
                  ? (value as any).gradeId.map((v: any) => String(v))
                  : Array.isArray((value as any).grades)
                  ? (value as any).grades.map((v: any) => String(v))
                  : [];
                const checked = gradeArr.includes(id);
                return (
                  <label key={id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-green-600 rounded mt-1"
                      checked={checked}
                      onChange={(e) => {
                        const current = new Set(gradeArr);
                        if (e.target.checked) current.add(id);
                        else current.delete(id);
                        const arr = Array.from(current);
                        // update both common property names to maximize compatibility
                        const payload: any = { ...(value as any), gradeId: arr, grades: arr };
                        console.debug("ThematicForm - grades changed:", arr);
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
      
      {/* Population group checklist (placed below grades) */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Grupo poblacional que hacen parte de la experiencia significativa <span className="text-red-500">*</span></label>
        <div className="bg-white px-0 py-4">
          <div className="grid grid-cols-3 gap-3 pl-0">
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
              const existing = Array.isArray((value as any).populationGradeIds)
                ? (value as any).populationGradeIds.map((v: any) => String(v))
                : Array.isArray((value as any).populationGrades)
                ? (value as any).populationGrades.map((v: any) => String(v))
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
                      const payload: any = { ...(value as any), populationGradeIds: arr, populationGrades: arr };
                      console.debug("ThematicForm - population changed:", arr);
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
                  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
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
                      const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
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
              const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
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
              const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
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
