import api from "./axios";

export interface Escuela {
  esc_id: number;
  esc_codigo: string;
  esc_nombre: string;
  esc_descripcion: string | null;
  esc_estado: boolean;
}

export interface CreateEscuelaRequest {
  esc_codigo: string;
  esc_nombre: string;
  esc_descripcion?: string;
  esc_estado?: boolean;
}

export const escuelasApi = {
  getAll() {
    return api.get<Escuela[]>("/programacion-academica/escuelas");
  },
  getOne(id: number) {
    return api.get<Escuela>(`/programacion-academica/escuelas/${id}`);
  },
  create(data: CreateEscuelaRequest) {
    return api.post("/programacion-academica/escuelas", data);
  },
  update(id: number, data: CreateEscuelaRequest) {
    return api.put(`/programacion-academica/escuelas/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/escuelas/${id}`);
  },
};
