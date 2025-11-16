import React from "react";

interface SessionExpiredModalProps {
  onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ onClose }) => {
  console.log("Renderizando modal de sesión expirada...");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center text-red-600">Sesión Expirada</h2>
        <p className="text-gray-700 text-center mb-6">
          Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.
        </p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ir al Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
