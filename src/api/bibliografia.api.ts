import api from "./axios";

export interface BibliografiaItem {
  bib_id: number;
  pra_id: number;
  bib_titulo: string;
  bib_autor: string | null;
  bib_editorial: string | null;
  bib_anio: number | null;
  bib_tipo: "enlace" | "archivo";
  bib_enlace: string | null;
  bib_archivo_nombre: string | null;
  mat_nombre: string;
  mat_codigo: string;
  pra_nivel: number;
  par_nombre: string;
  car_nombre: string;
  docente_nombre?: string;
}

export const bibliografiaApi = {
  getMaterias: (docId: number, perId: number) =>
    api.get<any[]>(
      `/programacion-academica/bibliografia/materias/${docId}/periodo/${perId}`,
    ),

  getByDocente: (docId: number, perId: number) =>
    api.get<BibliografiaItem[]>(
      `/programacion-academica/bibliografia/docente/${docId}/periodo/${perId}`,
    ),

  create: (data: Partial<BibliografiaItem>) =>
    api.post<{ message: string; bibliografia: BibliografiaItem }>(
      "/programacion-academica/bibliografia",
      data,
    ),

  update: (id: number, data: Partial<BibliografiaItem>) =>
    api.put<{ message: string; bibliografia: BibliografiaItem }>(
      `/programacion-academica/bibliografia/${id}`,
      data,
    ),

  delete: (id: number) =>
    api.delete(`/programacion-academica/bibliografia/${id}`),

  uploadArchivo: (bibId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<{ message: string; nombre: string }>(
      `/programacion-academica/bibliografia/upload/${bibId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  getArchivoUrl: (bibId: number) =>
    `${api.defaults.baseURL}/programacion-academica/bibliografia/archivo/${bibId}`,

  getReporte: (perId: number, escId?: number) => {
    const params = escId ? `?escId=${escId}` : "";
    return api.get<BibliografiaItem[]>(
      `/programacion-academica/reporte-bibliografia/periodo/${perId}${params}`,
    );
  },
};
