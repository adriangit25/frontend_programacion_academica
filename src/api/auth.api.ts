import api from "./axios";

export interface LoginRequest {
  usu_usuario: string;
  usu_contrasenia: string;
}

export interface MenuResponse {
  men_id: number;
  men_nombre: string;
  men_icono: string;
  men_url: string;
  men_orden: number;
  men_padre_id: number | null;
}

export interface RolResponse {
  rol_id: number;
  rol_nombre: string;
}

export interface UsuarioResponse {
  usu_id: number;
  usu_identificacion: string;
  usu_nombres: string;
  usu_apellidos: string;
  usu_usuario: string;
  roles: RolResponse[];
  menus: MenuResponse[];
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: UsuarioResponse;
}

export const authApi = {
  login(data: LoginRequest) {
    return api.post<LoginResponse>("/login", data);
  },
};
