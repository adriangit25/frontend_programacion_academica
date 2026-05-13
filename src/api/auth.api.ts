import api from "./axios";

export interface LoginRequest {
  usu_usuario: string;
  usu_contrasenia: string;
}

export interface SelectRolRequest {
  usu_id: number;
  rol_id: number;
}

export interface RolResponse {
  rol_id: number;
  rol_nombre: string;
  rol_descripcion?: string;
}

export interface MenuResponse {
  men_id: number;
  men_nombre: string;
  men_icono: string;
  men_url: string;
  men_orden: number;
  men_padre_id: number | null;
}

export interface ValidateResponse {
  message: string;
  requires_role_selection: boolean;
  token?: string;
  usuario?: {
    usu_id: number;
    usu_identificacion: string;
    usu_nombres: string;
    usu_apellidos: string;
    usu_usuario: string;
    rol: RolResponse;
    menus: MenuResponse[];
  };
  roles?: RolResponse[];
}

export const authApi = {
  validate(data: LoginRequest) {
    return api.post<ValidateResponse>("/login/validate", data);
  },
  selectRol(data: SelectRolRequest) {
    return api.post<ValidateResponse>("/login/select-rol", data);
  },
};
