<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Planes de Estudio y Materias</h1>
      <p class="text-gray-500 text-sm mt-1">Gestione los planes de estudio y sus materias por carrera</p>
    </div>

    <!-- Paso 1: Seleccionar Carrera -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Carrera</label>
      <select v-model.number="selectedCarreraId" @change="loadPlanes" class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
        <option value="0">-- Seleccione una carrera --</option>
        <option v-for="carrera in carreras" :key="carrera.car_id" :value="carrera.car_id">
          {{ carrera.car_nombre }}
        </option>
      </select>
    </div>

    <!-- Paso 2: Planes de Estudio -->
    <div v-if="selectedCarreraId" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Planes de Estudio</h2>
        <button @click="openPlanModal()" class="flex items-center gap-2 bg-blue-900 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
          <i class="pi pi-plus"></i>
          Nuevo Plan
        </button>
      </div>

      <div v-if="loadingPlanes" class="text-gray-400 text-sm py-4">Cargando...</div>
      <div v-else-if="planes.length === 0" class="text-gray-400 text-sm py-4">No hay planes de estudio para esta carrera</div>
      <div v-else class="space-y-2">
        <div
          v-for="plan in planes"
          :key="plan.pln_id"
          @click="selectPlan(plan)"
          :class="['flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition',
            selectedPlan?.pln_id === plan.pln_id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100']"
        >
          <div>
            <p class="text-sm font-medium text-gray-800">{{ plan.pln_nombre }}</p>
            <p class="text-xs text-gray-500">{{ plan.pln_codigo }} - Anio: {{ plan.pln_anio }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click.stop="openPlanModal(plan)" class="text-blue-600 hover:text-blue-800 transition">
              <i class="pi pi-pencil text-sm"></i>
            </button>
            <button @click.stop="confirmDeletePlan(plan)" class="text-red-600 hover:text-red-800 transition">
              <i class="pi pi-trash text-sm"></i>
            </button>
            <i class="pi pi-chevron-right text-gray-400"></i>
          </div>
        </div>
      </div>
    </div>

<!-- Paso 3: Materias del Plan Seleccionado -->
    <div v-if="selectedPlan" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">Materias - {{ selectedPlan.pln_nombre }}</h2>
          <p class="text-xs text-gray-500">{{ selectedPlan.pln_codigo }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Nivel:</label>
            <input v-model.number="selectedNivel" type="number" min="1" class="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-center" />
          </div>
          <button @click="openMateriaModal()" class="flex items-center gap-2 bg-blue-900 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
            <i class="pi pi-plus"></i>
            Agregar Materia al Nivel {{ selectedNivel }}
          </button>
        </div>
      </div>

      <div v-if="loadingMaterias" class="text-gray-400 text-sm py-4">Cargando...</div>
      <div v-else-if="materias.length === 0" class="text-gray-400 text-sm py-4">No hay materias en este plan</div>
      <div v-else>
        <div v-for="nivel in nivelesConMaterias" :key="nivel" class="mb-6">
          <h3 class="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <span class="bg-blue-900 text-white px-2 py-0.5 rounded text-xs">Nivel {{ nivel }}</span>
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Codigo</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Materia</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Area</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">H. Docencia</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">H. Practicas</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">H. Autonomas</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Est.</th>
                  <th class="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="materia in getMateriasByNivel(nivel)" :key="materia.mat_id" class="hover:bg-gray-50 transition">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ materia.mat_codigo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ materia.mat_nombre }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ materia.arc_nombre || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ materia.mat_horas_docencia }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ materia.mat_horas_practicas }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ materia.mat_horas_autonomas }}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ materia.mat_total_horas }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ materia.mat_estudiantes_estimado }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button @click="openMateriaModal(materia)" class="text-blue-600 hover:text-blue-800 transition">
                        <i class="pi pi-pencil text-sm"></i>
                      </button>
                      <button @click="confirmDeleteMateria(materia)" class="text-red-600 hover:text-red-800 transition">
                        <i class="pi pi-trash text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Plan de Estudio -->
    <div v-if="showPlanModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">{{ editingPlan ? 'Editar Plan' : 'Nuevo Plan de Estudio' }}</h2>
          <button @click="showPlanModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="planError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ planError }}
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Codigo</label>
              <input v-model="planForm.pln_codigo" type="text" placeholder="Ej: PEN-2020" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Anio</label>
              <input v-model.number="planForm.pln_anio" type="number" placeholder="2020" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input v-model="planForm.pln_nombre" type="text" placeholder="Ej: Pensum 2020" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea v-model="planForm.pln_descripcion" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showPlanModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
          <button @click="handleSubmitPlan" :disabled="saving" class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Materia -->
    <div v-if="showMateriaModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">{{ editingMateria ? 'Editar Materia' : 'Nueva Materia' }}</h2>
          <button @click="showMateriaModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="materiaError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ materiaError }}
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Codigo</label>
              <input v-model="materiaForm.mat_codigo" type="text" placeholder="Ej: MAT-101" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <input v-model.number="materiaForm.mat_nivel" type="number" min="1" placeholder="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Materia</label>
            <input v-model="materiaForm.mat_nombre" type="text" placeholder="Ej: Calculo Diferencial" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Area de Conocimiento</label>
            <select v-model.number="materiaForm.arc_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Seleccione un area --</option>
              <option v-for="area in areas" :key="area.arc_id" :value="area.arc_id">
                {{ area.arc_nombre }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea v-model="materiaForm.mat_descripcion" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"></textarea>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Horas Docencia</label>
              <input v-model.number="materiaForm.mat_horas_docencia" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Horas Practicas</label>
              <input v-model.number="materiaForm.mat_horas_practicas" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Horas Autonomas</label>
              <input v-model.number="materiaForm.mat_horas_autonomas" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Total Horas</label>
              <input v-model.number="materiaForm.mat_total_horas" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estudiantes Estimados</label>
              <input v-model.number="materiaForm.mat_estudiantes_estimado" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showMateriaModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
          <button @click="handleSubmitMateria" :disabled="saving" class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminar Plan -->
    <div v-if="showDeletePlanModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div class="text-center">
          <i class="pi pi-exclamation-triangle text-4xl text-amber-500 mb-3"></i>
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminacion</h2>
          <p class="text-sm text-gray-500 mb-6">Desea eliminar el plan <strong>{{ deletingPlan?.pln_nombre }}</strong>?</p>
          <div class="flex justify-center gap-3">
            <button @click="showDeletePlanModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
            <button @click="handleDeletePlan" :disabled="saving" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50">
              {{ saving ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminar Materia -->
    <div v-if="showDeleteMateriaModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div class="text-center">
          <i class="pi pi-exclamation-triangle text-4xl text-amber-500 mb-3"></i>
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminacion</h2>
          <p class="text-sm text-gray-500 mb-6">Desea eliminar la materia <strong>{{ deletingMateria?.mat_nombre }}</strong>?</p>
          <div class="flex justify-center gap-3">
            <button @click="showDeleteMateriaModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
            <button @click="handleDeleteMateria" :disabled="saving" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50">
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
import { planesEstudioApi } from '../../api/planes-estudio.api'
import { materiasApi } from '../../api/materias.api'
import { areasConocimientoApi } from '../../api/areas-conocimiento.api'
import { carrerasApi } from '../../api/carreras.api'
import type { PlanEstudio, CreatePlanEstudioRequest } from '../../api/planes-estudio.api'
import type { Materia, CreateMateriaRequest } from '../../api/materias.api'
import type { AreaConocimiento } from '../../api/areas-conocimiento.api'
import type { Carrera } from '../../api/carreras.api'
import type { Escuela } from '../../api/escuelas.api'
import { useRole } from '../../composables/useRole'
import api from '../../api/axios'

const { isCoordinador, usuarioId } = useRole()

const carreras = ref<Carrera[]>([])
const planes = ref<PlanEstudio[]>([])
const materias = ref<Materia[]>([])
const areas = ref<AreaConocimiento[]>([])
const miEscuela = ref<Escuela | null>(null)

const selectedCarreraId = ref(0)
const selectedPlan = ref<PlanEstudio | null>(null)
const selectedNivel = ref(1)

const loadingPlanes = ref(false)
const loadingMaterias = ref(false)
const saving = ref(false)

// Plan modals
const showPlanModal = ref(false)
const showDeletePlanModal = ref(false)
const planError = ref('')
const editingPlan = ref<PlanEstudio | null>(null)
const deletingPlan = ref<PlanEstudio | null>(null)

const planForm = reactive<CreatePlanEstudioRequest>({
  pln_codigo: '',
  pln_nombre: '',
  pln_anio: new Date().getFullYear(),
  pln_descripcion: '',
  car_id: 0,
  pln_estado: true,
})

// Materia modals
const showMateriaModal = ref(false)
const showDeleteMateriaModal = ref(false)
const materiaError = ref('')
const editingMateria = ref<Materia | null>(null)
const deletingMateria = ref<Materia | null>(null)

const materiaForm = reactive<CreateMateriaRequest>({
  mat_codigo: '',
  mat_nombre: '',
  mat_descripcion: '',
  mat_nivel: 1,
  mat_horas_docencia: 0,
  mat_horas_practicas: 0,
  mat_horas_autonomas: 0,
  mat_total_horas: 0,
  mat_estudiantes_estimado: 0,
  pln_id: 0,
  arc_id: 0,
  mat_estado: true,
})

const nivelesConMaterias = computed(() => {
  const niveles = [...new Set(materias.value.map(m => m.mat_nivel))].sort((a, b) => a - b)
  return niveles
})

function getMateriasByNivel(nivel: number) {
  return materias.value.filter(m => m.mat_nivel === nivel)
}

onMounted(async () => {
  try {
    if (isCoordinador.value) {
      const escuelaRes = await api.get(`/programacion-academica/coordinador/${usuarioId.value}/escuela`)
      if (escuelaRes.data.length > 0) {
        miEscuela.value = escuelaRes.data[0]
        const [carrerasRes, areasRes] = await Promise.all([
          api.get(`/programacion-academica/escuelas/${Number(miEscuela.value!.esc_id)}/carreras`),
          areasConocimientoApi.getByEscuela(Number(miEscuela.value!.esc_id)),
        ])
        carreras.value = carrerasRes.data
        areas.value = areasRes.data
      }
    } else {
      const [carrerasRes, areasRes] = await Promise.all([
        carrerasApi.getAll(),
        areasConocimientoApi.getAll(),
      ])
      carreras.value = carrerasRes.data
      areas.value = areasRes.data
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
})

async function loadPlanes() {
  selectedPlan.value = null
  materias.value = []

  if (!selectedCarreraId.value) {
    planes.value = []
    return
  }

  loadingPlanes.value = true
  try {
    const response = await planesEstudioApi.getByCarrera(Number(selectedCarreraId.value))
    planes.value = response.data
  } catch (error) {
    console.error('Error cargando planes:', error)
  } finally {
    loadingPlanes.value = false
  }
}

async function selectPlan(plan: PlanEstudio) {
  selectedPlan.value = plan
  loadingMaterias.value = true
  try {
    const response = await materiasApi.getByPlan(Number(plan.pln_id))
    materias.value = response.data
  } catch (error) {
    console.error('Error cargando materias:', error)
  } finally {
    loadingMaterias.value = false
  }
}

// ==================== PLAN ====================

function openPlanModal(plan?: PlanEstudio) {
  planError.value = ''
  if (plan) {
    editingPlan.value = plan
    planForm.pln_codigo = plan.pln_codigo
    planForm.pln_nombre = plan.pln_nombre
    planForm.pln_anio = plan.pln_anio
    planForm.pln_descripcion = plan.pln_descripcion || ''
    planForm.car_id = Number(plan.car_id)
  } else {
    editingPlan.value = null
    planForm.pln_codigo = ''
    planForm.pln_nombre = ''
    planForm.pln_anio = new Date().getFullYear()
    planForm.pln_descripcion = ''
    planForm.car_id = Number(selectedCarreraId.value)
  }
  showPlanModal.value = true
}

async function handleSubmitPlan() {
  if (!planForm.pln_codigo || !planForm.pln_nombre || !planForm.pln_anio) {
    planError.value = 'El codigo, nombre y anio son obligatorios'
    return
  }

  planForm.car_id = Number(selectedCarreraId.value)

  saving.value = true
  planError.value = ''

  try {
    if (editingPlan.value) {
      await planesEstudioApi.update(editingPlan.value.pln_id, planForm)
    } else {
      await planesEstudioApi.create(planForm)
    }
    showPlanModal.value = false
    await loadPlanes()
  } catch (err: any) {
    planError.value = err.response?.data?.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

function confirmDeletePlan(plan: PlanEstudio) {
  deletingPlan.value = plan
  showDeletePlanModal.value = true
}

async function handleDeletePlan() {
  if (!deletingPlan.value) return
  const deletingId = deletingPlan.value.pln_id
  saving.value = true
  try {
    await planesEstudioApi.delete(deletingId)
    showDeletePlanModal.value = false
    if (selectedPlan.value?.pln_id === deletingId) {
      selectedPlan.value = null
      materias.value = []
    }
    deletingPlan.value = null
    await loadPlanes()
  } catch (err: any) {
    console.error('Error eliminando:', err)
  } finally {
    saving.value = false
  }
}

// ==================== MATERIA ====================

function openMateriaModal(materia?: Materia) {
  materiaError.value = ''
  if (materia) {
    editingMateria.value = materia
    materiaForm.mat_codigo = materia.mat_codigo
    materiaForm.mat_nombre = materia.mat_nombre
    materiaForm.mat_descripcion = materia.mat_descripcion || ''
    materiaForm.mat_nivel = materia.mat_nivel
    materiaForm.mat_horas_docencia = materia.mat_horas_docencia
    materiaForm.mat_horas_practicas = materia.mat_horas_practicas
    materiaForm.mat_horas_autonomas = materia.mat_horas_autonomas
    materiaForm.mat_total_horas = materia.mat_total_horas
    materiaForm.mat_estudiantes_estimado = materia.mat_estudiantes_estimado
    materiaForm.pln_id = Number(materia.pln_id)
    materiaForm.arc_id = Number(materia.arc_id)
  } else {
    editingMateria.value = null
    materiaForm.mat_codigo = ''
    materiaForm.mat_nombre = ''
    materiaForm.mat_descripcion = ''
    materiaForm.mat_nivel = selectedNivel.value
    materiaForm.mat_horas_docencia = 0
    materiaForm.mat_horas_practicas = 0
    materiaForm.mat_horas_autonomas = 0
    materiaForm.mat_total_horas = 0
    materiaForm.mat_estudiantes_estimado = 0
    materiaForm.pln_id = Number(selectedPlan.value?.pln_id) || 0
    materiaForm.arc_id = 0
  }
  showMateriaModal.value = true
}

async function handleSubmitMateria() {
  if (!materiaForm.mat_codigo || !materiaForm.mat_nombre || !materiaForm.mat_nivel || !materiaForm.arc_id) {
    materiaError.value = 'El codigo, nombre, nivel y area son obligatorios'
    return
  }

  materiaForm.pln_id = Number(selectedPlan.value?.pln_id) || 0

  saving.value = true
  materiaError.value = ''

  try {
    if (editingMateria.value) {
      await materiasApi.update(editingMateria.value.mat_id, materiaForm)
    } else {
      await materiasApi.create(materiaForm)
    }
    showMateriaModal.value = false
    await selectPlan(selectedPlan.value!)
  } catch (err: any) {
    materiaError.value = err.response?.data?.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

function confirmDeleteMateria(materia: Materia) {
  deletingMateria.value = materia
  showDeleteMateriaModal.value = true
}

async function handleDeleteMateria() {
  if (!deletingMateria.value) return
  saving.value = true
  try {
    await materiasApi.delete(deletingMateria.value.mat_id)
    showDeleteMateriaModal.value = false
    deletingMateria.value = null
    await selectPlan(selectedPlan.value!)
  } catch (err: any) {
    console.error('Error eliminando:', err)
  } finally {
    saving.value = false
  }
}
</script>