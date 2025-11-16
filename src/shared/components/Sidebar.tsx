// src/components/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { FaBars, FaUserCog } from "react-icons/fa";
import { AiOutlineHome, AiOutlineFileText, AiOutlineBarChart, AiOutlineQuestionCircle } from "react-icons/ai";

import { IoPersonSharp } from "react-icons/io5";
import { TbUserScan } from "react-icons/tb";
import { RiAdminLine } from "react-icons/ri";

import { fetchMenu } from "../../Api/Services/menuService";
import ChangePasswordModal from './ChangePasswordModal';
import ConfirmLogoutModal from './ConfirmLogoutModal';

// axios removed from here; password logic moved to shared modal


interface MenuItem {
  module?: string;
  form?: string;
  formId: number | string;
  path?: string;
}

interface SidebarProps {
  setActiveContent: (content: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveContent }) => {
  const [activeContent, setActive] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([]);

  // Estado para abrir el modal compartido de cambiar contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // Estado para abrir el modal de confirmación de cierre de sesión
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  // password handling moved to ChangePasswordModal

  useEffect(() => {
    const userId = Number(localStorage.getItem("userId"));
    const token = localStorage.getItem("token");
    if (!userId || !token) return;
    let mounted = true;
    const load = () => {
      fetchMenu(userId, token)
        .then((m) => { if (mounted) setMenu(m); })
        .catch(() => { if (mounted) setMenu([]); });
    };
    load();

    const onMenuUpdated = () => { load(); };
    window.addEventListener('menuUpdated', onMenuUpdated);
    return () => { mounted = false; window.removeEventListener('menuUpdated', onMenuUpdated); };
  }, []);

  // Permitir abrir el modal de cambiar contraseña desde cualquier componente
  // disparando: window.dispatchEvent(new Event('openChangePasswordModal'))
  useEffect(() => {
    const onOpen = () => setShowPasswordModal(true);
    window.addEventListener('openChangePasswordModal', onOpen as EventListener);
    return () => window.removeEventListener('openChangePasswordModal', onOpen as EventListener);
  }, []);

  const handleSelect = (content?: string) => {
    const safeContent = content ?? "";
    setActive(safeContent);
    setActiveContent(safeContent);
  };

  const handleLogout = () => {
    // limpia credenciales locales y redirige al login
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    // redirigir a la ruta de login (ajusta si tu ruta es otra)
    window.location.href = '/login';
  };

  // Agrupar el menú por módulo
  const groupedMenu: { [moduleName: string]: MenuItem[] } = menu.reduce((acc, item) => {
    const moduleName = item.module || "Sin módulo";
    if (!acc[moduleName]) acc[moduleName] = [];
    acc[moduleName].push(item);
    return acc;
  }, {} as { [moduleName: string]: MenuItem[] });

  // Estado para controlar el despliegue de cada módulo
  const [openModules, setOpenModules] = useState<{ [moduleName: string]: boolean }>({});

  const toggleModule = (moduleName: string) => {
    setOpenModules((prev) => ({ ...prev, [moduleName]: !prev[moduleName] }));
  };

  // buscar un item 'Inicio' en el menú para mostrarlo siempre arriba
  const inicioItem = menu.find((m) => (m.form || '').toLowerCase() === 'inicio');

  // obtener datos del usuario para el bloque de perfil
  const userName = (localStorage.getItem('userName') || localStorage.getItem('name') || 'Usuario') as string;
  const userRole = (localStorage.getItem('role') || 'Admin') as string;
  const getInitials = (name: string) => (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <>
  {/* Sidebar (siempre visible) - fondo blanco y ocupa desde arriba hasta abajo */}
  {/* Define a CSS variable for the sidebar width so other layouts can reference it */}
  <aside style={{ width: '320px' }} className={`fixed top-0 bottom-0 right-0 shadow-md z-30 rounded-lg overflow-hidden bg-gradient-to-b from-indigo-600 via-sky-600 to-slate-800 text-white`}>
        <div className="flex items-center justify-center mt-8 mb-4 gap-2">
          <img
            src="/images/Cohete.png"
            alt="Logo"
            className="w-50 h-50 object-contain mr-2 rotate-30"
          />
          <p className="text-white text-2xl font-semibold leading-tight">
            Gestión de&nbsp;
            <span className="block">Experiencias Significativas</span>
          </p>
        </div>

        {/* Bloque de perfil del usuario (initials, nombre, rol) - sin cuadro de fondo */}
  <div className="px-4 mb-6">
          <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 flex items-center justify-center">
                {/* Anillo exterior discontinuo (azul, más grueso) */}
                <span className="absolute inset-0 rounded-full border-4 border-dashed border-sky-300/90"></span>
                {/* Avatar interior */}
                <div className="relative z-10 w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-semibold">
              {getInitials(userName)}
            </div>
                  </div>
            <div className="text-left">
              <div className="text-white font-semibold text-sm">{userName}</div>
              <div className="text-white/80 text-xs">{userRole}</div>
            </div>
          </div>
        </div>

        {/* Botón global Inicio: mostrado siempre arriba (diseño tipo pill con icono en círculo) */}
  <div className="px-4 mb-4">
          <button
            onClick={() => handleSelect(inicioItem?.path ?? 'inicio')}
            className="relative flex items-center w-full pl-10 px-4 py-3 bg-transparent rounded-full text-white font-semibold hover:bg-white/5 focus:outline-none focus:ring-0 shadow-none"
          >
            {/* Icono en círculo blanco */}
            <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white">
              <AiOutlineHome style={{ color: '#0ea5e9' }} size={18} />
            </span>
            {/* Texto centrado en la pill */}
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-lg">Inicio</span>
          </button>

          {/* Ayuda */}
          <div className="mt-4">
            <button
              onClick={() => handleSelect('ayuda')}
              className="relative flex items-center w-full pl-10 px-4 py-3 bg-transparent rounded-full text-white font-semibold hover:bg-white/5 focus:outline-none"
            >
              <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white">
                <AiOutlineQuestionCircle style={{ color: '#0ea5e9' }} size={18} />
              </span>
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-lg">Ayuda</span>
            </button>
          </div>

          {/* Actualizar Contraseña */}
          <div className="mt-4">
  <button
    onClick={() => setShowPasswordModal(true)}
    className="relative flex items-center w-full pl-10 px-4 py-3 bg-transparent rounded-full text-white font-semibold hover:bg-white/5 focus:outline-none"
  >
    <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white">
      <img src="/images/PasswordUpdate.svg" alt="Actualizar contraseña" className="w-4 h-4" />
    </span>
    <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-md">
      Actualizar Contraseña
    </span>
  </button>
</div>
<ChangePasswordModal
  open={showPasswordModal}
  onClose={() => setShowPasswordModal(false)}
/>


        </div>

  <nav className="mt-4 overflow-y-auto scrollbar-hide px-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {Object.keys(groupedMenu).map((moduleName) => {
            const lower = (moduleName || '').toLowerCase().trim();
            const isSecurity = lower.includes("security");
            const isParameter = lower.includes('param');
            return (
              <div key={moduleName} className="mb-5">
                {isSecurity || isParameter ? (
                  <div className="mt-1">
                    <button
                      className="relative flex items-center w-full pl-10 px-4 bg-transparent rounded-full text-white font-semibold hover:bg-white/5 focus:outline-none"
                      onClick={() => handleSelect(isSecurity ? "security" : "parameter")}
                    >
                      <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white text-sky-600">
                        {isSecurity ? (
                          <img src="/images/Security.svg" alt="Security" className="w-4 h-4" />
                        ) : (
                          /* Use custom parametrization SVG for parameter modules */
                          <img src="/images/Parametrization.svg" alt="Parametrización" className="w-4 h-4" />
                        )}
                      </span>
                      {/* Make the module text clickable as well (not only the icon) */}
                      <span
                        className="absolute inset-0 flex items-center justify-center text-lg cursor-pointer"
                        onClick={() => handleSelect(isSecurity ? "security" : "parameter")}
                      >
                        {moduleName}
                      </span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-1">
                      <button
                        className="relative w-full pl-10 px-4 py-2 bg-transparent rounded-full text-white font-semibold hover:bg-white/5 focus:outline-none flex items-center"
                        onClick={() => toggleModule(moduleName)}
                        aria-expanded={!!openModules[moduleName]}
                      >
                        <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white text-sky-600 ">{(moduleName || '').toLowerCase().includes('operational') ? <FaUserCog style={{ color: '#0ea5e9' }} size={18} /> : (openModules[moduleName] ? <FaBars size={18} /> : <FaBars style={{ transform: 'rotate(90deg)' }} size={18} />)}</span>
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-lg">{moduleName}</span>
                      </button>
                    </div>
                    <div
                      className="mt-1 overflow-hidden transition-all duration-200"
                      style={{ maxHeight: openModules[moduleName] ? '600px' : '0px' }}
                    >
                      <ul className="mt-1">
                        {(() => {
                          const items = (groupedMenu[moduleName] || []).filter((item) => {
                            const name = item.form?.toLowerCase();
                            // ocultar formularios de evaluation y evitar duplicar 'inicio' (lo mostramos arriba)
                            return name !== "evaluation" && name !== "evaluación" && name !== 'inicio';
                          });
                          const modLower = (moduleName || '').toLowerCase();
                          // si es el módulo operational, mover 'inicio' al principio en lugar de ocultarlo
                          if (modLower === 'operational' || modLower.includes('operational')) {
                            items.sort((a, b) => {
                              const an = (a.form || '').toLowerCase();
                              const bn = (b.form || '').toLowerCase();
                              if (an === 'inicio' && bn !== 'inicio') return -1;
                              if (bn === 'inicio' && an !== 'inicio') return 1;
                              return 0;
                            });
                          }
                          return items.map((item) => (
                            <li key={item.formId} className={(modLower.includes('operational') && ((item.form||'').toLowerCase() === 'seguimiento', 'Experiencia')) ? 'mt-5' : ''}>
                                <button
                                  onClick={() => handleSelect(item.path)}
                                  className={`relative w-full pl-10 px-4 py-2 mb-0 rounded-full font-semibold transition-colors duration-200 text-white flex items-center ${activeContent === item.path ? 'bg-white/5 text-white' : 'bg-transparent hover:bg-white/5'}`}
                                >
                                  <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white">
                                    {item.form === "Inicio" ? (
                                      <AiOutlineHome className="text-sky-600" size={18} />
                                    ) : item.form === "Seguimiento" ? (
                                      <AiOutlineBarChart className="text-sky-600" size={18} />
                                    ) : item.form === "Experiencia" ? (
                                      <AiOutlineFileText className="text-sky-600" size={18} />
                                    ) : item.form === "Persons" ? (
                                      <IoPersonSharp className="text-sky-600" size={18} />
                                    ) : item.form === "Users" ? (
                                      <TbUserScan className="text-sky-600" size={18} />
                                    ) : item.form === "Roles" ? (
                                      <RiAdminLine className="text-sky-600" size={18} />
                                    ) : (
                                      <svg width="18" height="18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" /></svg>
                                    )}
                                  </span>
                                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-lg">
                                    {typeof item.form === 'string' && item.form.includes(' ') ? (
                                      <div className="text-center flex flex-col gap-4">
                                        {item.form.split(' ').map((part, idx) => (
                                          <span key={idx} className="block">{part}</span>
                                        ))}
                                      </div>
                                    ) : (
                                      item.form
                                    )}
                                  </span>
                                </button>
                            </li>
                          ));
                          })()}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </nav>

        {/* Botón Cerrar Sesión (debajo del menú) */}
        <div className="px-4 mt-4 mb-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="relative flex items-center w-full bg-transparent text-white py-3 px-3 focus:outline-none"
          >
            {/* Left curved accent */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 h-12 w-3 rounded-r-full" style={{ border: '3px solid #9be7ff' }}></div>

            {/* Icon circle */}
            <div className="flex items-center justify-center ml-2 mr-4 z-10">
              <div className="flex items-center justify-center w-10 h-10 bg-[#9be7ff] rounded-full">
                <img src="/images/LogOut.svg" alt="Cerrar Sesión" className="w-5 h-5" />
              </div>
            </div>

            {/* Label centered */}
            <div className="flex-1 text-center text-lg font-semibold">Cerrar Sesión</div>
          </button>
        </div>

        {/* Usar el modal compartido para cambiar contraseña */}
        <ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />

  {/* Modal de confirmación para cerrar sesión */}
  <ConfirmLogoutModal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />

        

      </aside>
    </>
  );
};

export default Sidebar;
