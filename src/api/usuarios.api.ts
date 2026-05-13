import api from "./axios";

export interface Usuario {
  usu_id: number;
  usu_identificacion: string;
  usu_nombres: string;
  usu_apellidos: string;
  usu_usuario: string;
  usu_estado: boolean;
}

export interface CreateUsuarioRequest {
  usu_identificacion: string;
  usu_nombres: string;
  usu_apellidos: string;
  usu_usuario: string;
  usu_contrasenia: string;
  usu_estado?: boolean;
}

export const usuariosApi = {
  getAll() {
    return api.get<Usuario[]>("/programacion-academica/usuarios");
  },
  getOne(id: number) {
    return api.get<Usuario>(`/programacion-academica/usuarios/${id}`);
  },
  create(data: CreateUsuarioRequest) {
    return api.post("/programacion-academica/usuarios", data);
  },
  update(id: number, data: CreateUsuarioRequest) {
    return api.put(`/programacion-academica/usuarios/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/usuarios/${id}`);
  },
};
