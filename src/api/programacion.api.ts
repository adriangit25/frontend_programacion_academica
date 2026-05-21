import api from "./axios";

export interface Programacion {
  pra_id: number;
  per_id: number;
  mat_id: number;
  car_id: number;
  pln_id: number;
  par_id: number;
  doc_id: number | null;
  aul_id: number | null;
  pra_nivel: number;
  pra_nrc: string | null;
  pra_modalidad: string;
  pra_estudiantes_estimado: number;
  pra_estudiantes_matriculados: number;
  pra_laboratorio: string | null;
  pra_observaciones: string | null;
  pra_estado: boolean;
  mat_codigo: string;
  mat_nombre: string;
  mat_horas_docencia: number;
  mat_horas_practicas: number;
  mat_horas_autonomas: number;
  mat_total_horas: number;
  par_nombre?: string;
  docente_nombre?: string;
  aul_nombre?: string;
  per_nombre?: string;
  pln_nombre?: string;
  car_nombre?: string;
}

export interface AbrirNivelRequest {
  per_id: number;
  car_id: number;
  pln_id: number;
  nivel: number;
  par_id: number;
}

export interface AbrirMateriasRequest {
  per_id: number;
  car_id: number;
  pln_id: number;
  mat_ids: number[];
  par_id: number;
}

export interface UpdateProgramacionRequest {
  per_id: number;
  mat_id: number;
  car_id: number;
  pln_id: number;
  par_id: number;
  pra_nivel: number;
  doc_id?: number | null;
  aul_id?: number | null;
  pra_nrc?: string;
  pra_modalidad?: string;
  pra_estudiantes_estimado?: number;
  pra_estudiantes_matriculados?: number;
  pra_laboratorio?: string;
  pra_observaciones?: string;
}

export const programacionApi = {
  abrirNivel(data: AbrirNivelRequest) {
    return api.post("/programacion-academica/programacion/abrir-nivel", data);
  },
  abrirMaterias(data: AbrirMateriasRequest) {
    return api.post(
      "/programacion-academica/programacion/abrir-materias",
      data,
    );
  },
  getByPeriodoCarrera(perId: number, carId: number) {
    return api.get<Programacion[]>(
      `/programacion-academica/programacion/periodo/${perId}/carrera/${carId}`,
    );
  },
  getByNivel(perId: number, carId: number, nivel: number) {
    return api.get<Programacion[]>(
      `/programacion-academica/programacion/periodo/${perId}/carrera/${carId}/nivel/${nivel}`,
    );
  },
  update(id: number, data: UpdateProgramacionRequest) {
    return api.put(`/programacion-academica/programacion/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/programacion/${id}`);
  },
};
