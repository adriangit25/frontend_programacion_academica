import api from "./axios";

export const dashboardApi = {
  getAdmin() {
    return api.get("/programacion-academica/dashboard/admin");
  },
  getCoordinador(usuId: number) {
    return api.get(`/programacion-academica/dashboard/coordinador/${usuId}`);
  },
  getDocente(usuId: number) {
    return api.get(`/programacion-academica/dashboard/docente/${usuId}`);
  },
};
