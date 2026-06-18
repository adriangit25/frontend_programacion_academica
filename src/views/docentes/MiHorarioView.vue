<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Mi Horario</h1>
      <p class="text-gray-500 text-sm mt-1">Consulte su programacion semanal asignada</p>
    </div>

    <div v-if="!docente" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
      No tiene un perfil de docente asociado a su usuario
    </div>
    <template v-else>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-end gap-4">
          <div class="flex-1 max-w-xs">
            <label class="block text-sm font-medium text-gray-700 mb-1">Periodo Academico</label>
            <select v-model.number="perId" @change="loadHorario" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Seleccione --</option>
              <option v-for="periodo in periodos" :key="periodo.per_id" :value="periodo.per_id">{{ periodo.per_nombre }}</option>
            </select>
          </div>
          <div class="flex gap-6 pb-2">
            <div>
              <p class="text-xs text-gray-500">Horas Asignadas</p>
              <p class="text-lg font-bold text-blue-900">{{ totalHoras }} / {{ docente.doc_horas_maximas }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Dedicacion</p>
              <p class="text-sm font-medium text-gray-700">{{ docente.doc_dedicacion }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!perId" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        Seleccione un periodo academico para ver su horario
      </div>
      <div v-else-if="loading" class="text-center py-8 text-gray-400">Cargando...</div>
      <div v-else-if="horario.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        No tiene horarios asignados en este periodo
      </div>
      <template v-else>
        <!-- Una grilla independiente por cada nivel que dicta el docente -->
        <div v-for="nivel in nivelesDocente" :key="nivel" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div class="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center gap-3">
            <span class="bg-blue-900 text-white px-2 py-0.5 rounded text-xs font-medium">Nivel {{ nivel }}</span>
            <span class="text-sm text-gray-500">{{ materiasDeNivel(nivel).length }} materia(s) en este nivel</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse" style="table-layout: fixed;">
              <thead>
                <tr class="bg-blue-900 text-white">
                  <th class="px-3 py-3 text-xs font-semibold text-left border-r border-blue-800" style="width: 70px;">HORA</th>
                  <th v-for="dia in dias" :key="dia.dia_id" class="px-2 py-3 text-xs font-semibold text-center border-r border-blue-800" style="width: 150px;">{{ dia.dia_nombre.toUpperCase() }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="hora in horasVisiblesNivel(nivel)" :key="hora" style="height: 48px;">
                  <td class="px-3 text-xs font-medium text-gray-600 border-r border-b border-gray-200 bg-gray-50 whitespace-nowrap align-top pt-1" style="width: 70px;">{{ formatHora(hora) }}</td>
                  <td v-for="dia in dias" :key="dia.dia_id" class="border-r border-b border-gray-100" style="position: relative; padding: 0; height: 48px;">
                    <template v-for="item in getCeldaPorNivel(nivel, dia.dia_orden, hora)" :key="item.hor_id">
                      <div class="rounded text-left" :style="{ backgroundColor: getColorMateria(item.mat_nombre) + '30', borderLeft: '4px solid ' + getColorMateria(item.mat_nombre), position: 'absolute', top: '1px', left: '1px', right: '1px', height: (getRowspan(item.blq_hora_inicio, item.blq_hora_fin) * 48 - 2) + 'px', overflow: 'hidden', zIndex: 10, padding: '4px 6px' }">
                        <p class="text-xs font-semibold leading-tight" :style="{ color: getColorMateria(item.mat_nombre) }">{{ item.mat_nombre }}</p>
                        <p class="text-xs text-gray-600 leading-tight truncate">Paralelo {{ item.par_nombre }}</p>
                        <p class="text-xs text-gray-400 leading-tight truncate">{{ item.car_nombre }} {{ item.aul_nombre ? '| ' + item.aul_nombre : '' }}</p>
                      </div>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Materias que dicta, agrupadas por nivel -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-sm font-semibold text-gray-700 uppercase mb-3">Materias que dicta</h2>
          <div v-for="nivel in nivelesDocente" :key="nivel" class="mb-4">
            <h3 class="text-xs font-semibold text-blue-900 uppercase mb-2">Nivel {{ nivel }}</h3>
            <div class="space-y-2">
              <div v-for="mat in materiasDeNivel(nivel)" :key="mat.key" class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ mat.mat_nombre }}</p>
                  <p class="text-xs text-gray-500">{{ mat.car_nombre }} - Paralelo {{ mat.par_nombre }}</p>
                </div>
                <span v-if="mat.aul_nombre" class="text-xs text-gray-400">
                  <i class="pi pi-building mr-1"></i>{{ mat.aul_nombre }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { periodosApi } from '../../api/periodos.api'
import { horariosApi } from '../../api/horarios.api'
import { docentesApi } from '../../api/docentes.api'
import type { Periodo } from '../../api/periodos.api'
import type { HorarioDocente, Dia } from '../../api/horarios.api'
import type { Docente } from '../../api/docentes.api'
import { useAuthStore } from '../../stores/auth.store'

const authStore = useAuthStore()

const periodos = ref<Periodo[]>([])
const dias = ref<Dia[]>([])
const horario = ref<HorarioDocente[]>([])
const docente = ref<Docente | null>(null)
const perId = ref(0)
const loading = ref(false)
const horas = Array.from({ length: 24 }, (_, i) => i)

const colores = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4f46e5', '#ca8a04', '#16a34a']
const colorMap = new Map<string, string>()

function getColorMateria(nombre: string): string {
  if (!colorMap.has(nombre)) colorMap.set(nombre, colores[colorMap.size % colores.length])
  return colorMap.get(nombre)!
}

function formatHora(h: number): string { return `${h.toString().padStart(2, '0')}:00` }

function getRowspan(horaInicio: string, horaFin: string): number {
  return Math.max(1, parseInt(horaFin.substring(0, 2)) - parseInt(horaInicio.substring(0, 2)))
}

// Niveles unicos que dicta el docente en este periodo, ordenados
const nivelesDocente = computed(() => {
  return [...new Set(horario.value.map(h => h.pra_nivel))].sort((a, b) => a - b)
})

function getCeldaPorNivel(nivel: number, diaOrden: number, hora: number) {
  const horaStr = formatHora(hora)
  return horario.value.filter(h =>
    h.pra_nivel === nivel &&
    Number(h.dia_orden) === diaOrden &&
    h.blq_hora_inicio?.substring(0, 5) === horaStr
  )
}

// Reduce el rango de horas visibles en la grilla de cada nivel, para no
// mostrar 24 filas vacias cuando ese nivel solo tiene clases en la mañana
function horasVisiblesNivel(nivel: number): number[] {
  const items = horario.value.filter(h => h.pra_nivel === nivel)
  if (items.length === 0) return horas
  const horasEnGrilla = items.map(h => parseInt(h.blq_hora_inicio.substring(0, 2)))
  const minH = Math.max(0, Math.min(...horasEnGrilla) - 1)
  const maxH = Math.min(23, Math.max(...horasEnGrilla) + 3)
  return horas.filter(h => h >= minH && h <= maxH)
}

const totalHoras = computed(() => {
  return horario.value.reduce((acc, h) => acc + (Number(h.hor_duracion) || 0), 0)
})

// Materias unicas agrupadas por nivel, para la lista inferior
const materiasPorNivelMap = computed(() => {
  const map = new Map<number, any[]>()
  for (const h of horario.value) {
    const nivel = h.pra_nivel
    if (!map.has(nivel)) map.set(nivel, [])
    const key = `${h.mat_codigo}-${h.par_nombre}`
    const lista = map.get(nivel)!
    if (!lista.find(m => m.key === key)) {
      lista.push({
        key,
        mat_nombre: h.mat_nombre,
        car_nombre: h.car_nombre,
        par_nombre: h.par_nombre,
        aul_nombre: h.aul_nombre,
      })
    }
  }
  return map
})

function materiasDeNivel(nivel: number) {
  return materiasPorNivelMap.value.get(nivel) || []
}

onMounted(async () => {
  try {
    const [periodosRes, diasRes] = await Promise.all([periodosApi.getAll(), horariosApi.getDias()])
    periodos.value = periodosRes.data.filter(p => p.per_estado)
    dias.value = diasRes.data

    const usuId = Number(authStore.usuario?.usu_id)
    const docenteRes = await docentesApi.getByUsuario(usuId)
    docente.value = docenteRes.data
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
})

async function loadHorario() {
  if (!perId.value || !docente.value) { horario.value = []; return }
  loading.value = true
  try {
    const response = await horariosApi.getHorarioDocente(Number(docente.value.doc_id), Number(perId.value))
    horario.value = response.data
  } catch (error) {
    console.error('Error cargando horario:', error)
  } finally {
    loading.value = false
  }
}
</script>