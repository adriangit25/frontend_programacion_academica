import api from "./axios";

export interface PlanEstudio {
  pln_id: number;
  pln_codigo: string;
  pln_nombre: string;
  pln_anio: number;
  pln_descripcion: string | null;
  car_id: number;
  car_nombre?: string;
  esc_nombre?: string;
  pln_estado: boolean;
}

export interface CreatePlanEstudioRequest {
  pln_codigo: string;
  pln_nombre: string;
  pln_anio: number;
  pln_descripcion?: string;
  car_id: number;
  pln_estado?: boolean;
}

export const planesEstudioApi = {
  getAll() {
    return api.get<PlanEstudio[]>("/programacion-academica/planes-estudio");
  },
  getByCarrera(carId: number) {
    return api.get<PlanEstudio[]>(
      `/programacion-academica/carreras/${carId}/planes-estudio`,
    );
  },
  getOne(id: number) {
    return api.get<PlanEstudio>(`/programacion-academica/planes-estudio/${id}`);
  },
  create(data: CreatePlanEstudioRequest) {
    return api.post("/programacion-academica/planes-estudio", data);
  },
  update(id: number, data: CreatePlanEstudioRequest) {
    return api.put(`/programacion-academica/planes-estudio/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/planes-estudio/${id}`);
  },
};
