import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi } from "../api/auth.api";
import type { LoginRequest, UsuarioResponse } from "../api/auth.api";
import router from "../router";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"));
  const usuario = ref<UsuarioResponse | null>(
    JSON.parse(localStorage.getItem("usuario") || "null"),
  );

  const isAuthenticated = computed(() => !!token.value);
  const nombreCompleto = computed(() =>
    usuario.value
      ? `${usuario.value.usu_nombres} ${usuario.value.usu_apellidos}`
      : "",
  );

  async function login(data: LoginRequest) {
    const response = await authApi.login(data);
    token.value = response.data.token;
    usuario.value = response.data.usuario;
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
    router.push("/dashboard");
  }

  function logout() {
    token.value = null;
    usuario.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  }

  return { token, usuario, isAuthenticated, nombreCompleto, login, logout };
});
