import React, { useEffect, useState, useRef } from 'react';
import { startNotificationsHub, stopNotificationsHub } from '../Service/notificationsHub';

interface Props {
  open: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

type NormalizedNotification = {
  id: string | null;
  experienceId: number | null;
  experienceName: string;
  userName: string;
  state: string;
  createdAt: string | null;
  raw: any;
  type?: string | null;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const coerced = Number(value);
    return Number.isFinite(coerced) && coerced > 0 ? coerced : null;
  }
  return null;
};

const takeFirstString = (...values: unknown[]): string | '' => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return '';
};

const normalizeNotification = (raw: any, source?: string): NormalizedNotification | null => {
  if (!raw || typeof raw !== 'object') return null;

  const allIdCandidates: unknown[] = [
    raw.id,
    raw.Id,
    raw.notificationId,
    raw.NotificationId,
    raw.requestId,
    raw.RequestId,
    raw.experienceNotificationId,
    raw.ExperienceNotificationId,
    raw.experienceId,
    raw.ExperienceId,
    raw.request?.experienceId,
    raw.request?.ExperienceId,
    raw.experience?.id,
    raw.experience?.Id,
  ];

  let experienceId: number | null = null;
  for (const candidate of allIdCandidates) {
    const numeric = toNumberOrNull(candidate);
    if (numeric) {
      experienceId = numeric;
      break;
    }
  }

  let id: string | null = null;
  for (const candidate of allIdCandidates) {
    if (candidate === null || candidate === undefined) continue;
    if (experienceId && toNumberOrNull(candidate) === experienceId) {
      id = String(experienceId);
      break;
    }
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      id = candidate;
      break;
    }
  }

  const experienceName = takeFirstString(
    raw.experienceName,
    raw.nameExperiences,
    raw.NameExperiences,
    raw.title,
    raw.experience?.nameExperiences,
    raw.experience?.title,
    raw.experience?.name,
    raw.request?.experienceName,
    raw.request?.nameExperiences,
    raw.rawExperienceName,
    `Solicitud edición #${raw.id ?? ''}`,
  );

  const userName = takeFirstString(
    raw.userName,
    raw.user?.name,
    raw.requestUser,
    raw.requestedBy,
    raw.username,
    raw.solicitante,
    raw.request?.userName,
    raw.request?.requestedBy,
    raw.createdBy,
    raw.createdUser,
  );

  const state = takeFirstString(
    raw.status,
    raw.state,
    raw.requestState,
    raw.estado,
    raw.stateName,
    raw.state?.name,
    raw.statusName,
    raw.notificationState,
    raw.type,
    'Pendiente',
  );

  const createdAt = takeFirstString(
    raw.createdAt,
    raw.createdDate,
    raw.date,
    raw.requestedAt,
    raw.created,
    raw.timestamp,
    raw.notificationDate,
  ) || null;

  return {
    id,
    experienceId,
    experienceName,
    userName,
    state,
    createdAt,
    raw,
    type: source || (typeof raw.type === 'string' ? raw.type : null),
  };
};

const getNotificationKey = (item: NormalizedNotification): string => {
  if (item.id) return item.id;
  if (item.experienceId) {
    return `${item.experienceId}-${item.state}-${item.createdAt ?? ''}`;
  }
  return JSON.stringify({
    experienceName: item.experienceName,
    userName: item.userName,
    state: item.state,
    createdAt: item.createdAt,
  });
};

const sortNotifications = (items: NormalizedNotification[]): NormalizedNotification[] => {
  const parseTime = (value: string | null): number => {
    if (!value) return Number.MIN_SAFE_INTEGER;
    const parsed = new Date(value);
    const time = parsed.getTime();
    return Number.isFinite(time) ? time : Number.MIN_SAFE_INTEGER;
  };
  return [...items].sort((a, b) => parseTime(b.createdAt) - parseTime(a.createdAt));
};

const dedupeNotifications = (items: NormalizedNotification[]): NormalizedNotification[] => {
  const map = new Map<string, NormalizedNotification>();
  items.forEach((item) => {
    const key = getNotificationKey(item);
    if (!map.has(key)) {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
};

const NotificationsModal: React.FC<Props> = ({ open, onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState<NormalizedNotification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState<boolean>(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [approvingIds, setApprovingIds] = useState<number[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

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
      if (onCountChange) onCountChange(filtered.length);
    } catch (err) {
      console.error('fetchNotifications exception', err);
      setNotifError('Error al obtener notificaciones');
      setNotifications([]);
      if (onCountChange) onCountChange(0);
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
          return String(nExpId) !== String(experienceId) && String(normalizedId) !== String(experienceId);
        }));
        // Remember this id locally so a subsequent fetch won't re-add it to the UI.
        setRemovedIds(prev => prev.includes(String(experienceId)) ? prev : [...prev, String(experienceId)]);
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


  // SignalR: mantener referencia para evitar duplicados
  const signalRStarted = useRef(false);
  const removedIdsRef = useRef<string[]>([]);

  useEffect(() => {
    removedIdsRef.current = removedIds;
  }, [removedIds]);

  const getPersistedApprovedIds = (): string[] => {
    try {
      const raw = localStorage.getItem('approvedExperienceIds');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((value) => String(value));
    } catch (err) {
      console.debug('approvedExperienceIds parse error', err);
    }
    return [];
  };

  const shouldFilterOut = (notification: NormalizedNotification): boolean => {
    if (!notification) return true;
    if (notification.raw?.approved === true || notification.raw?.Approved === true) return true;
    const removalSet = new Set<string>([...removedIdsRef.current, ...getPersistedApprovedIds()]);
    const candidates = [
      notification.id ? String(notification.id) : null,
      notification.experienceId ? String(notification.experienceId) : null,
    ].filter(Boolean) as string[];
    return candidates.some((candidate) => removalSet.has(candidate));
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
      if (!signalRStarted.current) {
        startNotificationsHub((notification, eventName) => {
          // Normalizar la notificación recibida y agregarla a la lista solo si es relevante
          let normalized: NormalizedNotification | null = null;
          if (eventName === 'ReceiveNotification' || eventName === 'ReceiveExperienceCreated' || eventName === 'ExperienceCreated') {
            // Notificación de experiencia creada
            normalized = {
              id: notification.id ?? notification.notificationId ?? null,
              experienceId: notification.experienceId ?? notification.ExperienceId ?? null,
              experienceName: notification.ExperienceName ?? notification.experienceName ?? notification.NameExperiences ?? notification.nameExperiences ?? notification.title ?? '',
              userName: notification.CreatedBy ?? notification.createdBy ?? notification.userName ?? notification.user?.name ?? '',
              state: 'Creada',
              createdAt: notification.Date ?? notification.createdAt ?? new Date().toISOString(),
              raw: notification,
              type: eventName,
            };
          } else if (eventName === 'ReceiveExperienceNotification') {
            normalized = normalizeNotification(notification, eventName);
          }
          if (normalized) {
            setNotifications((prev) => [normalized!, ...prev]);
            if (onCountChange) onCountChange(notifications.length + 1);
          }
        });
        signalRStarted.current = true;
      }
    } else {
      if (onCountChange) onCountChange(notifications.length);
      stopNotificationsHub();
      signalRStarted.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 pt-20">
      <div className="w-[70%] max-w-xl max-h-[95vh] overflow-auto scrollbar-hide shadow-lg"
        style={{ background: '#e9ecef', borderRadius: '28px', border: '2px solid #4343CD', minHeight: '700px', height: 'auto' }}>
        {/* Header con título y subrayado naranja y línea azul a la derecha */}
        <div className="relative flex items-center justify-between mb-4 px-6 pt-6 pb-2">
          <div className="flex flex-col flex-1">
            <h3 className="text-2xl font-extrabold text-[#43436D] leading-tight" style={{ lineHeight: '1.1' }}>
              Notificaciones <br />Permiso para editar
            </h3>
            {/* Subrayado naranja */}
            <span className="block mt-1" style={{ width: 220, height: 4, background: '#FFA940' }} />
          </div>
          {/* Línea azul a la derecha del título */}
          <div className="absolute right-0 top-8 h-1 w-32 bg-[#4343CD]" style={{ borderRadius: 2 }} />
          <button className="ml-4 px-3 py-1 bg-gray-100 rounded text-[#43436D] font-semibold border border-[#4343CD]" onClick={onClose}>Cerrar</button>
        </div>
        <div className="px-6 pb-6">
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
    </div>
  );
};

export default NotificationsModal;