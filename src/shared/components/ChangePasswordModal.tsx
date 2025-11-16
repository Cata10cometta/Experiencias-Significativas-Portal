import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

type Props = {
  open: boolean;
  onClose: () => void;
};

const ChangePasswordModal: React.FC<Props> = ({ open, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalType, setResultModalType] = useState<'success' | 'error' | null>(null);
  const [resultModalMessage, setResultModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const currentPasswordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // reset state when opening
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); setPasswordSuccess('');
      // focus the first input shortly after opening
      setTimeout(() => currentPasswordRef.current?.focus(), 50);
      return () => { document.body.style.overflow = prev; };
    }
    return;
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const validatePassword = (password: string) => {
    const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 8;
    // special char: any non alphanumeric
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
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={modalRef} className="bg-white p-8 rounded-2xl w-full max-w-lg relative">
        {/* Icono de candado */}
        <div className="flex flex-col items-center -mt-12 mb-4">
          <div className="bg-blue-100 rounded-full p-4 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3V7a3 3 0 10-6 0v1c0 1.657 1.343 3 3 3zm6 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2h8a2 2 0 012 2z" />
            </svg>
          </div>
        </div>
        {/* Botón cerrar */}
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>
        <h2 className="font-bold text-2xl mb-1 text-left">Cambiar contraseña</h2>
        <p className="text-gray-500 mb-6 text-left">Ingresa tu contraseña actual y crea una nueva</p>
        <form className="flex flex-col gap-4" onSubmit={handlePasswordChange}>
          <div className="text-left">
            <label className="font-semibold mb-1 block">Contraseña actual</label>
            <input ref={currentPasswordRef} type="password" placeholder="Ingresa tu contraseña actual" className="border border-gray-300 rounded px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-base" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          <div className="text-left">
            <label className="font-semibold mb-1 block">Nueva contraseña</label>
            <input type="password" placeholder="Ingresa tu nueva contraseña" className="border border-gray-300 rounded px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-base" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" required />
          </div>
          <div className="text-left">
            <label className="font-semibold mb-1 block">Confirmar nueva contraseña</label>
            <input type="password" placeholder="Confirma tu nueva contraseña" className="border border-gray-300 rounded px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-base" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
          </div>

          {/* Validaciones dinámicas */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3V7a3 3 0 10-6 0v1c0 1.657 1.343 3 3 3zm6 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2h8a2 2 0 012 2z" />
            </svg>
            <div>
              <span className="font-semibold text-gray-700">Seguridad:</span>
              <ul className="text-sm mt-1 list-disc list-inside">
                <li className={passwordValidation.hasUpperLower ? 'text-green-600' : 'text-red-500'}>Al menos una mayúscula y una minúscula</li>
                <li className={passwordValidation.hasMinLength ? 'text-green-600' : 'text-red-500'}>Mínimo 8 caracteres</li>
                <li className={passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'}>Al menos un número</li>
                <li className={passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-500'}>Al menos un carácter especial (e.g., !@#$%^&*)</li>
              </ul>
            </div>
          </div>
          {(passwordError || passwordSuccess) && (
            <div className={passwordError ? 'text-red-500 font-bold bg-red-100 rounded p-2' : 'text-green-600 font-bold bg-green-100 rounded p-2'}>{passwordError || passwordSuccess}</div>
          )}
          <div className="flex justify-between mt-6">
            <div className="flex gap-2 w-full justify-center">
              <button type="button" className="bg-gray-100 text-gray-700 !rounded-xl px-8 py-3 font-bold hover:bg-gray-200 text-lg" onClick={onClose}>Cancelar</button>
              <button type="submit" disabled={isLoading} className="bg-blue-500 text-white !rounded-xl px-8 py-3 font-bold hover:bg-blue-600 text-lg">{isLoading ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal resultado cambio contraseña */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100]">
          <div className={(resultModalType === 'success' ? 'border-green-500 border-2 ' : 'border-red-500 border-2 ') + 'bg-white p-8 rounded-xl text-center w-96 shadow-lg'}>
            <h5 className={(resultModalType === 'success' ? 'text-green-600' : 'text-red-600') + ' font-bold text-2xl mb-4'}>{resultModalType === 'success' ? '¡Éxito!' : 'Error'}</h5>
            <div className="text-lg">{resultModalMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordModal;