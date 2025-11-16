import { useEffect, useState } from "react";
import configApi from "../../Api/Config/Config";
import { FollowUp } from "../types/FollowUp";

export const getSelectedCards = (trackingData: FollowUp | undefined, keys: (keyof FollowUp)[]) => {
  if (!trackingData) return [];
  return keys.map((key) => ({
    title: String(key), // Personaliza el título según la clave
    value: trackingData[key] ?? "Dato no disponible", // Manejar claves inexistentes
    color: key === "totalExperiencesRegistradas" ? "blue-600" : key === "totalExperiencesCreadas" ? "green-600" : "orange-600", // Asignar colores dinámicamente
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

  // Puedes mapear trackingData aquí si la estructura lo permite
  // Ejemplo: trackingData?.totalExperiences, etc.

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-0">
      {/* Tarjeta 1 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">
        {/* Icono */}
        <div className="bg-blue-100 p-2 rounded-lg w-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Número de experiencias registradas en la vigencia</p>
          <p className="text-2xl font-bold text-blue-600">{trackingData?.totalExperiencesRegistradas}</p>
        </div>
      </div>

      {/* Tarjeta 2 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">
        {/* Icono */}
        <div className="bg-blue-100 p-2 rounded-lg w-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
            />
          </svg>
        </div>


        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Crecimiento en la inscripción de experiencias nuevas en el proceso</p>
          <p className="text-2xl font-bold text-green-600">{trackingData?.totalExperiencesCreadas}</p>
        </div>
      </div>
    

    {/* Tarjeta 3 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">
        {/* Icono */}
        <div className="bg-blue-100 p-2 rounded-lg w-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
            />
          </svg>
        </div>

        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Crecimiento en la inscripción de experiencias. Actualización que continúan en el proceso.</p>
          <p className="text-2xl font-bold text-blue-600"></p>
        </div>
      </div>


      {/* Tarjeta 4 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">
        {/* Icono */}
        <div className="bg-blue-100 p-2 rounded-lg w-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
            />
          </svg>
        </div>

        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Número de experiencias con plan de mejoramiento</p>
          <p className="text-2xl font-bold text-orange-600">{trackingData?.totalExperiencesWithComments}</p>
        </div>
      </div>


      {/* Tarjeta 5 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">
        {/* Icono */}
        <div className="bg-blue-100 p-2 rounded-lg w-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
            />
          </svg>
        </div>

        


        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Cantidad de docentes formados mediante las rutas a la significación</p>
          <p className="text-2xl font-bold text-blue-600">{trackingData?.totalTeachersRegistered}</p>
        </div>
      </div>


      {/* Tarjeta 6 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">
        {/* Icono */}
        <div className="bg-blue-100 p-2 rounded-lg w-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-dark-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </div>

        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Número de experiencias que participan en eventos o convocatorias en la actual vigencia</p>
          <p className="text-2xl font-bold text-blue-600">{trackingData?.totalExperiencesTestsKnow}</p>
        </div>
      </div>


      {/* Tarjeta 7 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">

        
        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Experiencias significativas en estado de desarrollo naciente</p>
          <p className="text-2xl font-bold text-indigo-600">{trackingData?.experiencesNaciente}</p>
        </div>
      </div>
      

      {/* Tarjeta 8 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">

        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Experiencias significativas en estado de desarrollo creciente</p>
          <p className="text-2xl font-bold text-indigo-600">{trackingData?.experiencesCreciente}</p>
        </div>
      </div>

      
      {/* Tarjeta 9 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">

        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Experiencias significativas en estado de desarrollo inspiradora</p>
          <p className="text-2xl font-bold text-indigo-600">{trackingData?.experiencesInspiradora}</p>
        </div>
      </div>


      {/* Tarjeta 10 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">
        {/* Icono */}
        <div className="bg-blue-100 p-2 rounded-lg w-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
            />
          </svg>
        </div>

        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Instituciones educativas que registraron experiencias</p>
          <p className="text-2xl font-bold text-blue-600">{trackingData?.totalInstitutionsWithExperiences}</p>
        </div>
      </div>


      {/* Tarjeta 11 */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col space-y-2 w-full h-40">
        {/* Icono */}
        <div className="bg-green-100 p-2 rounded-lg w-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v5h8v-5c0-2.21-1.79-4-4-4z"
            />
          </svg>
        </div>

        {/* Texto */}
        <div>
          <p className="text-gray-500 text-sm">Participación de eventos SEM</p>
          <p className="text-2xl font-bold text-green-600"></p>
        </div>
      </div>
    </div>
    
    
    
    
  );
};


export default Tracking;



