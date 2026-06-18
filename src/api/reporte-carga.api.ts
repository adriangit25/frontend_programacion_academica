import api from "./axios";

export interface CargaDocenteItem {
  doc_id: number;
  usu_nombres: string;
  usu_apellidos: string;
  usu_identificacion: string;
  doc_dedicacion: string;
  doc_horas_minimas: number;
  doc_horas_maximas: number;
  horas_asignadas: number;
  estado: string;
}

export const reporteCargaApi = {
  getReporte(perId: number, escId?: number) {
    const params = escId ? `?escId=${escId}` : "";
    return api.get<CargaDocenteItem[]>(
      `/programacion-academica/reporte-carga-docente/periodo/${perId}${params}`,
    );
  },
};
