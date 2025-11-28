import { patchExperience } from '../../features/experience/services/patchExperience';
import { getUserId } from '../../features/experience/components/AddExperience';
import Swal from 'sweetalert2';

// Llama a este método pasando el objeto de experiencia (por ejemplo, desde el modal de edición)
export async function editarExperiencia(experience: any) {
  try {
    const token = localStorage.getItem('token');
    const userId = getUserId(token);
    if (!experience?.id || !userId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontró el ID de la experiencia o usuario.' });
      return;
    }
    // Construye el payload con el id de experiencia y usuario
    const payload = {
      ...experience,
      userId,
      experienceId: experience.id,
    };
    const response = await patchExperience(payload);
    Swal.fire({ icon: 'success', title: '¡Guardado!', text: 'Cambios guardados correctamente.' });
    return response;
  } catch (err: any) {
    Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Error al guardar.' });
  }
}
