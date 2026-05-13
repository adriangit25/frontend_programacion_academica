import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "../api/auth.api";
import type {
  LoginRequest,
  SelectRolRequest,
  ValidateResponse,
  RolResponse,
} from "../api/auth.api";
import router from "../router";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"));
  const usuario = ref<ValidateResponse["usuario"] | null>(
    JSON.parse(localStorage.getItem("usuario") || "null"),
  );

  // Estado para selección de rol
  const pendingUserId = ref<number | null>(null);
  const pendingRoles = ref<RolResponse[]>([]);
  const requiresRoleSelection = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const nombreCompleto = computed(() =>
    usuario.value
      ? `${usuario.value.usu_nombres} ${usuario.value.usu_apellidos}`
      : "",
  );

  async function validate(data: LoginRequest) {
    const response = await authApi.validate(data);
    const result = response.data;

    if (result.requires_role_selection) {
      // Tiene varios roles, mostrar selector
      pendingUserId.value = result.usuario?.usu_id || 0;
      pendingRoles.value = result.roles || [];
      requiresRoleSelection.value = true;
      return result;
    } else {
      // Un solo rol, login directo
      completeLogin(result);
      return result;
    }
  }

  async function selectRol(data: SelectRolRequest) {
    const response = await authApi.selectRol(data);
    const result = response.data;
    completeLogin(result);
    return result;
  }

  function completeLogin(result: ValidateResponse) {
    if (result.token && result.usuario) {
      token.value = result.token;
      usuario.value = result.usuario;
      localStorage.setItem("token", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.usuario));
      resetPending();
      router.push("/dashboard");
    }
  }

  function resetPending() {
    pendingUserId.value = null;
    pendingRoles.value = [];
    requiresRoleSelection.value = false;
  }

  function logout() {
    token.value = null;
    usuario.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    resetPending();
    router.push("/login");
  }

  return {
    token,
    usuario,
    isAuthenticated,
    nombreCompleto,
    pendingUserId,
    pendingRoles,
    requiresRoleSelection,
    validate,
    selectRol,
    resetPending,
    logout,
  };
});
