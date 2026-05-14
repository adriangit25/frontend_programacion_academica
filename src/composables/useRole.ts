import { computed } from "vue";
import { useAuthStore } from "../stores/auth.store";

export function useRole() {
  const authStore = useAuthStore();

  const isAdmin = computed(() => {
    return authStore.usuario?.rol?.rol_nombre?.trim() === "Administrador";
  });

  const isCoordinador = computed(() => {
    return (
      authStore.usuario?.rol?.rol_nombre?.trim() === "Coordinador Académico"
    );
  });

  const usuarioId = computed(() => {
    return Number(authStore.usuario?.usu_id) || 0;
  });

  return { isAdmin, isCoordinador, usuarioId };
}
