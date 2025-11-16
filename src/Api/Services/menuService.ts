
// Servicio para obtener el menú dinámico usando fetch
import type { MenuItem } from '../../shared/types/menu';

export async function fetchMenu(userId: number, token: string): Promise<MenuItem[]> {
  const response = await fetch(`/api/User/${userId}/menu`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include', // si usas cookies
  });
  if (!response.ok) {
    throw new Error('Error al obtener el menú');
  }
  return response.json();
}

// No runtime exports for TypeScript types
