<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Docentes</h1>
        <p class="text-gray-500 text-sm mt-1">{{ isCoordinador ? 'Docentes de su escuela' : 'Gestion de docentes' }}</p>
      </div>
      <button @click="openModal()" class="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
        <i class="pi pi-plus"></i>
        Nuevo Docente
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">No.</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Apellidos y Nombres</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Identificacion</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Titulo Grado</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Titulo Posgrado</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dedicacion</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Contrato</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Horas Min</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Horas Max</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Areas</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading" class="text-center">
              <td colspan="11" class="px-4 py-8 text-gray-400">Cargando...</td>
            </tr>
            <tr v-else-if="docentes.length === 0" class="text-center">
              <td colspan="11" class="px-4 py-8 text-gray-400">No hay docentes registrados</td>
            </tr>
            <tr v-for="(docente, index) in docentes" :key="docente.doc_id" class="hover:bg-gray-50 transition">
              <td class="px-4 py-3 text-sm text-gray-700">{{ index + 1 }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 font-medium">{{ docente.usu_apellidos }} {{ docente.usu_nombres }}</td>
              <td class="px-4 py-3 text-sm text-gray-500">{{ docente.usu_identificacion }}</td>
              <td class="px-4 py-3 text-sm text-gray-500">{{ docente.doc_titulo_grado || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-500">{{ docente.doc_titulo_posgrado || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ docente.doc_dedicacion }}</td>
              <td class="px-4 py-3 text-sm text-gray-500">{{ docente.doc_tipo_contrato || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ docente.doc_horas_minimas }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ docente.doc_horas_maximas }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span v-if="!docenteAreas[docente.doc_id] || docenteAreas[docente.doc_id].length === 0" class="text-xs text-gray-400">Sin areas</span>
                  <span v-for="area in docenteAreas[docente.doc_id]" :key="area.arc_id" class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {{ area.arc_nombre }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <button @click="openModal(docente)" class="text-blue-600 hover:text-blue-800 transition" title="Editar">
                    <i class="pi pi-pencil text-sm"></i>
                  </button>
                  <button @click="openAreaModal(docente)" class="text-green-600 hover:text-green-800 transition" title="Asignar areas">
                    <i class="pi pi-tags text-sm"></i>
                  </button>
                  <button @click="confirmDelete(docente)" class="text-red-600 hover:text-red-800 transition" title="Eliminar">
                    <i class="pi pi-trash text-sm"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Crear/Editar Docente -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">{{ editingDocente ? 'Editar Docente' : 'Nuevo Docente' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ formError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <select v-model.number="form.usu_id" :disabled="!!editingDocente" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm disabled:bg-gray-100">
              <option value="0">-- Seleccione un usuario --</option>
              <option v-for="usuario in usuarios" :key="usuario.usu_id" :value="usuario.usu_id">
                {{ usuario.usu_apellidos }} {{ usuario.usu_nombres }} ({{ usuario.usu_identificacion }})
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Titulo de Grado</label>
              <input v-model="form.doc_titulo_grado" type="text" placeholder="Ej: Ingeniero en Sistemas" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Titulo de Posgrado</label>
              <input v-model="form.doc_titulo_posgrado" type="text" placeholder="Ej: Magister en TI" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dedicacion</label>
              <select v-model="form.doc_dedicacion" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option value="">-- Seleccione --</option>
                <option value="Tiempo Completo">Tiempo Completo</option>
                <option value="Medio Tiempo">Medio Tiempo</option>
                <option value="Tiempo Parcial">Tiempo Parcial</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
              <select v-model="form.doc_tipo_contrato" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option value="">-- Seleccione --</option>
                <option value="Titular">Titular</option>
                <option value="Ocasional">Ocasional</option>
                <option value="Invitado">Invitado</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Horas Minimas Semanales</label>
              <input v-model.number="form.doc_horas_minimas" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Horas Maximas Semanales</label>
              <input v-model.number="form.doc_horas_maximas" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea v-model="form.doc_observaciones" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"></textarea>
          </div>
          <div v-if="isAdmin">
            <label class="block text-sm font-medium text-gray-700 mb-1">Escuela</label>
            <select v-model.number="form.esc_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
              <option value="0">-- Seleccione una escuela --</option>
              <option v-for="escuela in escuelas" :key="escuela.esc_id" :value="escuela.esc_id">
                {{ escuela.esc_nombre }}
              </option>
            </select>
          </div>
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-1">Escuela</label>
            <div class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700">
              {{ miEscuela?.esc_nombre || 'No tiene escuela asignada' }}
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeModal" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
          <button @click="handleSubmit" :disabled="saving" class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Asignar Areas -->
    <div v-if="showAreaModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Areas de {{ selectedDocente?.usu_apellidos }} {{ selectedDocente?.usu_nombres }}</h2>
          <button @click="showAreaModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="areaError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ areaError }}
        </div>

        <div v-if="areaSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ areaSuccess }}
        </div>

        <!-- Areas asignadas -->
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Areas asignadas</h3>
          <div v-if="areasDelDocente.length === 0" class="text-gray-400 text-sm">No tiene areas asignadas</div>
          <div v-else class="flex flex-wrap gap-2">
            <span v-for="area in areasDelDocente" :key="area.arc_id" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
              <i class="pi pi-check-circle text-xs"></i>
              {{ area.arc_nombre }}
            </span>
          </div>
        </div>

        <!-- Areas disponibles -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Asignar nueva area</h3>
          <div v-if="areasDisponibles.length === 0" class="text-gray-400 text-sm">Ya tiene todas las areas asignadas</div>
          <div v-else class="space-y-2">
            <div v-for="area in areasDisponibles" :key="area.arc_id" class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
              <span class="text-sm text-gray-700">{{ area.arc_nombre }}</span>
              <button @click="assignArea(area.arc_id)" :disabled="savingArea" class="px-3 py-1 bg-blue-900 text-white rounded-lg text-xs hover:bg-blue-800 transition disabled:opacity-50">
                {{ savingArea ? '...' : 'Asignar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminar -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div class="text-center">
          <i class="pi pi-exclamation-triangle text-4xl text-amber-500 mb-3"></i>
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminacion</h2>
          <p class="text-sm text-gray-500 mb-6">Desea eliminar al docente <strong>{{ deletingDocente?.usu_nombres }} {{ deletingDocente?.usu_apellidos }}</strong>?</p>
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
import { docentesApi } from '../../api/docentes.api'
import { usuariosApi } from '../../api/usuarios.api'
import { escuelasApi } from '../../api/escuelas.api'
import { areasConocimientoApi } from '../../api/areas-conocimiento.api'
import type { Docente, CreateDocenteRequest } from '../../api/docentes.api'
import type { Usuario } from '../../api/usuarios.api'
import type { Escuela } from '../../api/escuelas.api'
import type { AreaConocimiento } from '../../api/areas-conocimiento.api'
import { useRole } from '../../composables/useRole'
import api from '../../api/axios'

const { isAdmin, isCoordinador, usuarioId } = useRole()

const docentes = ref<Docente[]>([])
const usuarios = ref<Usuario[]>([])
const escuelas = ref<Escuela[]>([])
const todasLasAreas = ref<AreaConocimiento[]>([])
const miEscuela = ref<Escuela | null>(null)
const docenteAreas = ref<Record<number, { arc_id: number; arc_nombre: string }[]>>({})

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const formError = ref('')
const editingDocente = ref<Docente | null>(null)
const deletingDocente = ref<Docente | null>(null)

// Areas modal
const showAreaModal = ref(false)
const selectedDocente = ref<Docente | null>(null)
const areasDelDocente = ref<{ arc_id: number; arc_nombre: string }[]>([])
const savingArea = ref(false)
const areaError = ref('')
const areaSuccess = ref('')

const areasDisponibles = computed(() => {
  const idsAsignados = areasDelDocente.value.map(a => String(a.arc_id))
  return todasLasAreas.value.filter(a => !idsAsignados.includes(String(a.arc_id)) && a.arc_estado)
})

const form = reactive<CreateDocenteRequest>({
  usu_id: 0,
  doc_titulo_grado: '',
  doc_titulo_posgrado: '',
  doc_tipo_contrato: '',
  doc_dedicacion: '',
  doc_horas_minimas: 0,
  doc_horas_maximas: 0,
  doc_observaciones: '',
  esc_id: 0,
  doc_estado: true,
})

onMounted(async () => {
  loading.value = true
  try {
    const usuariosRes = await usuariosApi.getAll()
    usuarios.value = usuariosRes.data

    if (isCoordinador.value) {
      const escuelaRes = await api.get(`/programacion-academica/coordinador/${usuarioId.value}/escuela`)
      if (escuelaRes.data.length > 0) {
        miEscuela.value = escuelaRes.data[0]
        const [docentesRes, areasRes] = await Promise.all([
          docentesApi.getByEscuela(Number(miEscuela.value!.esc_id)),
          areasConocimientoApi.getByEscuela(Number(miEscuela.value!.esc_id)),
        ])
        docentes.value = docentesRes.data
        todasLasAreas.value = areasRes.data
      }
    } else {
      const [docentesRes, escuelasRes, areasRes] = await Promise.all([
        docentesApi.getAll(),
        escuelasApi.getAll(),
        areasConocimientoApi.getAll(),
      ])
      docentes.value = docentesRes.data
      escuelas.value = escuelasRes.data
      todasLasAreas.value = areasRes.data
    }

    // Cargar areas de cada docente
    await loadAllDocenteAreas()
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loading.value = false
  }
})

async function loadAllDocenteAreas() {
  for (const docente of docentes.value) {
    try {
      const res = await api.get(`/programacion-academica/docentes/${docente.doc_id}/areas`)
      docenteAreas.value[docente.doc_id] = res.data
    } catch {
      docenteAreas.value[docente.doc_id] = []
    }
  }
}

async function loadDocentes() {
  try {
    if (isCoordinador.value && miEscuela.value) {
      const response = await docentesApi.getByEscuela(Number(miEscuela.value.esc_id))
      docentes.value = response.data
    } else {
      const response = await docentesApi.getAll()
      docentes.value = response.data
    }
    await loadAllDocenteAreas()
  } catch (error) {
    console.error('Error cargando docentes:', error)
  }
}

function openModal(docente?: Docente) {
  formError.value = ''
  if (docente) {
    editingDocente.value = docente
    form.usu_id = Number(docente.usu_id)
    form.doc_titulo_grado = docente.doc_titulo_grado || ''
    form.doc_titulo_posgrado = docente.doc_titulo_posgrado || ''
    form.doc_tipo_contrato = docente.doc_tipo_contrato || ''
    form.doc_dedicacion = docente.doc_dedicacion
    form.doc_horas_minimas = docente.doc_horas_minimas
    form.doc_horas_maximas = docente.doc_horas_maximas
    form.doc_observaciones = docente.doc_observaciones || ''
    form.esc_id = Number(docente.esc_id)
    form.doc_estado = docente.doc_estado
  } else {
    editingDocente.value = null
    form.usu_id = 0
    form.doc_titulo_grado = ''
    form.doc_titulo_posgrado = ''
    form.doc_tipo_contrato = ''
    form.doc_dedicacion = ''
    form.doc_horas_minimas = 0
    form.doc_horas_maximas = 0
    form.doc_observaciones = ''
    form.esc_id = isCoordinador.value && miEscuela.value ? Number(miEscuela.value.esc_id) : 0
    form.doc_estado = true
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingDocente.value = null
}

async function handleSubmit() {
  if (!form.usu_id) {
    formError.value = 'Debe seleccionar un usuario para registrar como docente'
    return
  }

  if (!form.doc_dedicacion) {
    formError.value = 'La dedicacion es obligatoria'
    return
  }

  if (!form.doc_horas_minimas || !form.doc_horas_maximas) {
    formError.value = 'Las horas minimas y maximas son obligatorias'
    return
  }

  if (isCoordinador.value && miEscuela.value) {
    form.esc_id = Number(miEscuela.value.esc_id)
  }

  if (!form.esc_id) {
    formError.value = 'La escuela es obligatoria'
    return
  }

  saving.value = true
  formError.value = ''

  try {
    let docIdCreado: number | null = null
    if (editingDocente.value) {
      await docentesApi.update(editingDocente.value.doc_id, form)
    } else {
      const res = await docentesApi.create(form)
      docIdCreado = Number(res.data.docente.doc_id)
    }
    closeModal()
    await loadDocentes()

    // Si es un docente nuevo, abrir directamente el modal de areas
    if (docIdCreado) {
      const docenteCreado = docentes.value.find(d => Number(d.doc_id) === docIdCreado)
      if (docenteCreado) openAreaModal(docenteCreado)
    }
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

// ==================== AREAS ====================

async function openAreaModal(docente: Docente) {
  selectedDocente.value = docente
  areaError.value = ''
  areaSuccess.value = ''
  showAreaModal.value = true

  try {
    const res = await api.get(`/programacion-academica/docentes/${docente.doc_id}/areas`)
    areasDelDocente.value = res.data
  } catch {
    areasDelDocente.value = []
  }
}

async function assignArea(arcId: number) {
  if (!selectedDocente.value) return

  savingArea.value = true
  areaError.value = ''
  areaSuccess.value = ''

  try {
    await api.post('/programacion-academica/docente-area', {
      doc_id: Number(selectedDocente.value.doc_id),
      arc_id: Number(arcId),
    })
    areaSuccess.value = 'Area asignada exitosamente'
    const res = await api.get(`/programacion-academica/docentes/${selectedDocente.value.doc_id}/areas`)
    areasDelDocente.value = res.data
    docenteAreas.value[selectedDocente.value.doc_id] = res.data
  } catch (err: any) {
    areaError.value = err.response?.data?.message || 'Error al asignar area'
  } finally {
    savingArea.value = false
  }
}

function confirmDelete(docente: Docente) {
  deletingDocente.value = docente
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingDocente.value) return
  saving.value = true
  try {
    await docentesApi.delete(deletingDocente.value.doc_id)
    showDeleteModal.value = false
    deletingDocente.value = null
    await loadDocentes()
  } catch (err: any) {
    console.error('Error eliminando:', err)
  } finally {
    saving.value = false
  }
}
</script>