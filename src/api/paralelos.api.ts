import api from "./axios";

export interface Paralelo {
  par_id: number;
  par_nombre: string;
  par_descripcion: string | null;
  par_estado: boolean;
}

export interface CreateParaleloRequest {
  par_nombre: string;
  par_descripcion?: string;
  par_estado?: boolean;
}

export const paralelosApi = {
  getAll() {
    return api.get<Paralelo[]>("/programacion-academica/paralelos");
  },
  create(data: CreateParaleloRequest) {
    return api.post("/programacion-academica/paralelos", data);
  },
};
