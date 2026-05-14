import api from "./axios";

export interface Docente {
  doc_id: number;
  usu_id: number;
  usu_nombres?: string;
  usu_apellidos?: string;
  usu_identificacion?: string;
  doc_titulo_grado: string | null;
  doc_titulo_posgrado: string | null;
  doc_tipo_contrato: string | null;
  doc_dedicacion: string;
  doc_horas_minimas: number;
  doc_horas_maximas: number;
  doc_observaciones: string | null;
  esc_id: number;
  doc_estado: boolean;
}

export interface CreateDocenteRequest {
  usu_id: number;
  doc_titulo_grado?: string;
  doc_titulo_posgrado?: string;
  doc_tipo_contrato?: string;
  doc_dedicacion: string;
  doc_horas_minimas: number;
  doc_horas_maximas: number;
  doc_observaciones?: string;
  esc_id: number;
  doc_estado?: boolean;
}

export const docentesApi = {
  getAll() {
    return api.get<Docente[]>("/programacion-academica/docentes");
  },
  getByEscuela(escId: number) {
    return api.get<Docente[]>(
      `/programacion-academica/escuelas/${escId}/docentes`,
    );
  },
  getOne(id: number) {
    return api.get<Docente>(`/programacion-academica/docentes/${id}`);
  },
  create(data: CreateDocenteRequest) {
    return api.post("/programacion-academica/docentes", data);
  },
  update(id: number, data: CreateDocenteRequest) {
    return api.put(`/programacion-academica/docentes/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/docentes/${id}`);
  },
};
