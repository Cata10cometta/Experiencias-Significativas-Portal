import React, { useState, useEffect } from "react";
import Joyride from "react-joyride";
import configApi from "../../../Api/Config/Config";
import { getEnum } from "../../../Api/Services/Helper";
import { DataSelectRequest } from "../../../shared/types/HelperTypes";
import { securityPersonsTourSteps, securityTourLocale, securityTourStyles } from "../../onboarding/securityTour";
import { Person } from "../types/Person";



interface AddPersonFormProps {
  onClose: () => void;
  onAdded: () => void;
}

const AddPersonForm: React.FC<AddPersonFormProps> = ({ onClose, onAdded }) => {
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [firstLastName, setFirstLastName] = useState("");
  const [secondLastName, setSecondLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailInstitutional, setEmailInstitutional] = useState("");
  const [phone, setPhone] = useState("");
  const [codeDane, setCodeDane] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [documentTypes, setDocumentTypes] = useState<DataSelectRequest[]>([]);
  const [codigoDaneOptions, setCodigoDaneOptions] = useState<DataSelectRequest[]>([]);
  const [emailInstitucionalOptions, setEmailInstitucionalOptions] = useState<DataSelectRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const dt = await getEnum("DocumentType");
        setDocumentTypes(dt || []);
        const cd = await getEnum("CodeDane");
        setCodigoDaneOptions(cd || []);
        const emailInstitucionalOpts = await getEnum("EmailInstitucional");
        setEmailInstitucionalOptions(emailInstitucionalOpts || []);
        // console.log("EmailInstitutional recibidos:", emailInstitucionalOpts);
      } catch (e) {
        // ignore
      }
    };
    fetchEnums();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await configApi.post(
        "/Person/create",
        {
          documentType,
          identificationNumber,
          firstName,
          middleName,
          firstLastName,
          secondLastName,
          codeDane,
          emailInstitutional,
          email,
          phone: phone ? parseInt(phone, 10) : 0,
          code,
          username,
          password
        }
      );
      onAdded();
      onClose();
    } catch (err: any) {
      let msg = "Error al crear la persona. Por favor verifica los datos.";
      if (err?.response?.data) {
        if (typeof err.response.data === "string") {
          msg = err.response.data;
        } else if (typeof err.response.data === "object" && err.response.data.message) {
          msg = err.response.data.message;
        } else if (err.response.data.error) {
          msg = err.response.data.error;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl! shadow-lg w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Persona</h3>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-semibold">Tipo de Documento</label>
            <select className="w-full p-2 border rounded" value={documentType} onChange={e => setDocumentType(e.target.value)} required>
              <option value="">Seleccione...</option>
              {documentTypes.map(d => <option key={d.id} value={d.displayText}>{d.displayText}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold">Número de Identificación</label>
            <input className="w-full p-2 border rounded" value={identificationNumber} onChange={e => setIdentificationNumber(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Primer Nombre</label>
            <input className="w-full p-2 border rounded" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Segundo Nombre</label>
            <input className="w-full p-2 border rounded" value={middleName} onChange={e => setMiddleName(e.target.value)} />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Primer Apellido</label>
            <input className="w-full p-2 border rounded" value={firstLastName} onChange={e => setFirstLastName(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Segundo Apellido</label>
            <input className="w-full p-2 border rounded" value={secondLastName} onChange={e => setSecondLastName(e.target.value)} />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Email</label>
            <input type="email" className="w-full p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Email Institucional</label>
            <select
              className="w-full p-2 border rounded"
              value={emailInstitutional}
              onChange={e => setEmailInstitutional(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {emailInstitucionalOptions.map(opt => (
                <option key={opt.id} value={opt.displayText}>{opt.displayText}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold">Teléfono</label>
            <input className="w-full p-2 border rounded" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Código Dane</label>
            <select className="w-full p-2 border rounded" value={codeDane} onChange={e => setCodeDane(e.target.value)}>
              <option value="">Seleccione...</option>
              {codigoDaneOptions.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold">Código</label>
            <input className="w-full p-2 border rounded" value={code} onChange={e => setCode(e.target.value)} />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Usuario</label>
            <input className="w-full p-2 border rounded" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Contraseña</label>
            <input type="password" className="w-full p-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-4 justify-end mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
};

interface EditPersonFormProps {
  person: Person & { id?: number };
  onClose: () => void;
  onUpdated: () => void;
}

const EditPersonForm: React.FC<EditPersonFormProps> = ({ person, onClose, onUpdated }) => {
  const [firstName, setFirstName] = useState(person.firstName);
  const [middleName, setMiddleName] = useState(person.middleName);
  const [firstLastName, setFirstLastName] = useState(person.firstLastName);
  const [secondLastName, setSecondLastName] = useState(person.secondLastName);
  const [email, setEmail] = useState(person.email);
  const [phone, setPhone] = useState(person.phone.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    try {
      await configApi.put(
        `/Person`,
        {
          id: person.id,
          firstName,
          middleName,
          firstLastName,
          secondLastName,
          email,
          phone: parseInt(phone, 10),
        }
      );
      onUpdated(); // Refrescar la lista
      onClose(); // Cerrar el formulario
    } catch (err: any) {
      setError("Error al actualizar la persona. Por favor, verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4 text-sky-700">Editar Persona</h3>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Primer Nombre</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Segundo Nombre</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Primer Apellido</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={firstLastName}
                onChange={(e) => setFirstLastName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Segundo Apellido</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={secondLastName}
                onChange={(e) => setSecondLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Teléfono</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PersonsList: React.FC = () => {
  const [persons, setPersons] = useState<(Person & { id?: number; state?: boolean })[]>([]);
  const [editPerson, setEditPerson] = useState<Person & { id?: number } | null>(null);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const onlyActive = true; // Estado para filtrar personas activas/inactivos (const since no toggle UI present)
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;
  const [runTour, setRunTour] = useState(false);

  const fetchPersons = () => {
    const token = localStorage.getItem("token");
    configApi
      .get("/Person/getAll", {
        params: { OnlyActive: onlyActive },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          const personsNormalized = res.data.data.map((person: Person) => ({
            ...person,
            state: onlyActive ? true : false, // Adjust state interpretation based on OnlyActive
          }));
          setPersons(personsNormalized);
        } else {
          setPersons([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar personas");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPersons();
  }, [onlyActive]); // Refrescar cuando cambie el filtro

  useEffect(() => {
    if (!loading && !runTour && !localStorage.getItem("securityPersonsTourDone")) {
      const timer = window.setTimeout(() => setRunTour(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, [loading, runTour]);

  if (loading) return <div>Cargando personas...</div>;
  if (error) return <div>{error}</div>;

  const filteredPersons = persons.filter(p => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (`${p.firstName || ''} ${p.firstLastName || ''} ${p.identificationNumber || ''} ${p.email || ''}`).toLowerCase().includes(q);
  });

  const handleDeactivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await configApi.delete(`/Person/${id}`);
      fetchPersons(); // Refrescar lista
    } catch (err) {
      console.error("Error al desactivar persona:", err);
    }
  };

  const handleActivate = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      await configApi.patch(`/Person/restore/${id}`);
      fetchPersons(); // Refrescar lista
    } catch (err) {
      console.error("Error al activar persona:", err);
    }
  };

  return (
  <div className="w-full mx-0 mt-6 px-6 py-6 security-persons-layout">
      <Joyride
        steps={securityPersonsTourSteps}
        run={runTour}
        continuous
        showSkipButton
        locale={securityTourLocale}
        styles={securityTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRunTour(false);
            localStorage.setItem("securityPersonsTourDone", "true");
          }
        }}
      />
      {/* header moved into white card so the card 'grabs' the title and CTA too */}

  <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 w-full security-persons-card">
        <div className="flex items-start justify-between mb-4 security-persons-header">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 -mt-8">
              <svg width="55" height="55" viewBox="0 0 48 48" className="w-11 h-11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <mask id="path-1-inside-1_2506_2260" fill="white">
                  <path d="M0 16C0 7.16344 7.16344 0 16 0H32C40.8366 0 48 7.16344 48 16V32C48 40.8366 40.8366 48 32 48H16C7.16344 48 0 40.8366 0 32V16Z"/>
                </mask>
                <path d="M0 16C0 7.16344 7.16344 0 16 0H32C40.8366 0 48 7.16344 48 16V32C48 40.8366 40.8366 48 32 48H16C7.16344 48 0 40.8366 0 32V16Z" fill="#7CDDFE" fillOpacity="0.1"/>
                <path d="M16 0V1H32V0V-1H16V0ZM48 16H47V32H48H49V16H48ZM32 48V47H16V48V49H32V48ZM0 32H1V16H0H-1V32H0ZM16 48V47C7.71573 47 1 40.2843 1 32H0H-1C-1 41.3888 6.61116 49 16 49V48ZM48 32H47C47 40.2843 40.2843 47 32 47V48V49C41.3888 49 49 41.3888 49 32H48ZM32 0V1C40.2843 1 47 7.71573 47 16H48H49C49 6.61116 41.3888 -1 32 -1V0ZM16 0V-1C6.61116 -1 -1 6.61116 -1 16H0H1C1 7.71573 7.71573 1 16 1V0Z" fill="#7CDDFE" fillOpacity="0.2" mask="url(#path-1-inside-1_2506_2260)"/>
                <path d="M32 25C32 30 28.5 32.5 24.34 33.95C24.1222 34.0238 23.8855 34.0202 23.67 33.94C19.5 32.5 16 30 16 25V18C16 17.7347 16.1054 17.4804 16.2929 17.2929C16.4804 17.1053 16.7348 17 17 17C19 17 21.5 15.8 23.24 14.28C23.4519 14.099 23.7214 13.9995 24 13.9995C24.2786 13.9995 24.5481 14.099 24.76 14.28C26.51 15.81 29 17 31 17C31.2652 17 31.5196 17.1053 31.7071 17.2929C31.8946 17.4804 32 17.7347 32 18V25Z" stroke="#7CDDFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-sky-700">Lista de Personas</h2>
              <p className="text-sm text-gray-500 mt-1">Administra las personas registradas en el sistema</p>
            </div>
          </div>
          <div className="security-persons-create">
            <button
              onClick={() => setAddPersonOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-2xl! shadow hover:bg-sky-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Agregar Persona
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4 security-persons-search">
          <div className="flex-1">
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar personas..."
                className="pl-12 pr-4 h-12 border rounded-full w-full bg-gray-50 shadow-sm"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386-1.414 1.415-4.387-4.387zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white border border-gray-100 p-4 overflow-auto security-persons-table">
          <table className="min-w-full w-full rounded-lg overflow-hidden table-auto">
            <thead className="text-left text-sm text-gray-600 bg-gray-50">
              <tr>
                <th className="py-4 px-6">Persona</th>
                <th className="py-4 px-6">Tipo Documento</th>
                <th className="py-4 px-6">Número Identificación</th>
                <th className="py-4 px-6">Código Dane</th>
                <th className="py-4 px-6">Email Institucional</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Teléfono</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {filteredPersons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 px-4 text-center text-gray-500">No hay personas para mostrar.</td>
                </tr>
              ) : (
                (() => {
                  const totalPages = Math.max(1, Math.ceil(filteredPersons.length / pageSize));
                  if (currentPage > totalPages) setCurrentPage(totalPages);
                  const paginated = filteredPersons.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return paginated.map((person) => (
                  <tr key={person.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 1116 0H2z" clipRule="evenodd"/></svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{`${person.firstName || ''} ${person.firstLastName || ''}`.trim()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{person.documentType}</td>
                    <td className="py-4 px-6">{person.identificationNumber || ''}</td>
                    <td className="py-4 px-6">{person.codeDane || ''}</td>
                    <td className="py-4 px-6">{person.emailInstitutional || ''}</td>
                    <td className="py-4 px-6">{person.email}</td>
                    <td className="py-4 px-6">{person.phone}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {person.state ? (
                        <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Activo</span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Inactivo</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-sky-600" onClick={() => setEditPerson(person)} title="Editar">
                          {/* Pencil icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 010 2.828l-9.193 9.193a1 1 0 01-.464.263l-4 1a1 1 0 01-1.213-1.213l1-4a1 1 0 01.263-.464L14.586 2.586a2 2 0 012.828 0z"/></svg>
                        </button>
                        {person.state ? (
                          <button className="text-red-400 hover:text-red-600" onClick={() => { if (person.id != null) handleDeactivate(person.id); }} title="Desactivar">
                            {/* Trash icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h1v9a2 2 0 002 2h6a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 5a1 1 0 10-2 0v7a1 1 0 102 0V7z" clipRule="evenodd"/></svg>
                          </button>
                        ) : (
                          <button className="text-emerald-500 hover:text-emerald-600" onClick={() => { if (person.id != null) handleActivate(person.id); }} title="Activar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 10a7 7 0 1114 0 1 1 0 102 0 9 9 0 10-18 0 1 1 0 102 0z"/><path d="M10 6v5l3 3"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex items-center justify-between security-persons-pagination">
          <div className="text-sm text-gray-500">
            {filteredPersons.length === 0 ? (
              <>Mostrando 0 personas</>
            ) : (
              (() => {
                const start = (currentPage - 1) * pageSize + 1;
                const end = Math.min(filteredPersons.length, currentPage * pageSize);
                return <>Mostrando {start}-{end} de {filteredPersons.length} personas</>;
              })()
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Anterior</button>
            {(() => {
              const pages: number[] = [];
              const totalPages = Math.max(1, Math.ceil(filteredPersons.length / pageSize));
              let start = Math.max(1, currentPage - 2);
              let end = Math.min(totalPages, start + 4);
              if (end - start < 4) start = Math.max(1, end - 4);
              for (let i = start; i <= end; i++) pages.push(i);
              return pages.map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1 rounded ${currentPage === p ? 'bg-sky-600 text-white' : 'bg-white border'}`}>{p}</button>
              ));
            })()}
            <button className="px-3 py-1 rounded border" onClick={() => setCurrentPage(Math.min(Math.max(1, Math.ceil(filteredPersons.length / pageSize)), currentPage + 1))} disabled={currentPage === Math.max(1, Math.ceil(filteredPersons.length / pageSize))}>Siguiente</button>
          </div>
        </div>
      </div>

      {editPerson && (
        <EditPersonForm
          person={editPerson}
          onClose={() => setEditPerson(null)}
          onUpdated={() => {
            setLoading(true);
            fetchPersons();
          }}
        />
      )}
      {addPersonOpen && (
        <AddPersonForm
          onClose={() => setAddPersonOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchPersons();
          }}
        />
      )}
    </div>
  );
};

export default PersonsList;