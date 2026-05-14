<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Areas de Conocimiento</h1>
        <p class="text-gray-500 text-sm mt-1">{{ isCoordinador ? 'Areas de su escuela' : 'Gestion de areas de conocimiento' }}</p>
      </div>
      <button @click="openModal()" class="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
        <i class="pi pi-plus"></i>
        Nueva Area
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Descripcion</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading" class="text-center">
            <td colspan="5" class="px-6 py-8 text-gray-400">Cargando...</td>
          </tr>
          <tr v-else-if="areas.length === 0" class="text-center">
            <td colspan="5" class="px-6 py-8 text-gray-400">No hay areas registradas</td>
          </tr>
          <tr v-for="area in areas" :key="area.arc_id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-sm text-gray-700">{{ area.arc_id }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ area.arc_nombre }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ area.arc_descripcion || '-' }}</td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', area.arc_estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                {{ area.arc_estado ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button @click="openModal(area)" class="text-blue-600 hover:text-blue-800 transition">
                  <i class="pi pi-pencil text-sm"></i>
                </button>
                <button @click="confirmDelete(area)" class="text-red-600 hover:text-red-800 transition">
                  <i class="pi pi-trash text-sm"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">{{ editingArea ? 'Editar Area' : 'Nueva Area' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ formError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input v-model="form.arc_nombre" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea v-model="form.arc_descripcion" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"></textarea>
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

    <!-- Modal Confirmar Eliminar -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div class="text-center">
          <i class="pi pi-exclamation-triangle text-4xl text-amber-500 mb-3"></i>
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Confirmar eliminacion</h2>
          <p class="text-sm text-gray-500 mb-6">Desea eliminar el area <strong>{{ deletingArea?.arc_nombre }}</strong>?</p>
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
import { ref, reactive, onMounted } from 'vue'
import { areasConocimientoApi } from '../../api/areas-conocimiento.api'
import { escuelasApi } from '../../api/escuelas.api'
import type { AreaConocimiento, CreateAreaConocimientoRequest } from '../../api/areas-conocimiento.api'
import type { Escuela } from '../../api/escuelas.api'
import { useRole } from '../../composables/useRole'
import api from '../../api/axios'

const { isAdmin, isCoordinador, usuarioId } = useRole()

const areas = ref<AreaConocimiento[]>([])
const escuelas = ref<Escuela[]>([])
const miEscuela = ref<Escuela | null>(null)
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const formError = ref('')
const editingArea = ref<AreaConocimiento | null>(null)
const deletingArea = ref<AreaConocimiento | null>(null)

const form = reactive<CreateAreaConocimientoRequest>({
  arc_nombre: '',
  arc_descripcion: '',
  esc_id: 0,
  arc_estado: true,
})

onMounted(async () => {
  loading.value = true
  try {
    if (isCoordinador.value) {
      const escuelaRes = await api.get(`/programacion-academica/coordinador/${usuarioId.value}/escuela`)
      if (escuelaRes.data.length > 0) {
        miEscuela.value = escuelaRes.data[0]
        const areasRes = await areasConocimientoApi.getByEscuela(Number(miEscuela.value!.esc_id))
        areas.value = areasRes.data
      }
    } else {
      const [areasRes, escuelasRes] = await Promise.all([
        areasConocimientoApi.getAll(),
        escuelasApi.getAll(),
      ])
      areas.value = areasRes.data
      escuelas.value = escuelasRes.data
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loading.value = false
  }
})

async function loadAreas() {
  try {
    if (isCoordinador.value && miEscuela.value) {
      const response = await areasConocimientoApi.getByEscuela(Number(miEscuela.value.esc_id))
      areas.value = response.data
    } else {
      const response = await areasConocimientoApi.getAll()
      areas.value = response.data
    }
  } catch (error) {
    console.error('Error cargando areas:', error)
  }
}

function openModal(area?: AreaConocimiento) {
  formError.value = ''
  if (area) {
    editingArea.value = area
    form.arc_nombre = area.arc_nombre
    form.arc_descripcion = area.arc_descripcion || ''
    form.esc_id = Number(area.esc_id)
    form.arc_estado = area.arc_estado
  } else {
    editingArea.value = null
    form.arc_nombre = ''
    form.arc_descripcion = ''
    form.esc_id = isCoordinador.value && miEscuela.value ? Number(miEscuela.value.esc_id) : 0
    form.arc_estado = true
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingArea.value = null
}

async function handleSubmit() {
  if (!form.arc_nombre) {
    formError.value = 'El nombre es obligatorio'
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
    if (editingArea.value) {
      await areasConocimientoApi.update(editingArea.value.arc_id, form)
    } else {
      await areasConocimientoApi.create(form)
    }
    closeModal()
    await loadAreas()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

function confirmDelete(area: AreaConocimiento) {
  deletingArea.value = area
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingArea.value) return
  saving.value = true
  try {
    await areasConocimientoApi.delete(deletingArea.value.arc_id)
    showDeleteModal.value = false
    deletingArea.value = null
    await loadAreas()
  } catch (err: any) {
    console.error('Error eliminando:', err)
  } finally {
    saving.value = false
  }
}
</script>