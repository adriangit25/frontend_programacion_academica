import api from "./axios";

export interface Aula {
  aul_id: number;
  aul_codigo: string;
  aul_nombre: string;
  aul_capacidad: number;
  aul_tipo: string | null;
  esc_id: number;
  aul_estado: boolean;
}

export interface CreateAulaRequest {
  aul_codigo: string;
  aul_nombre: string;
  aul_capacidad: number;
  aul_tipo?: string;
  esc_id: number;
  aul_estado?: boolean;
}

export const aulasApi = {
  getAll() {
    return api.get<Aula[]>("/programacion-academica/aulas");
  },
  getByEscuela(escId: number) {
    return api.get<Aula[]>(`/programacion-academica/escuelas/${escId}/aulas`);
  },
  getOne(id: number) {
    return api.get<Aula>(`/programacion-academica/aulas/${id}`);
  },
  create(data: CreateAulaRequest) {
    return api.post("/programacion-academica/aulas", data);
  },
  update(id: number, data: CreateAulaRequest) {
    return api.put(`/programacion-academica/aulas/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/aulas/${id}`);
  },
};
