import React, { useEffect, useRef, useState, ReactElement } from 'react';
import Joyride from 'react-joyride';
import axios from 'axios';
import { FaLock, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { BsShieldLockFill } from 'react-icons/bs';
import { changePasswordTourSteps, changePasswordTourStyles, changePasswordTourLocale } from '../../features/onboarding/changePasswordTour';
import { hasTourBeenSeen, markTourSeen } from '../utils/tourStorage';

type Props = {
  open: boolean;
  onClose: () => void;
};

const ChangePasswordModal: React.FC<Props> = ({ open, onClose }) => {
  const tourKey = 'changePasswordTourDone';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalType, setResultModalType] = useState<'success' | 'error' | null>(null);
  const [resultModalMessage, setResultModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [runTour, setRunTour] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const currentPasswordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess('');

      setTimeout(() => currentPasswordRef.current?.focus(), 50);

      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      if (!hasTourBeenSeen(tourKey)) {
        const timer = window.setTimeout(() => setRunTour(true), 400);
        return () => window.clearTimeout(timer);
      }
    } else {
      setRunTour(false);
    }
  }, [open, tourKey]);

  const validatePassword = (password: string) => {
    const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 8;
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    return { hasUpperLower, hasNumber, hasMinLength, hasSpecialChar };
  };

  const handlePasswordChange = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.hasMinLength || !validation.hasNumber || !validation.hasUpperLower || !validation.hasSpecialChar) {
      setPasswordError('La nueva contraseña no cumple las reglas de seguridad');
      return;
    }

    try {
      setIsLoading(true);

      const userId = Number(localStorage.getItem('userId')) || undefined;
      const token = localStorage.getItem('token');

      const resp = await axios.put(
        '/api/Auth/UpdatePassword',
        { userId, currentPassword, newPassword, confirmPassword },
        { headers: { Authorization: 'Bearer ' + (token || '') } }
      );

      setResultModalType('success');
      setResultModalMessage(resp?.data?.message || 'Contraseña actualizada correctamente');
      setShowResultModal(true);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();

      setTimeout(() => setShowResultModal(false), 2500);
    } catch (err: any) {
      setResultModalType('error');
      setResultModalMessage(err?.response?.data?.message || err?.message || 'Error al actualizar la contraseña');
      setShowResultModal(true);

      setTimeout(() => setShowResultModal(false), 2500);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[1000]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Joyride
        steps={changePasswordTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={changePasswordTourLocale}
        styles={changePasswordTourStyles}
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            setRunTour(false);
            markTourSeen(tourKey);
          }
        }}
      />
      <div ref={modalRef} className="bg-white p-8 rounded-xl w-full max-w-xl relative shadow-2xl"> {/* 🛑 ANCHO CAMBIADO: max-w-xl (más ancho) */}

        {/* Botón cerrar (arriba a la derecha) */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-sky-600 transition-colors duration-200"
          onClick={onClose}
        >
          <FaTimes size={30} />
        </button>

        {/* Cabecera de Diseño */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-3 mb-4"> {/* 🛑 MARGEN REDUCIDO: mb-4 */}
          {/* Icono Grande con el Gradiente del Menú */}
          <div className="p-3 rounded-full bg-gradient-to-br from-indigo-600 to-sky-600 shadow-lg">
            <BsShieldLockFill size={28} className="text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-2xl" style={{ color: "#000000" }}>
              Actualizar Contraseña
            </h2>

            <p className="text-gray-500 text-sm ">Asegura tu cuenta con una clave fuerte.</p>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handlePasswordChange}> {/* 🛑 ESPACIADO REDUCIDO: gap-4 */}

          {/* SECCIÓN DE INPUTS Y VALIDACIÓN (Se mantiene el orden, se optimiza el layout) */}
          <div className="grid grid-cols-2 gap-x-6"> {/* 🛑 LAYOUT: Dos columnas para input y validación */}

            {/* COLUMNA 1: INPUTS */}
            <div className="flex flex-col gap-4">
              {/* Actual */}
              <div className="text-left">
                <label className="font-semibold mb-1 block text-gray-700">Contraseña actual</label>
                <input
                  ref={currentPasswordRef}
                  type="password"
                  placeholder="tu contraseña actual "
                  className="border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors change-password-current"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Nueva */}
              <div className="text-left">
                <label className="font-semibold mb-1 block text-gray-700">Nueva contraseña</label>
                <input
                  type="password"
                  placeholder="Ej: Contraseña123!"
                  className="border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors change-password-new"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* Confirmación */}
              <div className="text-left">
                <label className="font-semibold mb-1 block text-gray-700">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  placeholder="Ej: Contraseña123!"
                  className={`border border-gray-300 rounded-lg px-4 py-3 w-full text-gray-800 focus:outline-none focus:ring-2 ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500 ring-red-200' : 'focus:ring-sky-500'} transition-colors change-password-confirm`}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* COLUMNA 2: VALIDACIÓN (Aprovechando el ancho extra) */}
            <div className="pt-8 change-password-rules">
              {/* Reglas de Validación */}
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4"> {/* Aumentado el padding para mejor estética */}
                <div className="font-bold text-sky-600 mb-2 flex items-center gap-2">
                  <FaLock size={14} /> Reglas de Seguridad:
                </div>
                <ul className="grid grid-cols-1 gap-y-1 text-sm"> {/* 🛑 LAYOUT: Una sola columna para que las reglas no se vean apretadas */}
                  {
                    [
                      { valid: passwordValidation.hasMinLength, text: 'Mínimo 8 caracteres' },
                      { valid: passwordValidation.hasUpperLower, text: 'Al menos una mayúscula y una minúscula' }, // Texto más descriptivo
                      { valid: passwordValidation.hasNumber, text: 'Al menos un número' },
                      { valid: passwordValidation.hasSpecialChar, text: 'Al menos 1 carácter especial (!@#$%&)' }, // Texto más descriptivo
                    ]
                      .map((rule, index) => (
                        <li key={index} className={`flex items-start gap-2 ${rule.valid ? 'text-green-600' : 'text-gray-500'}`}>
                          {rule.valid ? <FaCheckCircle size={12} className="text-green-500 mt-1 flex-shrink-0" /> : <FaTimes size={12} className="text-gray-400 mt-1 flex-shrink-0" />} {/* 🛑 Usamos FaTimes para reglas no cumplidas */}
                          {rule.text}
                        </li>
                      ))
                  }
                </ul>
              </div>
            </div>
          </div>

          {/* Mensaje de Error/Éxito (Se mantiene abajo de los inputs) */}
          {(passwordError || passwordSuccess) && (
            <div className={`font-semibold p-3 rounded-lg flex items-center gap-2 ${passwordError ? 'text-red-700 bg-red-100 border border-red-300' : 'text-green-700 bg-green-100 border border-green-300'}`}>
              {passwordError ? <FaExclamationCircle size={18} /> : <FaCheckCircle size={18} />}
              <span>{passwordError || passwordSuccess}</span>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 mt-2 change-password-actions"> {/* 🛑 MARGEN REDUCIDO: mt-2 */}
            <button
              type="button"
              className="bg-gray-200 text-gray-700 rounded-lg px-6 py-2 font-semibold hover:bg-gray-300 transition-colors text-base"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading || newPassword !== confirmPassword || !Object.values(passwordValidation).every(v => v)}
              className="bg-gradient-to-br from-indigo-600 to-sky-600 text-white rounded-lg px-6 py-2 font-semibold shadow-md hover:from-indigo-700 hover:to-sky-700 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Resultado (Éxito/Error) */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1100]">
          <div className={`border-2 p-8 rounded-xl text-center w-96 shadow-lg transition-all duration-300
              ${resultModalType === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}
          >
            <h5 className={`font-bold text-2xl mb-4 ${resultModalType === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {resultModalType === 'success' ? <FaCheckCircle size={30} className="inline mr-2" /> : <FaExclamationCircle size={30} className="inline mr-2" />}
              {resultModalType === 'success' ? '¡Éxito!' : 'Error'}
            </h5>
            <div className="text-gray-700 text-lg">{resultModalMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordModal;