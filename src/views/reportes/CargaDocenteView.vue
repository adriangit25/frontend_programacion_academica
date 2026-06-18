<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Carga Docente</h1>
      <p class="text-gray-500 text-sm mt-1">Compare horas asignadas contra el rango permitido segun dedicacion</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex items-end gap-4">
        <div class="flex-1 max-w-xs">
          <label class="block text-sm font-medium text-gray-700 mb-1">Periodo Academico</label>
          <select v-model.number="perId" @change="loadReporte" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="0">-- Seleccione --</option>
            <option v-for="periodo in periodos" :key="periodo.per_id" :value="periodo.per_id">{{ periodo.per_nombre }}</option>
          </select>
        </div>
        <button
          @click="exportarExcel"
          :disabled="!perId || reporte.length === 0"
          class="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-600 transition disabled:opacity-50"
        >
          <i class="pi pi-file-excel"></i>
          Exportar Excel
        </button>
      </div>
    </div>

    <div v-if="!perId" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
      Seleccione un periodo academico para ver el reporte
    </div>
    <div v-else-if="loading" class="text-center py-8 text-gray-400">Cargando...</div>
    <div v-else-if="reporte.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
      No hay docentes registrados para este periodo
    </div>
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Docente</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Identificacion</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dedicacion</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Horas Min</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Horas Max</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Horas Asignadas</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in reporte" :key="item.doc_id" class="hover:bg-gray-50 transition">
              <td class="px-4 py-3 text-sm text-gray-700 font-medium">{{ item.usu_apellidos }} {{ item.usu_nombres }}</td>
              <td class="px-4 py-3 text-sm text-gray-500">{{ item.usu_identificacion }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ item.doc_dedicacion }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ item.doc_horas_minimas }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ item.doc_horas_maximas }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-gray-800">{{ item.horas_asignadas }}</td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded-full text-xs font-medium', estadoClass(item.estado)]">
                  {{ item.estado }}
                </span>
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
import { periodosApi } from '../../api/periodos.api'
import { reporteCargaApi } from '../../api/reporte-carga.api'
import type { CargaDocenteItem } from '../../api/reporte-carga.api'
import type { Periodo } from '../../api/periodos.api'
import { useRole } from '../../composables/useRole'
import api from '../../api/axios'

const { isCoordinador, usuarioId } = useRole()

const periodos = ref<Periodo[]>([])
const reporte = ref<CargaDocenteItem[]>([])
const perId = ref(0)
const loading = ref(false)
const escIdCoordinador = ref<number | null>(null)

onMounted(async () => {
  try {
    const periodosRes = await periodosApi.getAll()
    periodos.value = periodosRes.data.filter(p => p.per_estado)

    if (isCoordinador.value) {
      const escuelaRes = await api.get(`/programacion-academica/coordinador/${usuarioId.value}/escuela`)
      if (escuelaRes.data.length > 0) {
        escIdCoordinador.value = Number(escuelaRes.data[0].esc_id)
      }
    }
  } catch (error) {
    console.error('Error cargando periodos:', error)
  }
})

async function loadReporte() {
  if (!perId.value) { reporte.value = []; return }
  loading.value = true
  try {
    const response = await reporteCargaApi.getReporte(Number(perId.value), escIdCoordinador.value ?? undefined)
    reporte.value = response.data
  } catch (error) {
    console.error('Error cargando reporte:', error)
  } finally {
    loading.value = false
  }
}

function estadoClass(estado: string) {
  if (estado === 'Sobrecarga') return 'bg-red-100 text-red-700'
  if (estado === 'Subcarga') return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

async function exportarExcel() {
  if (!perId.value) return
  try {
    const params = escIdCoordinador.value ? `?escId=${escIdCoordinador.value}` : ''
    const response = await api.get(
      `/programacion-academica/exportar-carga-docente/${perId.value}${params}`,
      { responseType: 'blob' }
    )
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `carga_docente_${perId.value}.xlsx`
    link.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error exportando:', err)
  }
}
</script>