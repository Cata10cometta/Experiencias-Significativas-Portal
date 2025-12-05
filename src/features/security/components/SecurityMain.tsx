import React, { useState } from "react";
import UserList from "./UserList";
import RolesList from "./RolesList";
import PersonsList from "./PersonsList";
import Modules from "./Modules";
import RolFormPermission from "./RolFormPermission";
import Resumen from "./Summary";

const tabs = [
  { key: "roles", label: "Roles" },
  { key: "users", label: "Usuarios" },
  { key: "persons", label: "Personas" },
  { key: "permissions", label: "Permisos" },
  { key: "modules", label: "Modulos" },
  { key: "forms", label: "Formularios" },
  { key: "usersRol", label: "Asignación de Roles" },
  { key: "formModule", label: "Asignación de Formularios" },
  { key: "rolFormPermission", label: "Asignación por permisos" },
  { key: "resumen", label: "Resumen" },
];

const SecurityMain: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("roles");

  // Configure which tabs to hide here (by key). You can later wire this to user permissions or props.
  const hideTabs = new Set<string>(['forms', 'permissions', 'usersRol', 'formModule']);
  const visibleTabs = tabs.filter((t) => !hideTabs.has(t.key));

  React.useEffect(() => {
    // If current active tab was hidden, fallback to the first visible tab.
    if (!visibleTabs.find((t) => t.key === activeTab)) {
      setActiveTab(visibleTabs[0]?.key || 'roles');
    }
  }, [activeTab, visibleTabs]);

  return (
    <div className="w-full max-w-full mx-auto px-2 sm:px-6 py-4 sm:py-6">
      {/* Single white card that contains only the tab titles */}
      <div className="bg-white rounded-full! shadow-sm py-2 px-2 sm:px-3 mb-3 security-tabs-container">
        <div className="mb-0">
          <nav className="flex flex-wrap gap-2 sm:gap-5 security-tabs-nav">
            {/* Example: hideTabs can be used to hide specific tabs without removing them from the array */}
            {visibleTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-1 rounded-lg! text-sm font-medium ${activeTab === t.key ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-600 hover:text-sky-600'}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content is rendered outside the title card to avoid nested boxes */}
      <div className="pt-2 security-tab-content">
        {activeTab === "resumen" && <Resumen />}
        {activeTab === "roles" && <RolesList />}
        {activeTab === "users" && <UserList />}
        {activeTab === "persons" && <PersonsList />}
        {/* {activeTab === "permissions" && <Permissions />} */}
        {activeTab === "modules" && <Modules />}
        {/* {activeTab === "forms" && <Forms />} */}
        {/* {activeTab === "usersRol" && <UsersRol />} */}
        {/* {activeTab === "formModule" && <FormModule />} */}
        {activeTab === "rolFormPermission" && <RolFormPermission />}
        
      </div>
    </div>
  );
};

export default SecurityMain;
