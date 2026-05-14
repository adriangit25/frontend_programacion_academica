import api from "./axios";

export interface Materia {
  mat_id: number;
  mat_codigo: string;
  mat_nombre: string;
  mat_descripcion: string | null;
  mat_nivel: number;
  mat_horas_docencia: number;
  mat_horas_practicas: number;
  mat_horas_autonomas: number;
  mat_total_horas: number;
  mat_estudiantes_estimado: number;
  pln_id: number;
  arc_id: number;
  arc_nombre?: string;
  pln_nombre?: string;
  car_nombre?: string;
  mat_estado: boolean;
}

export interface CreateMateriaRequest {
  mat_codigo: string;
  mat_nombre: string;
  mat_descripcion?: string;
  mat_nivel: number;
  mat_horas_docencia: number;
  mat_horas_practicas?: number;
  mat_horas_autonomas?: number;
  mat_total_horas: number;
  mat_estudiantes_estimado?: number;
  pln_id: number;
  arc_id: number;
  mat_estado?: boolean;
}

export const materiasApi = {
  getAll() {
    return api.get<Materia[]>("/programacion-academica/materias");
  },
  getByPlan(plnId: number) {
    return api.get<Materia[]>(
      `/programacion-academica/planes-estudio/${plnId}/materias`,
    );
  },
  getOne(id: number) {
    return api.get<Materia>(`/programacion-academica/materias/${id}`);
  },
  create(data: CreateMateriaRequest) {
    return api.post("/programacion-academica/materias", data);
  },
  update(id: number, data: CreateMateriaRequest) {
    return api.put(`/programacion-academica/materias/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/materias/${id}`);
  },
};
