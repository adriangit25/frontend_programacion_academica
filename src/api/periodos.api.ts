import api from "./axios";

export interface Periodo {
  per_id: number;
  per_codigo: string;
  per_nombre: string;
  per_fecha_inicio: string;
  per_fecha_fin: string;
  per_semanas: number;
  per_estado: boolean;
}

export interface CreatePeriodoRequest {
  per_codigo: string;
  per_nombre: string;
  per_fecha_inicio: string;
  per_fecha_fin: string;
  per_semanas?: number;
  per_estado?: boolean;
}

export const periodosApi = {
  getAll() {
    return api.get<Periodo[]>("/programacion-academica/periodos");
  },
  getOne(id: number) {
    return api.get<Periodo>(`/programacion-academica/periodos/${id}`);
  },
  create(data: CreatePeriodoRequest) {
    return api.post("/programacion-academica/periodos", data);
  },
  update(id: number, data: CreatePeriodoRequest) {
    return api.put(`/programacion-academica/periodos/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/periodos/${id}`);
  },
};
