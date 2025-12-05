import { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import configApi from "../../Api/Config/Config";
import { FollowUp } from "../types/FollowUp";
import { trackingTourSteps, trackingTourLocale, trackingTourStyles } from "../../features/onboarding/trackingTour";
import { ChevronDoubleRightIcon, UserGroupIcon, ChartBarIcon, BookOpenIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline'; // Importaciones para iconos modernos

// Colores de la paleta para los estados de las experiencias
const colorNaciente = "#1c159eff"; // Un rojo/coral vibrante
const colorCreciente = "#4744a9ff"; // Un turquesa refrescante
const colorInspiradora = "#ef7c00ff"; // Un azul inspirador

// Colores para las métricas de la barra
const colorBarra1 = "#4831b0ff"; // Violeta suave para "Crec. nuevas"
const colorBarra2 = "#ee520aff"; // Durazno suave para "Actualización"
const colorBarra3 = "#0e0e73ff"; // Turquesa para "Registradas" (coherente con Creciente)

// Iconos y colores para las tarjetas blancas
const whiteCardMetrics = [
  {
    key: 'totalInstitutionsWithExperiences',
    title: 'Instituciones educativas que registraron experiencias',
    icon: <ChevronDoubleRightIcon className="h-6 w-6 text-blue-600" />,
    iconBg: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  {
    key: 'participationInSEMEvents', // Asumiendo que se agregará un valor al trackingData
    title: 'Participación de eventos SEM',
    icon: <UserGroupIcon className="h-6 w-6 text-green-600" />,
    iconBg: 'bg-green-100',
    textColor: 'text-green-700',
  },
];

// Iconos y colores para las tarjetas lila (ahora con un fondo morado más limpio)
const purpleCardMetrics = [
  {
    key: 'totalExperiencesWithComments',
    title: 'Experiencias con plan de mejoramiento',
    icon: <ChartBarIcon className="h-6 w-6 text-purple-600" />,
    iconBg: 'bg-purple-100',
    bg: 'bg-purple-50',
    textColor: 'text-purple-700',
    valueColor: 'text-purple-800',
  },
  {
    key: 'totalTeachersRegistered',
    title: 'Cantidad de docentes formados mediante las rutas a la significación',
    icon: <BookOpenIcon className="h-6 w-6 text-purple-600" />,
    iconBg: 'bg-purple-100',
    bg: 'bg-purple-50',
    textColor: 'text-purple-700',
    valueColor: 'text-purple-800',
  },
  {
    key: 'totalExperiencesTestsKnow',
    title: 'Número de experiencias que participan en eventos o convocatorias en la actual vigencia',
    icon: <PresentationChartLineIcon className="h-6 w-6 text-purple-600" />,
    iconBg: 'bg-purple-100',
    bg: 'bg-purple-50',
    textColor: 'text-purple-700',
    valueColor: 'text-purple-800',
  },
];


export const getSelectedCards = (trackingData: FollowUp | undefined, keys: (keyof FollowUp)[]) => {
  if (!trackingData) return [];
  return keys.map((key) => ({
    title: String(key),
    value: trackingData[key] ?? "Dato no disponible",
    color: key === "totalExperiencesRegistradas" ? "blue-600" :
      key === "totalExperiencesCreadas" ? "green-600" :
        "orange-600",
  }));
};

const Tracking = () => {
  const [trackingData, setTrackingData] = useState<FollowUp | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const fetchTrackingSummary = async () => {
      try {
        const body = {
          pageSize: 0,
          pageNumber: 0,
          filter: "",
          columnFilter: "",
          columnOrder: "",
          directionOrder: "",
          foreignKey: 0,
          nameForeignKey: "",
          aplyPagination: true
        };
        const response = await configApi.post("/HistoryExperience/tracking-summary", body);
        console.log('Respuesta tracking-summary:', response.data);
        setTrackingData(response.data);
      } catch (err) {
        setError("Error al obtener datos");
      }
    };
    fetchTrackingSummary();
  }, []);

  useEffect(() => {
    if (trackingData && !localStorage.getItem("trackingTourDone")) {
      const timer = window.setTimeout(() => setRunTour(true), 500);
      return () => window.clearTimeout(timer);
    }
  }, [trackingData]);

  // --- Lógica de Manejo de Estados y Datos (Sin cambios) ---
  if (error) return <div className="text-center py-10 text-xl font-semibold text-red-600 bg-white rounded-xl shadow-lg m-4">{error}</div>;
  if (!trackingData) return <div className="text-center py-10 text-xl font-semibold text-gray-500">Cargando datos de seguimiento...</div>;

  const total = trackingData?.totalExperiences || 1;
  const naciente = trackingData?.experiencesNaciente || 0;
  const creciente = trackingData?.experiencesCreciente || 0;
  const inspiradora = trackingData?.experiencesInspiradora || 0;

  // Porcentaje de cada estado respecto al total general
  const nacientePct = total > 0 ? Math.round((naciente / total) * 100) : 0;
  const crecientePct = total > 0 ? Math.round((creciente / total) * 100) : 0;
  const inspiradoraPct = total > 0 ? Math.round((inspiradora / total) * 100) : 0;


  // Datos para la torta
  const pieData = [
    { name: 'Naciente', value: naciente, color: colorNaciente, percent: nacientePct },
    { name: 'Creciente', value: creciente, color: colorCreciente, percent: crecientePct },
    { name: 'Inspiradora', value: inspiradora, color: colorInspiradora, percent: inspiradoraPct },
  ];

  const barMetrics = [
    {
      name: 'Crecimiento en la inscripción de experiencias nuevas',
      shortName: 'Crec. nuevas',
      value: trackingData?.totalExperiencesCreadas ?? 0,
      color: colorBarra1,
    },
    {
      name: 'Actualización de experiencias en proceso',
      shortName: 'Actualización',
      value: trackingData?.totalExperiencesWithComments ?? 0,
      color: colorBarra2,
    },
    {
      name: 'Número de experiencias registradas en la vigencia',
      shortName: 'Registradas',
      value: trackingData?.totalExperiencesRegistradas ?? 0,
      color: colorBarra3,
    },
  ];

  const barData = barMetrics.map(({ name, shortName, value, color }) => ({
    name,
    shortName,
    color,
    value,
  }));

  // El máximo valor de cantidad para el eje Y
  const maxBarValue = Math.max(100, ...barData.map((item) => item.value || 0));

  // Etiqueta personalizada para mostrar porcentaje respecto al total general en la torta
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    index: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.45; // Etiqueta más al centro
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percent = pieData[index]?.percent;
    return (
      percent > 0 ? (
        <text x={x} y={y} fill="#111827" fontSize={16} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
          {`${percent}%`}
        </text>
      ) : null
    );
  };
  // --- Fin Lógica de Manejo de Estados y Datos ---

	return (
		<div className="flex flex-col gap-8 w-full p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen tracking-layout overflow-y-auto" style={{maxHeight: '100vh'}}>
      {/* Tour de Bienvenida */}
      <Joyride
        steps={trackingTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={trackingTourLocale}
        styles={trackingTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunTour(false);
            localStorage.setItem("trackingTourDone", "true");
          }
        }}
      />

      <h1 className="text-3xl font-extrabold text-gray-900 mb-4 border-b pb-2">Panel de Seguimiento </h1>

      {/* Bloque de Tarjetas Informativas */}
	<section className="flex flex-col gap-6 w-full tracking-cards">
        
        {/* Tarjetas Primarias (Blancas con Icono) */}
	<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {whiteCardMetrics.map((metric) => (
            <div
              key={metric.key}
              className="bg-white shadow-xl rounded-2xl p-6 flex items-center space-x-4 transition duration-300 ease-in-out hover:shadow-2xl h-full"
            >
              <div className={`${metric.iconBg} p-3 rounded-xl flex-shrink-0 flex items-center justify-center`}>
                {metric.icon}
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-sm font-medium text-gray-600 line-clamp-2">{metric.title}</p>
                <p className={`text-3xl font-extrabold ${metric.textColor} mt-1`}>
                  {metric.key === 'totalInstitutionsWithExperiences' ? trackingData.totalInstitutionsWithExperiences : 'N/D'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tarjetas Secundarias (Moradas, centrado) */}
	<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 tracking-purple-cards">
          {purpleCardMetrics.map((metric) => (
            <div
              key={metric.key}
              className={`${metric.bg} rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg transition duration-300 ease-in-out hover:shadow-xl h-40 min-w-0`}
            >
              <p className={`text-sm font-medium ${metric.textColor} mb-2 line-clamp-3`}>
                {metric.title}
              </p>
              <p className={`text-4xl font-extrabold ${metric.valueColor}`}>
                {trackingData[metric.key as keyof FollowUp] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </section>

      <hr className="my-4 border-gray-200" />

	{/* Bloque de Gráficas */}
	<section className="flex flex-col gap-8 w-full lg:flex-row justify-center items-stretch flex-shrink-0">

        {/* Gráfico de Barras */}
	<div className="bg-white rounded-2xl p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center shadow-xl w-full lg:w-2/3 min-w-0 tracking-line-chart">
          <h2 className="text-xl font-bold text-gray-800 mb-6 w-full text-left">Métricas de Experiencias</h2>
					<div className="w-full min-h-[220px]" style={{ minWidth: 0 }}>
						<ResponsiveContainer width="100%" height={220} minHeight={180}>
              <BarChart data={barData} margin={{ top: 30, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fill: '#4B5563', fontSize: 13, fontWeight: 600 }}
                  axisLine={{ stroke: '#D1D5DB' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `${value}`}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  width={40}
                  domain={[0, maxBarValue]}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  formatter={(value: number, _name: string, item: any) => [`${value}`, `${item?.payload?.name ?? ''}`]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.name ?? label}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="#374151" fontSize={14} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
		  <div className="mt-4 grid w-full gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            {barData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3">
                <span
                  className="block h-4 w-4 rounded-full shadow-md"
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="text-sm font-medium text-gray-700 leading-snug">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Torta */}
	<div className="bg-white rounded-2xl p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center shadow-xl w-full lg:w-1/3 min-w-0 tracking-pie-chart">
          <h2 className="text-xl font-bold text-gray-800 mb-6 w-full text-left">Estado de Experiencias (%)</h2>
					<div className="w-full min-h-[220px] flex justify-center items-center" style={{ minWidth: 0 }}>
						<ResponsiveContainer width="100%" height={220} minHeight={180} aspect={1}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80} // Radio más grande
                  outerRadius={120} // Anillo más grueso
                  paddingAngle={5} // Separación entre porciones
                  label={renderCustomizedLabel as any}
                  labelLine={false}
                  isAnimationActive={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  formatter={(value, name) => [`${value} experiencias`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Leyenda debajo */}
					<div className="w-full flex justify-start mt-4 tracking-pie-legend">
						<ul className="flex flex-col items-start gap-2 w-full">
              {pieData.map((entry, index) => (
                <li key={`item-${index}`} className="flex items-center gap-3 w-full justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="block w-4 h-4 rounded-full border border-gray-200 shadow"
                      style={{ backgroundColor: entry.color }}
                    ></span>
                    <span className="text-base text-gray-700 font-medium">{entry.name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Tracking;
