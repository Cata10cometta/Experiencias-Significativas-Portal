import React, { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const NotificationsModal: React.FC<Props> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState<boolean>(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [approvingIds, setApprovingIds] = useState<number[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<number[]>([]);

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    setNotifError(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    const endpoint = `${API_BASE}/api/Experience/all/Notification`;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(endpoint, { method: 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      if (!res.ok) {
        const txt = await res.text().catch(() => `HTTP ${res.status}`);
        setNotifError(`Error al obtener notificaciones: ${txt}`);
        console.error('fetchNotifications error', endpoint, res.status, txt);
        setNotifications([]);
        return;
      }
      const data = await res.json().catch(() => null);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      const normalized = list.map((it: any) => ({
        id: it.id ?? it.notificationId ?? it.requestId ?? null,
        experienceName: it.experienceName ?? it.nameExperiences ?? it.title ?? it.experience?.name ?? `Solicitud edición #${it.id ?? ''}`,
        userName: it.userName ?? it.user?.name ?? it.requestUser ?? it.requestedBy ?? it.username ?? it.solicitante ?? (it.request?.userName) ?? '',
        state: it.status ?? it.state ?? it.requestState ?? it.estado ?? it.stateName ?? it.state?.name ?? 'Pendiente',
        createdAt: it.createdAt ?? it.createdDate ?? it.date ?? it.requestedAt ?? null,
        raw: it,
      }));
      // Also consider persisted approved IDs saved in localStorage so approved notifications
      // don't reappear after a refresh or after server still returns them.
      let persisted: number[] = [];
      try {
        const raw = localStorage.getItem('approvedExperienceIds');
        persisted = Array.isArray(raw ? JSON.parse(raw) : null) ? JSON.parse(raw as string) : [];
      } catch (e) {
        persisted = [];
      }
      const removedSet = new Set<number>([...removedIds.map(Number), ...persisted.map(Number)]);
      const filtered = normalized.filter((n: any) => {
        // Exclude notifications that backend already marks as approved
        if (n.raw?.approved === true || n.approved === true) return false;
        const nExpId = n.raw?.experienceId ?? n.raw?.experience?.id ?? n.raw?.request?.experienceId ?? null;
        const normalizedId = n.id ?? null;
        const keys = [nExpId, normalizedId].map((k: any) => (k == null ? null : Number(k)));
        return !keys.some(k => k != null && removedSet.has(k));
      });
      setNotifications(filtered);
    } catch (err) {
      console.error('fetchNotifications exception', err);
      setNotifError('Error al obtener notificaciones');
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const approveEdit = async (experienceId: number) => {
    if (!experienceId) return;
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
    const endpoint = `${API_BASE}/api/Experience/${experienceId}/approve-edit`;
    const token = localStorage.getItem('token');
    try {
      setApprovingIds(prev => [...prev, experienceId]);
      const res = await fetch(endpoint, { method: 'POST', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      // Try to parse JSON, otherwise fallback to text. Normalize various shapes to extract a meaningful message.
      let backendMsg: string | null = null;
      try {
        const cloned = res.clone();
        const json = await cloned.json().catch(() => null);
        if (json) {
          backendMsg = json.message || json.msg || json.error || (typeof json === 'string' ? json : null) || (json.data && (typeof json.data === 'string' ? json.data : null)) || null;
          if (!backendMsg) {
            // If json is small, stringify a fallback message
            try {
              const str = JSON.stringify(json);
              backendMsg = str !== '{}' ? str : null;
            } catch { backendMsg = null; }
          }
        } else {
          const text = await res.clone().text().catch(() => null);
          backendMsg = text && text.trim().length > 0 ? text : null;
        }
      } catch (e) {
        try {
          const txt = await res.clone().text().catch(() => null);
          backendMsg = txt && txt.trim().length > 0 ? txt : null;
        } catch { backendMsg = null; }
      }

      if (res.ok) {
        const successText = backendMsg ?? 'Edición aprobada.';
        // Show SweetAlert if available, otherwise fallback to alert.
        try { (window as any).Swal?.fire?.({ title: 'Aprobado', text: successText, icon: 'success', confirmButtonText: 'Aceptar' }); } catch { try { alert(successText); } catch {} }
        // Also set an inline success banner so it's visible even if alerts are blocked.
        setSuccessMessage(successText);
        // Immediately remove the related notification from local state so it disappears.
        setNotifications(prev => prev.filter(n => {
          const nExpId = n.raw?.experienceId ?? n.raw?.experience?.id ?? n.raw?.request?.experienceId ?? null;
          const normalizedId = n.id ?? null;
          return nExpId !== experienceId && normalizedId !== experienceId;
        }));
        // Remember this id locally so a subsequent fetch won't re-add it to the UI.
        setRemovedIds(prev => prev.includes(experienceId) ? prev : [...prev, experienceId]);
        try {
          const key = 'approvedExperienceIds';
          const raw = localStorage.getItem(key);
          const arr = Array.isArray(raw ? JSON.parse(raw) : null) ? JSON.parse(raw as string) : [];
          if (!arr.includes(experienceId)) {
            arr.push(experienceId);
            localStorage.setItem(key, JSON.stringify(arr));
          }
        } catch (e) {
          console.debug('Could not persist approvedExperienceIds', e);
        }
        // Clear inline message after a short time.
        setTimeout(() => setSuccessMessage(null), 4000);
        // Delay refresh from server to avoid re-adding the just-approved notification immediately.
        setTimeout(() => { fetchNotifications().catch(() => {}); }, 3000);
      } else {
        try { (window as any).Swal?.fire?.({ title: 'Error', text: backendMsg ?? `Error al aprobar (HTTP ${res.status})`, icon: 'error', confirmButtonText: 'Aceptar' }); } catch { alert(backendMsg ?? `Error al aprobar (HTTP ${res.status})`); }
      }
    } catch (err) {
      console.error('approveEdit exception', err);
      try { (window as any).Swal?.fire?.({ title: 'Error', text: 'Error al aprobar edición', icon: 'error', confirmButtonText: 'Aceptar' }); } catch { alert('Error al aprobar edición'); }
    } finally {
      setApprovingIds(prev => prev.filter(id => id !== experienceId));
    }
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 pt-20">
      <div className="bg-white rounded-lg! w-[90%] max-w-2xl p-6 max-h-[80vh] overflow-auto scrollbar-hide shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Notificaciones <br />Permiso para editar</h3>
          <button className="px-3 py-1 bg-gray-100 rounded" onClick={onClose}>Cerrar</button>
        </div>
        {successMessage ? (
          <div className="mb-4 rounded-md bg-green-100 border border-green-200 text-green-800 px-4 py-2">
            {successMessage}
          </div>
        ) : null}
        {loadingNotifs ? (
          <div className="py-8 text-center">Cargando notificaciones...</div>
        ) : notifError ? (
          <div className="text-red-500">{notifError}</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-600">No hay notificaciones.</div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n, i) => {
              const expId = n.raw?.experienceId ?? n.raw?.experience?.id ?? n.raw?.request?.experienceId ?? null;
              const isApproving = expId ? approvingIds.includes(expId) : false;
              return (
                <li key={n.id ?? i}>
                  <div className="bg-indigo-700 rounded-xl p-5 flex items-start justify-between gap-4">
                    <div className="flex-1 pr-4">
                      <div className="text-white font-semibold text-lg leading-tight truncate">{n.experienceName ?? 'Nombre de experiencia'}</div>
                      <div className="text-white/90 mt-3 truncate">{n.userName ?? 'Nombre usuario'}</div>
                      <div className="text-white/80 mt-3 truncate">{n.state ?? 'Estado'}</div>
                    </div>
                    <div className="flex items-end">
                      {expId ? (
                        <button
                          onClick={() => approveEdit(Number(expId))}
                          disabled={isApproving}
                          className={`ml-2 px-3 py-1 rounded-full text-sm text-white ${isApproving ? 'bg-gray-400' : 'bg-orange-400 hover:bg-orange-500'}`}
                        >
                          {isApproving ? 'Aprobando...' : 'Permitir'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsModal;
