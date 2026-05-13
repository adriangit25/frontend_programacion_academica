import api from "./axios";

export interface Rol {
  rol_id: number;
  rol_nombre: string;
  rol_descripcion: string | null;
  rol_estado: boolean;
}

export interface CreateRolRequest {
  rol_nombre: string;
  rol_descripcion?: string;
  rol_estado?: boolean;
}

export const rolesApi = {
  getAll() {
    return api.get<Rol[]>("/programacion-academica/roles");
  },
  getOne(id: number) {
    return api.get<Rol>(`/programacion-academica/roles/${id}`);
  },
  create(data: CreateRolRequest) {
    return api.post("/programacion-academica/roles", data);
  },
  update(id: number, data: CreateRolRequest) {
    return api.put(`/programacion-academica/roles/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/roles/${id}`);
  },
};
