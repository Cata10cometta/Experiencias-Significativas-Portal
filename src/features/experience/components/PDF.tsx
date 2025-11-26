import type { ExperienceDocument } from "../types/experienceTypes";
import React, { useRef, useState } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const PDFUploader: React.FC<{
  value: Partial<ExperienceDocument>;
  onChange: (doc: Partial<ExperienceDocument> | null) => void;
}> = ({ value, onChange }) => {
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const [selectedFile1, setSelectedFile1] = useState<File | null>(null);
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Convertir archivo a base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 1 | 2
  ) => {
    setErrorMessage("");
    try {
      const file = e.target.files?.[0];
      if (!file) throw new Error("No se seleccionó ningún archivo");
      if (file.type !== "application/pdf") throw new Error("Solo se permiten archivos PDF");

      const base64 = await toBase64(file);

      if (slot === 1) {
        setSelectedFile1(file);
        setSelectedFile1(file);
        onChange({ ...value, name: file.name, urlPdfExperience: base64 });
      } else {
        setSelectedFile2(file);
        onChange({ ...value, urlPdf: base64 });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al cargar el PDF");
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, slot: 1 | 2) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const file = e.dataTransfer.files[0];
      if (!file) throw new Error("No se seleccionó ningún archivo");
      if (file.type !== "application/pdf") throw new Error("Solo se permiten archivos PDF");

      const base64 = await toBase64(file);

      if (slot === 1) {
        setSelectedFile1(file);
        setSelectedFile1(file);
        onChange({ ...value, name: file.name, urlPdfExperience: base64 });
      } else {
        setSelectedFile2(file);
        onChange({ ...value, urlPdf: base64 });
      } 
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al cargar el PDF");
    }
  };

  const handleClick = (slot: 1 | 2) => {
    if (slot === 1) fileInputRef1.current?.click();
    else fileInputRef2.current?.click();
  };

  return (
    <div>
      {errorMessage && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded border border-red-300">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      <label className="block font-semibold mb-2">ADJUNTAR PDF</label>
      <div className="grid grid-cols-2 gap-4">
        {/* Slot 1 */}

        {/* Primer PDF: Proyecto Experiencia Significativa */}
        <div
          className="bg-gray-50 border rounded-xl flex flex-col justify-center items-center h-56 cursor-pointer relative"
          onClick={() => handleClick(1)}
          onDrop={(e) => handleDrop(e, 1)}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef1}
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, 1)}
          />

          {(selectedFile1 || value?.name || value?.urlPdfExperience) && (
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile1(null);
                onChange({ ...value, name: undefined, urlPdfExperience: undefined });
              }}
              aria-label="Quitar PDF"
            >
              <IoClose />
            </button>
          )}

          <FaRegFilePdf className="mb-4 text-red-600" style={{ fontSize: 72 }} />
          <span className="text-gray-500 text-sm">
            {selectedFile1
              ? selectedFile1.name
              : value?.name
              ? value.name
              : value?.urlPdfExperience
              ? "PDF cargado"
              : "Haz click o arrastra el Proyecto Experiencia Significativa aquí"}
          </span>
        </div>

        {/* Segundo PDF: Oficio de presentación */}
        <div
          className="bg-gray-50 border rounded-xl flex flex-col justify-center items-center h-56 cursor-pointer relative"
          onClick={() => handleClick(2)}
          onDrop={(e) => handleDrop(e, 2)}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef2}
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, 2)}
          />

          {(selectedFile2 || value?.urlPdf) && (
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile2(null);
                onChange({ ...value, urlPdf: undefined });
              }}
              aria-label="Quitar PDF"
            >
              <IoClose />
            </button>
          )}

          <FaRegFilePdf className="mb-4 text-red-600" style={{ fontSize: 72 }} />
          <span className="text-gray-500 text-sm">
            {selectedFile2
              ? selectedFile2.name
              : value?.urlPdf
              ? "PDF cargado"
              : "Haz click o arrastra el Oficio de presentación aquí"}
          </span>
        </div>
      </div>

      

      {/* Campo de URL */}
      <div className="mt-4">
        <label className="font-semibold">Espacios de divulgación</label>
        <p className="text-sm text-gray-600 mb-1">
          Registre los enlaces públicos donde se encuentre alojada la experiencia significativa (videos, blogs, página web).
        </p>
        <textarea
          className="w-full border rounded p-2"
          rows={2}
          value={value?.urlLink ?? ""}
          onChange={(e) => {
            try {
              onChange({ ...value, urlLink: e.target.value });
            } catch (err: any) {
              setErrorMessage("Error al actualizar el enlace: " + (err?.message || ""));
            }
          }}
        />
      </div>
    </div>
  );
};

export default PDFUploader;

