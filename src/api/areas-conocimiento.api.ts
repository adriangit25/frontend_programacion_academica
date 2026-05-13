import api from "./axios";

export interface AreaConocimiento {
  arc_id: number;
  arc_nombre: string;
  arc_descripcion: string | null;
  arc_estado: boolean;
}

export interface CreateAreaConocimientoRequest {
  arc_nombre: string;
  arc_descripcion?: string;
  arc_estado?: boolean;
}

export const areasConocimientoApi = {
  getAll() {
    return api.get<AreaConocimiento[]>(
      "/programacion-academica/areas-conocimiento",
    );
  },
  getOne(id: number) {
    return api.get<AreaConocimiento>(
      `/programacion-academica/areas-conocimiento/${id}`,
    );
  },
  create(data: CreateAreaConocimientoRequest) {
    return api.post("/programacion-academica/areas-conocimiento", data);
  },
  update(id: number, data: CreateAreaConocimientoRequest) {
    return api.put(`/programacion-academica/areas-conocimiento/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/areas-conocimiento/${id}`);
  },
};
