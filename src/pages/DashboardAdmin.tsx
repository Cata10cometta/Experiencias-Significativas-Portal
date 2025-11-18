import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Widgets from "../shared/components/Widgets";
import Sidebar from "../shared/components/Sidebar";
import Tracking from "../shared/components/Tracking";
import Experiences from "../shared/components/Experiences";
import AddExperience from "../features/experience/components/AddExperience"; // moved to features
import Evaluation from "../features/evaluation/components/Evaluation";
import UserList from "../features/security/components/UserList";
import RolesList from "../features/security/components/RolesList";
import Permissions from "../features/security/components/Permissions";
import Modules from "../features/security/components/Modules";
import Forms from "../features/security/components/Forms";
import UsersRol from "../features/security/components/UsersRol";
import FormModule from "../features/security/components/FormModule";
import PersonsList from "../features/security/components/PersonsList";
import RolFormPermission from "../features/security/components/RolFormPermission";
import SecurityMain from "../features/security/components/SecurityMain";
import Criteria from "../features/parameter/components/Criteria";
import Grade from "../features/parameter/components/Grade";
import LineThematic from "../features/parameter/components/LineThematic";
import PopulationGrade from "../features/parameter/components/PopulationGrade";
import State from "../features/parameter/components/State";
import ParameterMain from "../features/parameter/components/ParameterMain";
import SessionExpiredModal from "../shared/components/SessionExpiredModal";
import { setSessionExpiredHandler } from "../Api/Config/Config";
import Information from "../features/Information/Information";

const DashboardAdmin: React.FC = () => {
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
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <Sidebar setActiveContent={setActiveContent} />

  <main style={{ paddingRight: '320px' }} className="flex-1 p-8 transition-all duration-300 ease-in-out overflow-hidden">
        {activeContent === "dashboard" && <Widgets />}
        {activeContent === "tracking" && <Tracking />}
        {activeContent === "evaluation" && <Evaluation />}
        {activeContent === "users" && <UserList />}
        {activeContent === "roles" && <RolesList />}
        {activeContent === "security" && <SecurityMain />}
        {activeContent === "permissions" && <Permissions />}
        {activeContent === "informacion" && <Information /> }
        {activeContent === "modules" && <Modules />}
        {activeContent === "forms" && <Forms />}
        {activeContent === "usersRol" && <UsersRol />}
        {activeContent === "formModule" && <FormModule />}
        {activeContent === "persons" && <PersonsList />}
        {activeContent === "rolFormPermission" && <RolFormPermission />}
        {activeContent === "criteria" && <Criteria />}
        {activeContent === "grade" && <Grade />}
        {activeContent === "lineThematic" && <LineThematic />}
        {activeContent === "populationGrade" && <PopulationGrade />}
        {activeContent === "state" && <State />}
  {activeContent === "parameter" && <ParameterMain />}
        {activeContent === "experiences" && (
          <Experiences onAgregar={() => setActiveContent("agregar-experiencia")} />
        )}
        {activeContent === "agregar-experiencia" && (
          <AddExperience onVolver={() => setActiveContent("experiences")} />
        )}
      </main>

      {sessionExpired && <SessionExpiredModal onClose={handleModalClose} />}
    </div>
  );
};

export default DashboardAdmin;
