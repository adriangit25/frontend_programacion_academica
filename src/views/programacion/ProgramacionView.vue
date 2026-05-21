<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Programacion Academica</h1>
      <p class="text-gray-500 text-sm mt-1">Gestione la programacion academica por periodo y carrera</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
          <select v-model.number="filters.per_id" @change="onFilterChange" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Plan de Estudio</label>
          <select v-model.number="filters.pln_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="0">-- Seleccione --</option>
            <option v-for="plan in planes" :key="plan.pln_id" :value="plan.pln_id">
              {{ plan.pln_nombre }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="loadProgramacion" :disabled="!filters.per_id || !filters.car_id" class="w-full px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Cargar Programacion
          </button>
        </div>
      </div>
    </div>

    <!-- Acciones: Abrir Nivel / Materias -->
    <div v-if="filters.per_id && filters.car_id && filters.pln_id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Abrir Materias</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Paralelo</label>
          <select v-model.number="abrirForm.par_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
            <option value="0">-- Seleccione --</option>
            <option v-for="paralelo in paralelos" :key="paralelo.par_id" :value="paralelo.par_id">
              {{ paralelo.par_nombre }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
          <input v-model.number="abrirForm.nivel" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
        </div>
        <div class="flex items-end">
          <button @click="handleAbrirNivel" :disabled="!abrirForm.par_id || !abrirForm.nivel || saving" class="w-full px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {{ saving ? 'Abriendo...' : 'Abrir Nivel Completo' }}
          </button>
        </div>
      </div>

      <div v-if="abrirError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 text-sm">
        {{ abrirError }}
      </div>
      <div v-if="abrirSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 text-sm">
        {{ abrirSuccess }}
      </div>
    </div>

    <!-- Tabla de Programacion -->
    <div v-if="programacion.length > 0" class="space-y-6">
      <div v-for="grupo in gruposProgramacion" :key="`${grupo.nivel}-${grupo.paralelo}`">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="bg-blue-900 text-white px-6 py-3 flex items-center justify-between">
            <h3 class="font-semibold">Nivel {{ grupo.nivel }} - Paralelo {{ grupo.paralelo }}</h3>
            <span class="text-xs bg-blue-800 px-2 py-1 rounded">{{ grupo.items.length }} materias</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">NRC</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Codigo</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Materia</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Docente</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Aula</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">H.Doc</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">H.Prac</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">H.Aut</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">H/Semana</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Est.</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Modalidad</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="prog in grupo.items"
                  :key="prog.pra_id"
                  @click="openEditModal(prog)"
                  class="hover:bg-blue-50 transition cursor-pointer"
                >
                  <td class="px-4 py-3 text-sm text-gray-700">{{ prog.pra_nrc || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ prog.mat_codigo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700 font-medium">{{ prog.mat_nombre }}</td>
                  <td class="px-4 py-3 text-sm" :class="prog.docente_nombre ? 'text-gray-700' : 'text-amber-500'">
                    {{ prog.docente_nombre || 'Sin asignar' }}
                  </td>
                  <td class="px-4 py-3 text-sm" :class="prog.aul_nombre ? 'text-gray-700' : 'text-amber-500'">
                    {{ prog.aul_nombre || 'Sin asignar' }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ prog.mat_horas_docencia }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ prog.mat_horas_practicas }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ prog.mat_horas_autonomas }}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ prog.mat_total_horas }}</td>
                  <td class="px-4 py-3 text-xs text-gray-600">
                    D: {{ (prog.mat_horas_docencia / 16).toFixed(1) }} |
                    P: {{ (prog.mat_horas_practicas / 16).toFixed(1) }} |
                    A: {{ (prog.mat_horas_autonomas / 16).toFixed(1) }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ prog.pra_estudiantes_estimado || 0 }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ prog.pra_modalidad }}</td>
                  <td class="px-4 py-3" @click.stop>
                    <button @click="confirmDelete(prog)" class="text-red-600 hover:text-red-800 transition">
                      <i class="pi pi-trash text-sm"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loadingProg" class="text-center py-8 text-gray-400">Cargando programacion...</div>
    <div v-else-if="filters.per_id && filters.car_id && !loadingProg" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
      No hay materias abiertas para este periodo y carrera
    </div>

    <!-- Modal Editar Programacion -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Editar Programacion</h2>
            <p class="text-sm text-gray-500">{{ editingProg?.mat_codigo }} - {{ editingProg?.mat_nombre }}</p>
          </div>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="editError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ editError }}
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">NRC</label>
              <input v-model="editForm.pra_nrc" type="text" placeholder="Ej: 10745" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
              <select v-model="editForm.pra_modalidad" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Hibrida">Hibrida</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Docente</label>
            <select v-model.number="editForm.doc_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Sin asignar --</option>
              <option v-for="docente in docentes" :key="docente.doc_id" :value="docente.doc_id">
                {{ docente.usu_apellidos }} {{ docente.usu_nombres }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Aula</label>
            <select v-model.number="editForm.aul_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Sin asignar --</option>
              <option v-for="aula in aulas" :key="aula.aul_id" :value="aula.aul_id">
                {{ aula.aul_codigo }} - {{ aula.aul_nombre }} ({{ aula.aul_capacidad }})
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estudiantes Estimados</label>
              <input v-model.number="editForm.pra_estudiantes_estimado" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estudiantes Matriculados</label>
              <input v-model.number="editForm.pra_estudiantes_matriculados" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Laboratorio</label>
            <input v-model="editForm.pra_laboratorio" type="text" placeholder="Ej: Lab. Computacion 1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea v-model="editForm.pra_observaciones" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showEditModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
          <button @click="handleUpdateProgramacion" :disabled="saving" class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminar -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div class="text-center">
          <i class="pi pi-exclamation-triangle text-4xl text-amber-500 mb-3"></i>
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminacion</h2>
          <p class="text-sm text-gray-500 mb-6">Desea eliminar <strong>{{ deletingProg?.mat_nombre }}</strong> de la programacion?</p>
          <div class="flex justify-center gap-3">
            <button @click="showDeleteModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
            <button @click="handleDelete" :disabled="saving" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50">
              {{ saving ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { programacionApi } from '../../api/programacion.api'
import { periodosApi } from '../../api/periodos.api'
import { carrerasApi } from '../../api/carreras.api'
import { planesEstudioApi } from '../../api/planes-estudio.api'
import { docentesApi } from '../../api/docentes.api'
import { aulasApi } from '../../api/aulas.api'
import { paralelosApi } from '../../api/paralelos.api'
import type { Programacion, UpdateProgramacionRequest } from '../../api/programacion.api'
import type { Periodo } from '../../api/periodos.api'
import type { Carrera } from '../../api/carreras.api'
import type { PlanEstudio } from '../../api/planes-estudio.api'
import type { Docente } from '../../api/docentes.api'
import type { Aula } from '../../api/aulas.api'
import type { Paralelo } from '../../api/paralelos.api'
import type { Escuela } from '../../api/escuelas.api'
import { useRole } from '../../composables/useRole'
import api from '../../api/axios'

const { isCoordinador, usuarioId } = useRole()

const periodos = ref<Periodo[]>([])
const carreras = ref<Carrera[]>([])
const planes = ref<PlanEstudio[]>([])
const docentes = ref<Docente[]>([])
const aulas = ref<Aula[]>([])
const paralelos = ref<Paralelo[]>([])
const programacion = ref<Programacion[]>([])
const miEscuela = ref<Escuela | null>(null)

const loadingProg = ref(false)
const saving = ref(false)

const filters = reactive({ per_id: 0, car_id: 0, pln_id: 0 })
const abrirForm = reactive({ par_id: 0, nivel: 1 })
const abrirError = ref('')
const abrirSuccess = ref('')

// Edit modal
const showEditModal = ref(false)
const editingProg = ref<Programacion | null>(null)
const editError = ref('')
const editForm = reactive<Partial<UpdateProgramacionRequest>>({
  doc_id: 0,
  aul_id: 0,
  pra_nrc: '',
  pra_modalidad: 'Presencial',
  pra_estudiantes_estimado: 0,
  pra_estudiantes_matriculados: 0,
  pra_laboratorio: '',
  pra_observaciones: '',
})

// Delete modal
const showDeleteModal = ref(false)
const deletingProg = ref<Programacion | null>(null)

const gruposProgramacion = computed(() => {
  const grupos: { nivel: number; paralelo: string; items: Programacion[] }[] = []
  const map = new Map<string, Programacion[]>()

  for (const prog of programacion.value) {
    const key = `${prog.pra_nivel}-${prog.par_nombre}`
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(prog)
  }

  for (const [key, items] of map) {
    const [nivel, paralelo] = key.split('-')
    grupos.push({ nivel: Number(nivel), paralelo, items })
  }

  return grupos.sort((a, b) => a.nivel - b.nivel || a.paralelo.localeCompare(b.paralelo))
})

onMounted(async () => {
  try {
    const periodosRes = await periodosApi.getAll()
    periodos.value = periodosRes.data

    const paralelosRes = await paralelosApi.getAll()
    paralelos.value = paralelosRes.data

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
  filters.pln_id = 0
  planes.value = []
  programacion.value = []

  if (!filters.car_id) return

  try {
    const response = await planesEstudioApi.getByCarrera(Number(filters.car_id))
    planes.value = response.data
  } catch (error) {
    console.error('Error cargando planes:', error)
  }
}

function onFilterChange() {
  programacion.value = []
}

async function loadProgramacion() {
  if (!filters.per_id || !filters.car_id) return

  loadingProg.value = true
  try {
    const response = await programacionApi.getByPeriodoCarrera(Number(filters.per_id), Number(filters.car_id))
    programacion.value = response.data
  } catch (error) {
    console.error('Error cargando programacion:', error)
  } finally {
    loadingProg.value = false
  }
}

async function handleAbrirNivel() {
  if (!abrirForm.par_id || !abrirForm.nivel || !filters.pln_id) {
    abrirError.value = 'Seleccione paralelo, nivel y plan de estudio'
    return
  }

  saving.value = true
  abrirError.value = ''
  abrirSuccess.value = ''

  try {
    const response = await programacionApi.abrirNivel({
      per_id: Number(filters.per_id),
      car_id: Number(filters.car_id),
      pln_id: Number(filters.pln_id),
      nivel: Number(abrirForm.nivel),
      par_id: Number(abrirForm.par_id),
    })
    abrirSuccess.value = response.data.message
    await loadProgramacion()
  } catch (err: any) {
    abrirError.value = err.response?.data?.message || 'Error al abrir nivel'
  } finally {
    saving.value = false
  }
}

function openEditModal(prog: Programacion) {
  editingProg.value = prog
  editError.value = ''
  editForm.doc_id = prog.doc_id ? Number(prog.doc_id) : 0
  editForm.aul_id = prog.aul_id ? Number(prog.aul_id) : 0
  editForm.pra_nrc = prog.pra_nrc || ''
  editForm.pra_modalidad = prog.pra_modalidad || 'Presencial'
  editForm.pra_estudiantes_estimado = prog.pra_estudiantes_estimado || 0
  editForm.pra_estudiantes_matriculados = prog.pra_estudiantes_matriculados || 0
  editForm.pra_laboratorio = prog.pra_laboratorio || ''
  editForm.pra_observaciones = prog.pra_observaciones || ''
  showEditModal.value = true
}

async function handleUpdateProgramacion() {
  if (!editingProg.value) return

  saving.value = true
  editError.value = ''

  try {
    const data: UpdateProgramacionRequest = {
      per_id: Number(editingProg.value.per_id),
      mat_id: Number(editingProg.value.mat_id),
      car_id: Number(editingProg.value.car_id),
      pln_id: Number(editingProg.value.pln_id),
      par_id: Number(editingProg.value.par_id),
      pra_nivel: Number(editingProg.value.pra_nivel),
      doc_id: editForm.doc_id ? Number(editForm.doc_id) : undefined,
      aul_id: editForm.aul_id ? Number(editForm.aul_id) : undefined,
      pra_nrc: editForm.pra_nrc || undefined,
      pra_modalidad: editForm.pra_modalidad || 'Presencial',
      pra_estudiantes_estimado: editForm.pra_estudiantes_estimado || 0,
      pra_estudiantes_matriculados: editForm.pra_estudiantes_matriculados || 0,
      pra_laboratorio: editForm.pra_laboratorio || undefined,
      pra_observaciones: editForm.pra_observaciones || undefined,
    }

    await programacionApi.update(editingProg.value.pra_id, data)
    showEditModal.value = false
    await loadProgramacion()
  } catch (err: any) {
    editError.value = err.response?.data?.message || 'Error al actualizar'
  } finally {
    saving.value = false
  }
}

function confirmDelete(prog: Programacion) {
  deletingProg.value = prog
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingProg.value) return
  saving.value = true
  try {
    await programacionApi.delete(deletingProg.value.pra_id)
    showDeleteModal.value = false
    deletingProg.value = null
    await loadProgramacion()
  } catch (err: any) {
    console.error('Error eliminando:', err)
  } finally {
    saving.value = false
  }
}
</script>