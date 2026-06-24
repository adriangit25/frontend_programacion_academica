<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Reporte de Bibliografía</h1>
      <p class="text-gray-500 text-sm mt-1">Fuentes de información registradas por los docentes</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex items-end gap-4">
        <div class="flex-1 max-w-xs">
          <label class="block text-sm font-medium text-gray-700 mb-1">Periodo Academico</label>
          <select v-model.number="perId" @change="loadReporte" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
            <option value="0">-- Seleccione --</option>
            <option v-for="periodo in periodos" :key="periodo.per_id" :value="periodo.per_id">{{ periodo.per_nombre }}</option>
          </select>
        </div>
        <button
          @click="exportarExcel"
          :disabled="!perId || reporte.length === 0"
          class="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-600 transition disabled:opacity-50"
        >
          <i class="pi pi-file-excel"></i>Exportar Excel
        </button>
      </div>
    </div>

    <div v-if="!perId" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
      Seleccione un periodo para ver el reporte
    </div>
    <div v-else-if="loading" class="text-center py-8 text-gray-400">Cargando...</div>
    <div v-else-if="reporte.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
      No hay bibliografías registradas para este periodo
    </div>
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-blue-900 text-white">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Nivel</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Asignatura</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Docente</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Título</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Autor</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Editorial</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Año</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase">Recurso</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in reporte" :key="item.bib_id" class="hover:bg-gray-50 transition">
              <td class="px-4 py-3">
                <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">{{ item.pra_nivel }}</span>
              </td>
              <td class="px-4 py-3">
                <p class="font-medium text-gray-800">{{ item.mat_nombre }}</p>
                <p class="text-xs text-gray-500">{{ item.car_nombre }} · Par. {{ item.par_nombre }}</p>
              </td>
              <td class="px-4 py-3 text-gray-700 text-xs">{{ item.docente_nombre || '-' }}</td>
              <td class="px-4 py-3 font-medium text-gray-800 max-w-xs">{{ item.bib_titulo }}</td>
              <td class="px-4 py-3 text-gray-600 text-xs">{{ item.bib_autor || '-' }}</td>
              <td class="px-4 py-3 text-gray-600 text-xs">{{ item.bib_editorial || '-' }}</td>
              <td class="px-4 py-3 text-gray-600 text-xs">{{ item.bib_anio || '-' }}</td>
              <td class="px-4 py-3">
                <template v-if="item.bib_tipo === 'archivo'">
                  <a :href="archivoUrl(item.bib_id)" target="_blank" class="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-xs whitespace-nowrap">
                    <i class="pi pi-file-pdf text-xs"></i>Ver PDF
                  </a>
                </template>
                <template v-else-if="item.bib_tipo === 'enlace' && item.bib_enlace">
                  <a :href="item.bib_enlace" target="_blank" class="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-xs whitespace-nowrap">
                    <i class="pi pi-link text-xs"></i>Ver enlace
                  </a>
                </template>
                <span v-else class="text-gray-400 text-xs">Sin recurso</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as ExcelJS from 'exceljs'
import { bibliografiaApi } from '../../api/bibliografia.api'
import type { BibliografiaItem } from '../../api/bibliografia.api'
import { periodosApi } from '../../api/periodos.api'
import type { Periodo } from '../../api/periodos.api'
import { useRole } from '../../composables/useRole'
import api from '../../api/axios'

const { isCoordinador, usuarioId } = useRole()

const periodos = ref<Periodo[]>([])
const reporte = ref<BibliografiaItem[]>([])
const perId = ref(0)
const loading = ref(false)
const escIdCoordinador = ref<number | null>(null)

onMounted(async () => {
  try {
    const periodosRes = await periodosApi.getAll()
    periodos.value = periodosRes.data.filter((p: any) => p.per_estado)
    if (isCoordinador.value) {
      const escuelaRes = await api.get(
        `/programacion-academica/coordinador/${usuarioId.value}/escuela`,
      )
      if (escuelaRes.data.length > 0) {
        escIdCoordinador.value = Number(escuelaRes.data[0].esc_id)
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
})

async function loadReporte() {
  if (!perId.value) { reporte.value = []; return }
  loading.value = true
  try {
    const res = await bibliografiaApi.getReporte(
      perId.value,
      escIdCoordinador.value ?? undefined,
    )
    reporte.value = res.data
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

function archivoUrl(bibId: number): string {
  return bibliografiaApi.getArchivoUrl(bibId)
}

async function exportarExcel() {
  if (!perId.value || reporte.value.length === 0) return

  const workbook = new ExcelJS.Workbook()
  const ws = workbook.addWorksheet('Bibliografia')

  ws.columns = [
    { header: 'NIVEL', key: 'nivel', width: 8 },
    { header: 'CARRERA', key: 'carrera', width: 30 },
    { header: 'PARALELO', key: 'paralelo', width: 10 },
    { header: 'ASIGNATURA', key: 'asignatura', width: 30 },
    { header: 'DOCENTE', key: 'docente', width: 30 },
    { header: 'TÍTULO', key: 'titulo', width: 40 },
    { header: 'AUTOR', key: 'autor', width: 25 },
    { header: 'EDITORIAL', key: 'editorial', width: 20 },
    { header: 'AÑO', key: 'anio', width: 8 },
    { header: 'RECURSO', key: 'recurso', width: 50 },
  ]

  const headerRow = ws.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A5C' } }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }

  for (const item of reporte.value) {
    const recurso = item.bib_tipo === 'archivo'
      ? bibliografiaApi.getArchivoUrl(item.bib_id)
      : (item.bib_enlace ?? 'Sin recurso')

    ws.addRow({
      nivel: item.pra_nivel,
      carrera: item.car_nombre,
      paralelo: item.par_nombre,
      asignatura: item.mat_nombre,
      docente: item.docente_nombre ?? 'Sin asignar',
      titulo: item.bib_titulo,
      autor: item.bib_autor ?? '',
      editorial: item.bib_editorial ?? '',
      anio: item.bib_anio ?? '',
      recurso,
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob(
    [buffer as ArrayBuffer],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  )
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `bibliografia_${perId.value}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}
</script>