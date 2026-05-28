import api from "./axios";

export interface Horario {
  hor_id: number;
  pra_id: number;
  dia_id: number;
  blq_id: number;
  aul_id: number | null;
  hor_observaciones: string | null;
  hor_estado: boolean;
  dia_nombre?: string;
  dia_abreviatura?: string;
  dia_orden?: number;
  blq_hora_inicio?: string;
  blq_hora_fin?: string;
  blq_descripcion?: string;
  blq_orden?: number;
  aul_nombre?: string;
  aul_codigo?: string;
}

export interface HorarioCompleto {
  hor_id: number;
  dia_nombre: string;
  dia_orden: number;
  dia_abreviatura: string;
  blq_hora_inicio: string;
  blq_hora_fin: string;
  blq_orden: number;
  mat_codigo: string;
  mat_nombre: string;
  pra_nivel: number;
  pra_nrc: string | null;
  par_nombre: string;
  docente_nombre: string | null;
  aul_nombre: string | null;
  aul_codigo: string | null;
  pra_modalidad: string;
}

export interface HorarioDocente {
  hor_id: number;
  dia_nombre: string;
  dia_orden: number;
  blq_hora_inicio: string;
  blq_hora_fin: string;
  mat_codigo: string;
  mat_nombre: string;
  pra_nivel: number;
  pra_nrc: string | null;
  par_nombre: string;
  car_nombre: string;
  aul_nombre: string | null;
}

export interface Dia {
  dia_id: number;
  dia_nombre: string;
  dia_abreviatura: string;
  dia_orden: number;
}

export interface BloqueHorario {
  blq_id: number;
  blq_hora_inicio: string;
  blq_hora_fin: string;
  blq_descripcion: string | null;
  blq_orden: number;
}

export interface CreateHorarioRequest {
  pra_id: number;
  dia_id: number;
  blq_id_inicio: number;
  blq_id_fin: number;
  aul_id?: number;
  hor_observaciones?: string;
}

export const horariosApi = {
  create(data: CreateHorarioRequest) {
    return api.post("/programacion-academica/horarios", data);
  },
  getByProgramacion(praId: number) {
    return api.get<Horario[]>(
      `/programacion-academica/horarios/programacion/${praId}`,
    );
  },
  getHorarioCompleto(perId: number, carId: number) {
    return api.get<HorarioCompleto[]>(
      `/programacion-academica/horarios/periodo/${perId}/carrera/${carId}`,
    );
  },
  getHorarioDocente(docId: number, perId: number) {
    return api.get<HorarioDocente[]>(
      `/programacion-academica/horarios/docente/${docId}/periodo/${perId}`,
    );
  },
  update(id: number, data: CreateHorarioRequest) {
    return api.put(`/programacion-academica/horarios/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/horarios/${id}`);
  },
  getDias() {
    return api.get<Dia[]>("/programacion-academica/dias");
  },
  getBloques() {
    return api.get<BloqueHorario[]>("/programacion-academica/bloques-horarios");
  },
};
