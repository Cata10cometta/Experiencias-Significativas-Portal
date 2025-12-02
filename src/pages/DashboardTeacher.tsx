import React, { useState, useEffect } from "react";
import Sidebar from "../shared/components/Sidebar";
import Experiences from "../shared/components/Experiences";
import StarT from "../shared/components/starT";
import AgregarExperiencia from "../features/experience/components/AddExperience"; // moved to features
import SessionExpiredModal from "../shared/components/SessionExpiredModal";
import { setSessionExpiredHandler } from "../Api/Config/Config";
import Information from "../features/Information/Information";

const DashboardTeacher: React.FC = () => {
  const [activeContent, setActiveContent] = useState("dashboard");
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setSessionExpiredHandler(setSessionExpired); // Configurar el manejador del modal
  }, []);

  const handleModalClose = () => {
    setSessionExpired(false);
    window.location.href = "/login"; // Redirigir al login
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-cover bg-center">
      <Sidebar setActiveContent={setActiveContent} />

  <main style={{ paddingRight: '320px' }} className="flex-1 p-8 transition-all duration-300 ease-in-out overflow-hidden bg-transparent">
        {activeContent === "dashboard" && <StarT />}
        {activeContent === "experiences" && (
          <Experiences onAgregar={() => setActiveContent("agregar-experiencia")} />
        )}
        {activeContent === "agregar-experiencia" && (
          <AgregarExperiencia onVolver={() => setActiveContent("experiences")} />
        )}
      </main>

      {sessionExpired && <SessionExpiredModal onClose={handleModalClose} />}
    </div>
  );
};

export default DashboardTeacher;
