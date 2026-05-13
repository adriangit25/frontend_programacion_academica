import api from "./axios";

export interface Carrera {
  car_id: number;
  car_codigo: string;
  car_nombre: string;
  car_modalidad: string;
  car_descripcion: string | null;
  esc_id: number;
  esc_nombre?: string;
  car_estado: boolean;
}

export interface CreateCarreraRequest {
  car_codigo: string;
  car_nombre: string;
  car_modalidad?: string;
  car_descripcion?: string;
  esc_id: number;
  car_estado?: boolean;
}

export const carrerasApi = {
  getAll() {
    return api.get<Carrera[]>("/programacion-academica/carreras");
  },
  getOne(id: number) {
    return api.get<Carrera>(`/programacion-academica/carreras/${id}`);
  },
  create(data: CreateCarreraRequest) {
    return api.post("/programacion-academica/carreras", data);
  },
  update(id: number, data: CreateCarreraRequest) {
    return api.put(`/programacion-academica/carreras/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/carreras/${id}`);
  },
};
