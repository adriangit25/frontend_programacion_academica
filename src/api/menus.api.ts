import api from "./axios";

export interface Menu {
  men_id: number;
  men_nombre: string;
  men_icono: string | null;
  men_url: string | null;
  men_orden: number;
  men_padre_id: number | null;
  men_estado: boolean;
}

export interface CreateMenuRequest {
  men_nombre: string;
  men_icono?: string;
  men_url?: string;
  men_orden: number;
  men_padre_id?: number | null;
  men_estado?: boolean;
}

export const menusApi = {
  getAll() {
    return api.get<Menu[]>("/programacion-academica/menus");
  },
  getOne(id: number) {
    return api.get<Menu>(`/programacion-academica/menus/${id}`);
  },
  create(data: CreateMenuRequest) {
    return api.post("/programacion-academica/menus", data);
  },
  update(id: number, data: CreateMenuRequest) {
    return api.put(`/programacion-academica/menus/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/programacion-academica/menus/${id}`);
  },
};
