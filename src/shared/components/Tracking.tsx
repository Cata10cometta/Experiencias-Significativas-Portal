import { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import configApi from "../../Api/Config/Config";
import { FollowUp } from "../types/FollowUp";
import { trackingTourSteps, trackingTourLocale, trackingTourStyles } from "../../features/onboarding/trackingTour";

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

  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!trackingData) return <div className="text-center py-10 text-gray-500">Cargando...</div>;

  const total = trackingData?.totalExperiences || 1;
  const naciente = trackingData?.experiencesNaciente || 0;
  const creciente = trackingData?.experiencesCreciente || 0;
  const inspiradora = trackingData?.experiencesInspiradora || 0;
  console.log('Naciente:', naciente, 'Creciente:', creciente, 'Inspiradora:', inspiradora);

  // Porcentaje de cada estado respecto al total general
  const nacientePct = total > 0 ? Math.round((naciente / total) * 100) : 0;
  const crecientePct = total > 0 ? Math.round((creciente / total) * 100) : 0;
  const inspiradoraPct = total > 0 ? Math.round((inspiradora / total) * 100) : 0;

  const colorNaciente = "#EC1562";
  const colorCreciente = "#3EC6FA";
  const colorInspiradora = "#F3F3F3";

  // Datos para la torta con recharts (los valores siguen siendo absolutos, pero la etiqueta será el porcentaje respecto al total)
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
      color: '#D81B8C',
    },
    {
      name: 'Actualización de experiencias en proceso',
      shortName: 'Actualización',
      value: trackingData?.totalExperiencesWithComments ?? 0,
      color: '#2B2B6F',
    },
    {
      name: 'Número de experiencias registradas en la vigencia',
      shortName: 'Registradas',
      value: trackingData?.totalExperiencesRegistradas ?? 0,
      color: '#3EC6FA',
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

  // Etiqueta personalizada para mostrar porcentaje respecto al total general
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
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percent = pieData[index]?.percent;
    return (
      percent > 0 ? (
        <text x={x} y={y} fill="#222" fontSize={22} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
          {`${percent}%`}
        </text>
      ) : null
    );
  };


  // Eliminados cálculos de ángulos personalizados y totalPie, ya no se usan

  return (
    <div className="flex flex-col gap-8 w-full tracking-layout">
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

      {/* Tarjetas blancas */}
      <div className="flex flex-col gap-4 w-full tracking-summary-cards sm:flex-row sm:justify-center sm:items-stretch sm:gap-8">
        <div className="bg-white shadow rounded-lg p-4 flex flex-row sm:flex-col space-x-4 sm:space-x-0 sm:space-y-2 w-full sm:w-80 h-32 sm:h-40 items-center sm:items-start">
          <div className="bg-blue-100 p-2 rounded-lg w-10 flex-shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-gray-500 text-sm">Instituciones educativas que registraron experiencias</p>
            <p className="text-2xl font-bold text-blue-600">
              {trackingData?.totalInstitutionsWithExperiences}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 flex flex-row sm:flex-col space-x-4 sm:space-x-0 sm:space-y-2 w-full sm:w-80 h-32 sm:h-40 items-center sm:items-start">
          <div className="bg-green-100 p-2 rounded-lg w-10 flex-shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v5h8v-5c0-2.21-1.79-4-4-4z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-gray-500 text-sm">Participación de eventos SEM</p>
            <p className="text-2xl font-bold text-green-600"></p>
          </div>
        </div>
      </div>

      {/* Tarjetas lila */}
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 lg:gap-6 w-full tracking-purple-cards">
        <div className="bg-purple-200 rounded-xl p-6 flex-1 flex flex-col items-center justify-center h-32 min-w-[220px]">
          <p className="text-gray-700 text-sm text-center mb-2">
            experiencias con plan de mejoramiento
          </p>
          <p className="text-3xl font-bold text-black">
            {trackingData?.totalExperiencesWithComments ?? 0}
          </p>
        </div>

        <div className="bg-purple-200 rounded-xl p-6 flex-1 flex flex-col items-center justify-center h-32 min-w-[220px]">
          <p className="text-gray-700 text-sm text-center mb-2">
            Cantidad de docentes formados mediante las rutas a la significación
          </p>
          <p className="text-3xl font-bold text-black">
            {trackingData?.totalTeachersRegistered ?? 0}
          </p>
        </div>

        <div className="bg-purple-200 rounded-xl p-6 flex-1 flex flex-col items-center justify-center h-32 min-w-[220px]">
          <p className="text-gray-700 text-sm text-center mb-2">
            Número de experiencias que participan en eventos o convocatorias en la actual vigencia
          </p>
          <p className="text-3xl font-bold text-black">
            {trackingData?.totalExperiencesTestsKnow ?? 0}
          </p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="flex flex-col gap-8 w-full lg:flex-row lg:gap-8 justify-center items-stretch">
        {/* Barras */}
        <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center shadow w-full max-w-3xl min-w-0 tracking-line-chart">
          <div className="w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={260} minWidth={180}>
              <BarChart data={barData} margin={{ top: 30, right: 24, left: 8, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fill: '#4B5563', fontSize: 13, fontWeight: 500 }}
                  axisLine={false}
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
                  formatter={(value: number, _name: string, item: any) => [`${value}`, `${item?.payload?.name ?? ''}`]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.name ?? label}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="#374151" fontSize={14} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid w-full gap-4 sm:grid-cols-3">
            {barData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3">
                <span
                  className="block h-4 w-4 rounded-full shadow"
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="text-sm font-medium text-gray-700 leading-tight">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TORTA con recharts */}
        <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col items-center shadow w-full max-w-xl min-w-0 tracking-pie-chart">
          {/* Rueda arriba */}
          <div className="w-full flex justify-center items-center" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={260} minWidth={180} aspect={1}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  label={renderCustomizedLabel as any}
                  labelLine={false}
                  isAnimationActive={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Leyenda debajo, alineada a la izquierda (siempre visible aunque los valores sean 0) */}
          <div className="w-full flex justify-start mt-8 tracking-pie-legend">
            <ul className="flex flex-col items-start gap-4">
              {pieData.map((entry, index) => (
                <li key={`item-${index}`} className="flex items-center gap-3">
                  <span
                    className="block w-6 h-6 rounded-full border border-gray-200 shadow"
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span className="text-lg text-gray-800 font-medium">{entry.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Tracking;
