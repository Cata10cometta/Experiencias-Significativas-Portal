import { useEffect, useState } from "react";
import configApi from "../../Api/Config/Config";
import { FollowUp } from "../types/FollowUp";

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
        setTrackingData(response.data);
      } catch (err) {
        setError("Error al obtener datos");
      }
    };
    fetchTrackingSummary();
  }, []);

  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!trackingData) return <div className="text-center py-10 text-gray-500">Cargando...</div>;

  const total = trackingData?.totalExperiences || 1;
  const percent = (value: number | undefined) =>
    value !== undefined && total > 0 ? Math.round((value / total) * 100) : 0;

  const naciente = trackingData?.experiencesNaciente || 0;
  const creciente = trackingData?.experiencesCreciente || 0;
  const inspiradora = trackingData?.experiencesInspiradora || 0;
  const totalPie = naciente + creciente + inspiradora;

  let nacientePct = 0, crecientePct = 0, inspiradoraPct = 0;
  if (totalPie > 0) {
    nacientePct = Math.round((naciente / totalPie) * 100);
    crecientePct = Math.round((creciente / totalPie) * 100);
    inspiradoraPct = 100 - nacientePct - crecientePct;
  }

  const colorNaciente = "#EC1562";
  const colorCreciente = "#3EC6FA";
  const colorInspiradora = "#F3F3F3";

 const cx = 130, cy = 130, r = 110, labelR = 75;

  const inspiradoraAngle = totalPie > 0 ? (inspiradora / totalPie) * 360 : 0;
  const crecienteAngle = totalPie > 0 ? (creciente / totalPie) * 360 : 0;
  const nacienteAngle = totalPie > 0 ? 360 - inspiradoraAngle - crecienteAngle : 0;

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
      "L", cx, cy,
      "Z"
    ].join(" ");
  }

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * Math.PI / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  let startAngle = -90;

  const inspiradoraPath = describeArc(cx, cy, r, startAngle, startAngle + inspiradoraAngle);
  const inspiradoraMid = polarToCartesian(cx, cy, labelR, startAngle + inspiradoraAngle / 2);
  startAngle += inspiradoraAngle;

  const crecientePath = describeArc(cx, cy, r, startAngle, startAngle + crecienteAngle);
  const crecienteMid = polarToCartesian(cx, cy, labelR, startAngle + crecienteAngle / 2);
  startAngle += crecienteAngle;

  const nacientePath = describeArc(cx, cy, r, startAngle, startAngle + nacienteAngle);
  const nacienteMid = polarToCartesian(cx, cy, labelR, startAngle + nacienteAngle / 2);

  return (
    <div className="flex flex-col gap-8 w-full">

      {/* Tarjetas blancas */}
      <div className="flex flex-row justify-center items-center gap-8 w-full">

        <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-80 h-40 items-start">
          <div className="bg-blue-100 p-2 rounded-lg w-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Instituciones educativas que registraron experiencias</p>
            <p className="text-2xl font-bold text-blue-600">
              {trackingData?.totalInstitutionsWithExperiences}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-80 h-40 items-start">
          <div className="bg-green-100 p-2 rounded-lg w-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v5h8v-5c0-2.21-1.79-4-4-4z" />
            </svg>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Participación de eventos SEM</p>
            <p className="text-2xl font-bold text-green-600"></p>
          </div>
        </div>
      </div>

      {/* Tarjetas lila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ml-0">
        <div className="bg-purple-200 rounded-xl p-6 flex flex-col items-center justify-center h-32">
          <p className="text-gray-700 text-sm text-center mb-2">
            experiencias con plan de mejoramiento
          </p>
          <p className="text-3xl font-bold text-black">
            {percent(trackingData?.totalExperiencesWithComments)}%
          </p>
        </div>

        <div className="bg-purple-200 rounded-xl p-6 flex flex-col items-center justify-center h-32">
          <p className="text-gray-700 text-sm text-center mb-2">
            Cantidad de docentes formados mediante las rutas a la significación
          </p>
          <p className="text-3xl font-bold text-black">
            {percent(trackingData?.totalTeachersRegistered)}%
          </p>
        </div>

        <div className="bg-purple-200 rounded-xl p-6 flex flex-col items-center justify-center h-32">
          <p className="text-gray-700 text-sm text-center mb-2">
            Número de experiencias que participan en eventos o convocatorias en la actual vigencia
          </p>
          <p className="text-3xl font-bold text-black">
            {percent(trackingData?.totalExperiencesTestsKnow)}%
          </p>
        </div>

        <div className="bg-purple-200 rounded-xl p-6 flex flex-col items-center justify-center h-32">
          <p className="text-gray-700 text-sm text-center mb-2">
            Instituciones educativas que registraron experiencias
          </p>
          <p className="text-3xl font-bold text-black">
            {percent(trackingData?.totalInstitutionsWithExperiences)}%
          </p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="flex flex-col lg:flex-row gap-8 w-full justify-center items-stretch">

        {/* LÍNEAS */}
        <div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center shadow w-full max-w-3xl">
          {(() => {
            const months = 12;
            const dataFucsia = [30, 100, 200, 400, 500, 300, 200, 100, 50, 30, 10, 0];
            const dataAzul   = [20, 80, 180, 250, 300, 220, 150, 100, 60, 30, 10, 0];

            const x0 = 60, xStep = 500/11, y0 = 310, yMax = 250;
            const yScale = (v: number) => y0 - (v/500)*yMax;

            function getSmoothPath(data: number[]) {
              let d = `M${x0},${yScale(data[0])}`;
              for (let i = 0; i < data.length - 1; i++) {
                const x1 = x0 + i * xStep;
                const x2 = x1 + xStep;
                const y1 = yScale(data[i]);
                const y2 = yScale(data[i+1]);
                const cx = x1 + xStep / 2;
                d += ` C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
              }
              return d;
            }

            function getGradientPath(data: number[]) {
              let d = getSmoothPath(data);
              d += ` L${x0 + (months - 1) * xStep},400 L${x0},400 Z`;
              return d;
            }

            return (
              <svg width="600" height="400">
                <defs>
                  <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <rect width="600" height="400" fill="#fff" />

                {[0,100,200,300,400,500].map((val)=>(
                  <g key={val}>
                    <line x1="60" x2="560" y1={310 - (val/500)*250} y2={310 - (val/500)*250}
                      stroke="#eee" />
                    <text x="50" y={314 - (val/500)*250} fontSize="18" fill="#888" textAnchor="end">
                      {val}
                    </text>
                  </g>
                ))}

                <line x1="60" x2="60" y1="60" y2="310" stroke="#eee" strokeWidth="2" />
                <line x1="60" x2="560" y1="310" y2="310" stroke="#eee" strokeWidth="2" />

                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                  .map((m,i)=>(
                  <text key={m} x={60 + i*(500/11)} y="350"
                    fontSize="18" fill="#888" textAnchor="middle">
                    {m}
                  </text>
                ))}

                <path d={getSmoothPath(dataAzul)} fill="none" stroke="#2B2B6F" strokeWidth="4" />
                <path d={getSmoothPath(dataFucsia)} fill="none" stroke="#D81B8C" strokeWidth="4" />

                <line x1="60" y1="310" x2="510" y2="310"
                  stroke="#3EC6FA" strokeWidth="8" strokeLinecap="round" />

                <path d={getGradientPath(dataFucsia)} fill="url(#pinkGradient)" />
              </svg>
            );
          })()}

          <div className="mt-6 flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <span className="w-8 h-2 rounded-full" style={{background:'#D81B8C'}}></span>
              <span className="text-gray-700 text-sm">
                Crecimiento en la inscripción de experiencias nuevas
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-8 h-2 rounded-full" style={{background:'#2B2B6F'}}></span>
              <span className="text-gray-700 text-sm">
                Actualización de experiencias en proceso
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-8 h-2 rounded-full" style={{background:'#3EC6FA'}}></span>
              <span className="text-gray-700 text-sm">
                Número de experiencias registradas en la vigencia
              </span>
            </div>
          </div>
        </div>

        {/* TORTA */}
        <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow w-full max-w-xl">
          <svg width="260" height="260" viewBox="0 0 260 260">
            <path d={nacientePath} fill={colorNaciente} />
            <path d={crecientePath} fill={colorCreciente} />
            <path d={inspiradoraPath} fill={colorInspiradora} />

            <text x={nacienteMid.x} y={nacienteMid.y + 10}
              textAnchor="middle" fontSize="32" fontWeight="bold">
              {nacientePct}%
            </text>

            <text x={crecienteMid.x} y={crecienteMid.y + 10}
              textAnchor="middle" fontSize="32" fontWeight="bold">
              {crecientePct}%
            </text>

            <text x={inspiradoraMid.x} y={inspiradoraMid.y + 10}
              textAnchor="middle" fontSize="32" fontWeight="bold">
              {inspiradoraPct}%
            </text>
          </svg>

          <div className="flex flex-col items-start gap-3 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full" style={{background: colorNaciente}}></span>
              <span className="text-base">Naciente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full" style={{background: colorCreciente}}></span>
              <span className="text-base">Creciente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full" style={{background: colorInspiradora}}></span>
              <span className="text-base">Inspiradora</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Tracking;
