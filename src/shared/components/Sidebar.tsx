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

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Mantener el ancho estático y la posición
  const sidebarWidth = '320px'; 
  
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
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  const groupedMenu: { [moduleName: string]: MenuItem[] } = menu.reduce((acc, item) => {
    const moduleName = item.module || "Sin módulo";
    if (!acc[moduleName]) acc[moduleName] = [];
    acc[moduleName].push(item);
    return acc;
  }, {} as { [moduleName: string]: MenuItem[] });

  const [openModules, setOpenModules] = useState<{ [moduleName: string]: boolean }>({});

  const toggleModule = (moduleName: string) => {
    setOpenModules((prev) => ({ ...prev, [moduleName]: !prev[moduleName] }));
  };

  const inicioItem = menu.find((m) => (m.form || '').toLowerCase() === 'inicio');
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
      <aside 
        style={{ width: sidebarWidth }} 
        className={`fixed top-0 bottom-0 right-0 shadow-2xl z-40 overflow-y-auto rounded-l-3xl
                   bg-gradient-to-b from-indigo-600 via-sky-600 to-slate-800 text-white`}
      >
        {/* Logo y Título */}
        <div className="flex items-center justify-center pt-8 pb-4    gap-2 px-4">
          <img
            src="/images/Cohete.png"
            alt="Logo"
            className="w-16 h-16 object-contain mr-2 rotate-30" 
          />
          <p className="text-white text-2xl font-semibold leading-tight">
            Gestión de&nbsp;
            <span className="block">Experiencias Significativas</span>
          </p>
        </div>

        {/* Bloque de Perfil de Usuario */}
        <div className="px-4 mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-dashed border-sky-300/90 animate-pulse-slow"></span>
              <div className="relative z-10 w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-semibold shadow-inner text-lg">
                {getInitials(userName)}
              </div>
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm truncate">{userName}</div>
              <div className="text-sky-300 text-xs">{userRole}</div>
            </div>
          </div>
        </div>

        {/* Opciones Principales (Inicio, Ayuda, Actualizar Contraseña) */}
        <div className="px-4 mb-2 space-y-2"> {/* Agregado space-y-2 para una mejor separación */}
          <button
            onClick={() => handleSelect(inicioItem?.path ?? 'inicio')}
            className={`relative flex items-center w-full pl-10 px-4 py-3 bg-transparent rounded-full text-white font-semibold hover:bg-white/5 focus:outline-none focus:ring-0 shadow-none
                       ${activeContent === (inicioItem?.path ?? 'inicio') ? 'bg-white/5' : ''}`} 
          >
            <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white">
              <AiOutlineHome style={{ color: '#0ea5e9' }} size={18} />
            </span>
            <span className="ml-8 text-lg">Inicio</span> {/* Ajuste de ml para texto más alineado */}
          </button>

          <button
            onClick={() => handleSelect('ayuda')}
            className={`relative flex items-center w-full pl-10 px-4 py-3 bg-transparent rounded-full text-white font-semibold hover:bg-white/5 focus:outline-none
                       ${activeContent === 'ayuda' ? 'bg-white/5' : ''}`}
          >
            <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white">
              <AiOutlineQuestionCircle style={{ color: '#0ea5e9' }} size={18} />
            </span>
            <span className="ml-8 text-lg">Ayuda</span>
          </button>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="relative flex items-center w-full pl-10 px-4 py-3 bg-transparent rounded-full text-white font-semibold hover:bg-white/5 focus:outline-none"
          >
            <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white">
              <img src="/images/PasswordUpdate.svg" alt="Actualizar contraseña" className="w-4 h-4" />
            </span>
            <span className="ml-8 text-md">Actualizar Contraseña</span>
          </button>
        </div>
        <ChangePasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />

        {/* Menú de Navegación Desplegable (se mantiene la lógica de openModules) */}
        <nav className="mt-4 overflow-y-auto scrollbar-hide px-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {Object.keys(groupedMenu).map((moduleName) => {
            const lower = (moduleName || '').toLowerCase().trim();
            const isSecurity = lower.includes("security");
            const isParameter = lower.includes('param');
            return (
              <div key={moduleName} className="mb-3"> {/* Espacio entre módulos */}
                {isSecurity || isParameter ? (
                  <div className="mt-1">
                    <button
                      className={`relative flex items-center w-full pl-10 px-4 py-3 rounded-full text-white font-semibold hover:bg-white/5 focus:outline-none
                                 ${activeContent === (isSecurity ? "security" : "parameter") ? 'bg-white/5' : ''}`}
                      onClick={() => handleSelect(isSecurity ? "security" : "parameter")}
                    >
                      <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white text-sky-600">
                        {isSecurity ? (
                          <img src="/images/Security.svg" alt="Security" className="w-4 h-4" />
                        ) : (
                          <img src="/images/Parametrization.svg" alt="Parametrización" className="w-4 h-4" />
                        )}
                      </span>
                      <span className="ml-8 text-lg">{moduleName}</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-1">
                      <button
                        className={`relative w-full pl-10 px-4 py-3 bg-transparent rounded-full text-white font-semibold hover:bg-white/5 focus:outline-none flex items-center justify-start
                                   ${openModules[moduleName] ? 'bg-white/5' : ''}`} 
                        onClick={() => toggleModule(moduleName)}
                        aria-expanded={!!openModules[moduleName]}
                      >
                        <span className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white text-sky-600">
                          {(moduleName || '').toLowerCase().includes('operational') ? 
                            <FaUserCog style={{ color: '#0ea5e9' }} size={18} /> : 
                            (openModules[moduleName] ? <FaBars size={18} /> : <FaBars style={{ transform: 'rotate(90deg)' }} size={18} />)
                          }
                        </span>
                        <span className="ml-8 text-lg">{moduleName}</span>
                      </button>
                    </div>
                    
                    <div
                      className="mt-1 overflow-hidden transition-all duration-200"
                      style={{ maxHeight: openModules[moduleName] ? '600px' : '0px' }}
                    >
                      <ul className="mt-1 ml-4 border-l border-white/20 pl-4 space-y-1"> {/* Aumento del pl para sub-items */}
                        {groupedMenu[moduleName]?.filter(item => 
                            !['evaluation', 'evaluación', 'inicio'].includes(item.form?.toLowerCase() || '')
                        ).map((item) => (
                          <li key={item.formId}>
                            <button
                              onClick={() => handleSelect(item.path)}
                              className={`relative w-full text-left pl-10 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center
                                         ${activeContent === item.path ? 'bg-white/5 text-white' : 'bg-transparent hover:bg-white/5'}`}
                            >
                              <span className="absolute left-4 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white">
                                {item.form === "Inicio" ? (
                                  <AiOutlineHome className="text-sky-600" size={16} />
                                ) : item.form === "Seguimiento" ? (
                                  <AiOutlineBarChart className="text-sky-600" size={16} />
                                ) : item.form === "Experiencia" ? (
                                  <AiOutlineFileText className="text-sky-600" size={16} />
                                ) : item.form === "Persons" ? (
                                  <IoPersonSharp className="text-sky-600" size={16} />
                                ) : item.form === "Users" ? (
                                  <TbUserScan className="text-sky-600" size={16} />
                                ) : item.form === "Roles" ? (
                                  <RiAdminLine className="text-sky-600" size={16} />
                                ) : (
                                  <svg width="16" height="16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" /></svg>
                                )}
                              </span>
                              <span className="ml-6 text-md">{item.form}</span> {/* Ajuste ml para texto de sub-item */}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </nav>

        {/* Botón Cerrar Sesión */}
        <div className="px-4 mt-6 mb-6"> {/* Más espacio arriba */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="relative flex items-center w-full bg-slate-800/60 text-white py-3 px-3 rounded-xl shadow-inner hover:bg-slate-700/80 focus:outline-none justify-start"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 h-12 w-3 rounded-r-full" style={{ border: '3px solid #9be7ff' }}></div>
            <div className="flex items-center justify-center ml-2 mr-4 z-10">
              <div className="flex items-center justify-center w-10 h-10 bg-[#9be7ff] rounded-full">
                <img src="/images/LogOut.svg" alt="Cerrar Sesión" className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 text-center text-lg font-semibold">Cerrar Sesión</div>
          </button>
        </div>

        <ConfirmLogoutModal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />
      </aside>
    </>
  );
};

export default Sidebar;