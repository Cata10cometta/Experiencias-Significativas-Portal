import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form } from "../types/form";


interface EditFormProps {
  form: Form;
  onClose: () => void;
  onUpdated: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ form, onClose, onUpdated }) => {
  const [name, setName] = useState(form.name);
  const [path, setPath] = useState(form.path);
  const [description, setDescription] = useState(form.description);
  const [icon, setIcon] = useState(form.icon);
  const [order, setOrder] = useState(form.order);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/Form`, {
    id: form.id,
    name,
    path,
    description,
    icon,
    order,
    state: form.state ?? true,
    createdAt: form.createdAt ?? new Date().toISOString(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      onUpdated();
      onClose();
    } catch (err) {
      setError("Error al actualizar formulario");
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Editar Formulario</h3>
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Ruta</label>
        <input value={path} onChange={e => setPath(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Descripción</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Icono</label>
        <input value={icon} onChange={e => setIcon(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2 font-semibold">Orden</label>
        <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full mb-4 p-2 border rounded" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">{loading ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
};


const AddForm: React.FC<{ onClose: () => void; onAdded: () => void }> = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      await axios.post("/api/Form", {
        id: 0,
        name,
        path,
        description,
        icon,
        order,
        state: true,
        createdAt: new Date().toISOString(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      onAdded();
      onClose();
    } catch (err) {
      setError("Error al agregar formulario");
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-sky-700">Agregar Formulario</h3>
        <label className="block mb-2 font-semibold">Nombre</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Ruta (path)</label>
        <input value={path} onChange={e => setPath(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Descripción</label>
        <input value={description} onChange={e => setDescription(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Icono</label>
        <input value={icon} onChange={e => setIcon(e.target.value)} className="w-full mb-4 p-2 border rounded" required />
        <label className="block mb-2 font-semibold">Orden</label>
        <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full mb-4 p-2 border rounded" required />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">{loading ? "Agregando..." : "Agregar"}</button>
        </div>
      </form>
    </div>
  );
};

const Forms: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [editForm, setEditForm] = useState<Form | null>(null);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchForms = () => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/Form/getAll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          setForms(res.data.data.filter((f: Form) => f.state !== false));
        } else {
          setForms([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar formularios");
        setLoading(false);
      });
  };
  const handleDelete = async (form: Form) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/Form/${form.id}`, {
        ...form,
        state: false,
        deletedAt: new Date().toISOString(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(true);
      fetchForms();
    } catch (err: any) {
      setDeleteError("No se puede eliminar el formulario porque tiene registros relacionados.");
      setLoading(false); // Asegura que no se muestre el loader ni cambie de vista
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  if (loading) return <div>Cargando formularios...</div>;
  if (error) return <div>{error}</div>;

  return (
  <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg overflow-y-auto scrollbar-hide" style={{maxHeight: '80vh'}}>
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">Lista de Formularios</h2>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          onClick={() => setAddFormOpen(true)}
        >Agregar Formulario</button>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-sky-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Nombre</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Ruta</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Descripción</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Icono</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Orden</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {forms.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 px-4 text-center text-gray-500">No hay formularios para mostrar.</td>
              </tr>
            ) : (
              forms.map((form) => (
                <tr key={form.id} className="hover:bg-sky-50 transition-colors">
                  <td className="py-2 px-4 border-b">{form.name}</td>
                  <td className="py-2 px-4 border-b">{form.path}</td>
                  <td className="py-2 px-4 border-b">{form.description}</td>
                  <td className="py-2 px-4 border-b">{form.icon}</td>
                  <td className="py-2 px-4 border-b">{form.order}</td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 text-sm"
                      onClick={() => setEditForm(form)}
                    >Editar</button>
                    <button
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                      onClick={() => handleDelete(form)}
                    >Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editForm && (
        <EditForm
          form={editForm}
          onClose={() => setEditForm(null)}
          onUpdated={() => {
            setLoading(true);
            fetchForms();
          }}
        />
      )}
      {addFormOpen && (
        <AddForm
          onClose={() => setAddFormOpen(false)}
          onAdded={() => {
            setLoading(true);
            fetchForms();
          }}
        />
      )}
      {deleteError && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1100] overflow-auto p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
            <h3 className="text-xl font-bold mb-4 text-red-600">Error al eliminar</h3>
            <p className="mb-4 text-gray-700">{deleteError}</p>
            <button
              className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
              onClick={() => setDeleteError(null)}
            >Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms;
