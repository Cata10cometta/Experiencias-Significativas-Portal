import React, { useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmLogoutModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1200]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={modalRef} className="p-6 rounded-2xl w-full max-w-md relative text-center overflow-hidden"
           style={{
             background: 'linear-gradient(180deg,#4f46e5 0%, #6d28d9 45%, #2b0b3b 100%)',
             boxShadow: '0 10px 30px rgba(11,7,34,0.5)'
           }}>
        <button className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="flex items-center gap-2 mb-6">
          <img src="/images/Cohete.png" alt="cohete" className="w-45 h-45 object-contain transform translate-x-5 rotate-30" />
          <div className="text-left">
            <h2 className="font-extrabold text-white text-2xl leading-tight">Gestión de Experiencias<br/>Significativas</h2>
          </div>
        </div>

        <p className="text-white text-lg font-semibold mb-8">Estas seguro de cerrar sesion?</p>

        <div className="flex gap-4 justify-center">
          <button onClick={onClose} className="min-w-[120px] bg-[#03A9F4] hover:bg-[#02a3e6] text-white rounded-full! px-6 py-3 font-bold shadow-md">Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="min-w-[120px] bg-[#fb923c] hover:bg-[#fb7a1c] text-white rounded-full! px-6 py-3 font-bold shadow-md">Aceptar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
