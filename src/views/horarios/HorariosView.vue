<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Generar Horarios</h1>
      <p class="text-gray-500 text-sm mt-1">Asigne horarios a las materias de la programacion</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
      <button @click="activeTab = 'grilla'" :class="['px-4 py-2 rounded-lg text-sm font-medium transition', activeTab === 'grilla' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']">
        Asignar Horarios
      </button>
      <button @click="activeTab = 'docente'" :class="['px-4 py-2 rounded-lg text-sm font-medium transition', activeTab === 'docente' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']">
        Horario Docente
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
          <select v-model.number="filters.per_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="0">-- Seleccione --</option>
            <option v-for="periodo in periodos" :key="periodo.per_id" :value="periodo.per_id">
              {{ periodo.per_nombre }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
          <select v-model.number="filters.car_id" @change="onCarreraChange" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="0">-- Seleccione --</option>
            <option v-for="carrera in carreras" :key="carrera.car_id" :value="carrera.car_id">
              {{ carrera.car_nombre }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
          <select v-model.number="filters.nivel" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="0">-- Todos --</option>
            <option v-for="n in 10" :key="n" :value="n">Nivel {{ n }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="loadData" :disabled="!filters.per_id || !filters.car_id" class="w-full px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Cargar
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 1: Grilla de Horarios -->
    <div v-if="activeTab === 'grilla'">
      <div v-if="loadingData" class="text-center py-8 text-gray-400">Cargando...</div>
      <div v-else-if="!filters.per_id || !filters.car_id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        Seleccione periodo y carrera para ver la grilla
      </div>
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-blue-900 text-white">
                <th class="px-3 py-3 text-xs font-semibold text-left border-r border-blue-800 w-20">HORA</th>
                <th v-for="dia in dias" :key="dia.dia_id" class="px-2 py-3 text-xs font-semibold text-center border-r border-blue-800" style="min-width: 140px;">
                  {{ dia.dia_nombre.toUpperCase() }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hora in horas" :key="hora" class="border-b border-gray-100">
                <td class="px-3 py-2 text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50 whitespace-nowrap">
                  {{ formatHora(hora) }}
                </td>
                <td
                  v-for="dia in dias"
                  :key="dia.dia_id"
                  @click="handleCeldaClick(dia, hora)"
                  class="px-1 py-1 border-r border-gray-100 cursor-pointer hover:bg-blue-50 transition relative"
                  style="min-height: 40px;"
                >
                  <div v-for="item in getCeldaItems(dia.dia_orden, hora)" :key="item.hor_id"
                    class="rounded px-2 py-1 mb-1 text-left relative group"
                    :style="{ backgroundColor: getColorMateria(item.mat_nombre) + '20', borderLeft: '3px solid ' + getColorMateria(item.mat_nombre) }"
                  >
                    <p class="text-xs font-medium truncate" :style="{ color: getColorMateria(item.mat_nombre) }">{{ item.mat_nombre }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ item.docente_nombre || 'Sin docente' }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ item.par_nombre }} {{ item.aul_nombre ? '| ' + item.aul_nombre : '' }}</p>
                    <button @click.stop="deleteHorarioGrilla(item.hor_id)" class="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">
                      <i class="pi pi-times text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: Horario Docente -->
    <div v-if="activeTab === 'docente'">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Docente</label>
        <select v-model.number="selectedDocId" @change="loadHorarioDocente" class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
          <option value="0">-- Seleccione --</option>
          <option v-for="docente in docentes" :key="docente.doc_id" :value="docente.doc_id">
            {{ docente.usu_apellidos }} {{ docente.usu_nombres }}
          </option>
        </select>
      </div>

      <div v-if="loadingDocente" class="text-center py-8 text-gray-400">Cargando...</div>
      <div v-else-if="selectedDocId && horarioDocente.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        El docente no tiene horarios en este periodo
      </div>
      <div v-else-if="horarioDocente.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-blue-900 text-white">
                <th class="px-3 py-3 text-xs font-semibold text-left border-r border-blue-800 w-20">HORA</th>
                <th v-for="dia in dias" :key="dia.dia_id" class="px-2 py-3 text-xs font-semibold text-center border-r border-blue-800" style="min-width: 140px;">
                  {{ dia.dia_nombre.toUpperCase() }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hora in horas" :key="hora" class="border-b border-gray-100">
                <td class="px-3 py-2 text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50 whitespace-nowrap">
                  {{ formatHora(hora) }}
                </td>
                <td v-for="dia in dias" :key="dia.dia_id" class="px-1 py-1 border-r border-gray-100">
                  <div v-for="item in getCeldaDocente(dia.dia_orden, hora)" :key="item.hor_id"
                    class="rounded px-2 py-1 mb-1 text-left"
                    :style="{ backgroundColor: getColorMateria(item.mat_nombre) + '20', borderLeft: '3px solid ' + getColorMateria(item.mat_nombre) }"
                  >
                    <p class="text-xs font-medium truncate" :style="{ color: getColorMateria(item.mat_nombre) }">{{ item.mat_nombre }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ item.car_nombre }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ item.par_nombre }} {{ item.aul_nombre ? '| ' + item.aul_nombre : '' }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Asignar Materia -->
    <div v-if="showAsignarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Asignar Materia</h2>
            <p class="text-sm text-gray-500">{{ selectedDia?.dia_nombre }} - {{ formatHora(selectedHora) }}</p>
          </div>
          <button @click="showAsignarModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="asignarModalError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ asignarModalError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Materia</label>
            <select v-model.number="modalForm.pra_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Seleccione una materia --</option>
              <option v-for="prog in programacion" :key="prog.pra_id" :value="prog.pra_id">
                N{{ prog.pra_nivel }} | {{ prog.mat_codigo }} - {{ prog.mat_nombre }} ({{ prog.par_nombre }})
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
              <select v-model="modalForm.hora_inicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option v-for="h in horas" :key="h" :value="formatHora(h)">{{ formatHora(h) }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
              <select v-model="modalForm.hora_fin" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option v-for="h in horas" :key="h + 1" :value="formatHora(h + 1)">{{ formatHora(h + 1) }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Aula (opcional)</label>
            <select v-model.number="modalForm.aul_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Sin aula --</option>
              <option v-for="aula in aulas" :key="aula.aul_id" :value="aula.aul_id">
                {{ aula.aul_codigo }} - {{ aula.aul_nombre }} ({{ aula.aul_capacidad }})
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showAsignarModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
          <button @click="handleAsignar" :disabled="saving" class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">
            {{ saving ? 'Asignando...' : 'Asignar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { horariosApi } from '../../api/horarios.api'
import { programacionApi } from '../../api/programacion.api'
import { periodosApi } from '../../api/periodos.api'
import { carrerasApi } from '../../api/carreras.api'
import { docentesApi } from '../../api/docentes.api'
import { aulasApi } from '../../api/aulas.api'
import type { HorarioCompleto, HorarioDocente, Dia } from '../../api/horarios.api'
import type { Programacion } from '../../api/programacion.api'
import type { Periodo } from '../../api/periodos.api'
import type { Carrera } from '../../api/carreras.api'
import type { Docente } from '../../api/docentes.api'
import type { Aula } from '../../api/aulas.api'
import type { Escuela } from '../../api/escuelas.api'
import { useRole } from '../../composables/useRole'
import api from '../../api/axios'

const { isCoordinador, usuarioId } = useRole()

const periodos = ref<Periodo[]>([])
const carreras = ref<Carrera[]>([])
const docentes = ref<Docente[]>([])
const aulas = ref<Aula[]>([])
const dias = ref<Dia[]>([])
const programacion = ref<Programacion[]>([])
const horarioCompleto = ref<HorarioCompleto[]>([])
const horarioDocente = ref<HorarioDocente[]>([])
const miEscuela = ref<Escuela | null>(null)

const activeTab = ref('grilla')
const filters = reactive({ per_id: 0, car_id: 0, nivel: 0 })
const selectedDocId = ref(0)

const loadingData = ref(false)
const loadingDocente = ref(false)
const saving = ref(false)

// Modal
const showAsignarModal = ref(false)
const selectedDia = ref<Dia | null>(null)
const selectedHora = ref(0)
const asignarModalError = ref('')
const modalForm = reactive({
  pra_id: 0,
  hora_inicio: '07:00',
  hora_fin: '08:00',
  aul_id: 0,
})

// Horas de 0 a 23
const horas = Array.from({ length: 24 }, (_, i) => i)

const colores = [
  '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
  '#db2777', '#0891b2', '#4f46e5', '#ca8a04', '#16a34a',
  '#e11d48', '#0d9488', '#9333ea', '#ea580c', '#2dd4bf',
]
const colorMap = new Map<string, string>()

function getColorMateria(nombre: string): string {
  if (!colorMap.has(nombre)) {
    colorMap.set(nombre, colores[colorMap.size % colores.length])
  }
  return colorMap.get(nombre)!
}

function formatHora(h: number): string {
  return `${h.toString().padStart(2, '0')}:00`
}

function getCeldaItems(diaOrden: number, hora: number) {
  const horaStr = formatHora(hora)
  return horarioCompleto.value.filter(h => {
    return h.dia_orden === diaOrden && h.blq_hora_inicio === horaStr
  })
}

function getCeldaDocente(diaOrden: number, hora: number) {
  const horaStr = formatHora(hora)
  return horarioDocente.value.filter(h => {
    return h.dia_orden === diaOrden && h.blq_hora_inicio === horaStr
  })
}

onMounted(async () => {
  try {
    const [periodosRes, diasRes] = await Promise.all([
      periodosApi.getAll(),
      horariosApi.getDias(),
    ])
    periodos.value = periodosRes.data
    dias.value = diasRes.data

    if (isCoordinador.value) {
      const escuelaRes = await api.get(`/programacion-academica/coordinador/${usuarioId.value}/escuela`)
      if (escuelaRes.data.length > 0) {
        miEscuela.value = escuelaRes.data[0]
        const [carrerasRes, docentesRes, aulasRes] = await Promise.all([
          api.get(`/programacion-academica/escuelas/${Number(miEscuela.value!.esc_id)}/carreras`),
          docentesApi.getByEscuela(Number(miEscuela.value!.esc_id)),
          aulasApi.getByEscuela(Number(miEscuela.value!.esc_id)),
        ])
        carreras.value = carrerasRes.data
        docentes.value = docentesRes.data
        aulas.value = aulasRes.data
      }
    } else {
      const [carrerasRes, docentesRes, aulasRes] = await Promise.all([
        carrerasApi.getAll(),
        docentesApi.getAll(),
        aulasApi.getAll(),
      ])
      carreras.value = carrerasRes.data
      docentes.value = docentesRes.data
      aulas.value = aulasRes.data
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
})

async function onCarreraChange() {
  programacion.value = []
  horarioCompleto.value = []
}

async function loadData() {
  if (!filters.per_id || !filters.car_id) return

  loadingData.value = true
  try {
    // Cargar programacion para el select de materias
    const progRes = await programacionApi.getByPeriodoCarrera(Number(filters.per_id), Number(filters.car_id))
    programacion.value = filters.nivel
      ? progRes.data.filter(p => p.pra_nivel === filters.nivel)
      : progRes.data

    // Cargar horario completo para la grilla
    const horRes = await horariosApi.getHorarioCompleto(Number(filters.per_id), Number(filters.car_id))
    horarioCompleto.value = filters.nivel
      ? horRes.data.filter(h => h.pra_nivel === filters.nivel)
      : horRes.data
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loadingData.value = false
  }
}

function handleCeldaClick(dia: Dia, hora: number) {
  selectedDia.value = dia
  selectedHora.value = hora
  asignarModalError.value = ''
  modalForm.pra_id = 0
  modalForm.hora_inicio = formatHora(hora)
  modalForm.hora_fin = formatHora(hora + 1)
  modalForm.aul_id = 0
  showAsignarModal.value = true
}

async function handleAsignar() {
  if (!modalForm.pra_id || !selectedDia.value) {
    asignarModalError.value = 'Seleccione una materia'
    return
  }

  saving.value = true
  asignarModalError.value = ''

  try {
    // Buscar o crear el bloque horario
    let blqId = await findOrCreateBloque(modalForm.hora_inicio, modalForm.hora_fin)

    await horariosApi.create({
      pra_id: Number(modalForm.pra_id),
      dia_id: Number(selectedDia.value.dia_id),
      blq_id: Number(blqId),
      aul_id: modalForm.aul_id ? Number(modalForm.aul_id) : undefined,
    })

    showAsignarModal.value = false
    await loadData()
  } catch (err: any) {
    asignarModalError.value = err.response?.data?.message || 'Error al asignar horario'
  } finally {
    saving.value = false
  }
}

async function findOrCreateBloque(horaInicio: string, horaFin: string): Promise<number> {
  // Buscar si ya existe
  const bloquesRes = await horariosApi.getBloques()
  const existente = bloquesRes.data.find(b => b.blq_hora_inicio === horaInicio && b.blq_hora_fin === horaFin)

  if (existente) {
    return existente.blq_id
  }

  // Crear nuevo bloque
  const orden = bloquesRes.data.length + 1
  const response = await api.post('/programacion-academica/bloques-horarios', {
    blq_hora_inicio: horaInicio,
    blq_hora_fin: horaFin,
    blq_descripcion: `${horaInicio} - ${horaFin}`,
    blq_orden: orden,
  })

  return response.data.bloque.blq_id
}

async function deleteHorarioGrilla(horId: number) {
  try {
    await horariosApi.delete(horId)
    await loadData()
  } catch (error) {
    console.error('Error eliminando horario:', error)
  }
}

async function loadHorarioDocente() {
  if (!selectedDocId.value || !filters.per_id) {
    horarioDocente.value = []
    return
  }

  loadingDocente.value = true
  try {
    const response = await horariosApi.getHorarioDocente(Number(selectedDocId.value), Number(filters.per_id))
    horarioDocente.value = response.data
  } catch (error) {
    console.error('Error cargando horario docente:', error)
  } finally {
    loadingDocente.value = false
  }
}
</script>