<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Periodos Academicos</h1>
        <p class="text-gray-500 text-sm mt-1">Gestion de periodos academicos</p>
      </div>
      <button @click="openModal()" class="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
        <i class="pi pi-plus"></i>
        Nuevo Periodo
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Codigo</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha Inicio</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha Fin</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Semanas</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading" class="text-center">
            <td colspan="8" class="px-6 py-8 text-gray-400">Cargando...</td>
          </tr>
          <tr v-else-if="periodos.length === 0" class="text-center">
            <td colspan="8" class="px-6 py-8 text-gray-400">No hay periodos registrados</td>
          </tr>
          <tr v-for="periodo in periodos" :key="periodo.per_id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-sm text-gray-700">{{ periodo.per_id }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ periodo.per_codigo }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ periodo.per_nombre }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ formatDate(periodo.per_fecha_inicio) }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ formatDate(periodo.per_fecha_fin) }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ periodo.per_semanas }}</td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', periodo.per_estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                {{ periodo.per_estado ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button @click="openModal(periodo)" class="text-blue-600 hover:text-blue-800 transition">
                  <i class="pi pi-pencil text-sm"></i>
                </button>
                <button @click="confirmDelete(periodo)" class="text-red-600 hover:text-red-800 transition">
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
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">{{ editingPeriodo ? 'Editar Periodo' : 'Nuevo Periodo' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ formError }}
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Codigo</label>
              <input v-model="form.per_codigo" type="text" placeholder="Ej: 202601" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Semanas</label>
              <input v-model.number="form.per_semanas" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input v-model="form.per_nombre" type="text" placeholder="Ej: Marzo 2026 - Julio 2026" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input v-model="form.per_fecha_inicio" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input v-model="form.per_fecha_fin" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
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
          <p class="text-sm text-gray-500 mb-6">Desea eliminar el periodo <strong>{{ deletingPeriodo?.per_nombre }}</strong>?</p>
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
import { periodosApi } from '../../api/periodos.api'
import type { Periodo, CreatePeriodoRequest } from '../../api/periodos.api'

const periodos = ref<Periodo[]>([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const formError = ref('')
const editingPeriodo = ref<Periodo | null>(null)
const deletingPeriodo = ref<Periodo | null>(null)

const form = reactive<CreatePeriodoRequest>({
  per_codigo: '',
  per_nombre: '',
  per_fecha_inicio: '',
  per_fecha_fin: '',
  per_semanas: 16,
  per_estado: true,
})

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

onMounted(() => { loadPeriodos() })

async function loadPeriodos() {
  loading.value = true
  try {
    const response = await periodosApi.getAll()
    periodos.value = response.data
  } catch (error) {
    console.error('Error cargando periodos:', error)
  } finally {
    loading.value = false
  }
}

function openModal(periodo?: Periodo) {
  formError.value = ''
  if (periodo) {
    editingPeriodo.value = periodo
    form.per_codigo = periodo.per_codigo
    form.per_nombre = periodo.per_nombre
    form.per_fecha_inicio = periodo.per_fecha_inicio?.split('T')[0] || ''
    form.per_fecha_fin = periodo.per_fecha_fin?.split('T')[0] || ''
    form.per_semanas = periodo.per_semanas
    form.per_estado = periodo.per_estado
  } else {
    editingPeriodo.value = null
    form.per_codigo = ''
    form.per_nombre = ''
    form.per_fecha_inicio = ''
    form.per_fecha_fin = ''
    form.per_semanas = 16
    form.per_estado = true
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPeriodo.value = null
}

async function handleSubmit() {
  if (!form.per_codigo || !form.per_nombre || !form.per_fecha_inicio || !form.per_fecha_fin) {
    formError.value = 'Todos los campos son obligatorios'
    return
  }

  saving.value = true
  formError.value = ''

  try {
    if (editingPeriodo.value) {
      await periodosApi.update(editingPeriodo.value.per_id, form)
    } else {
      await periodosApi.create(form)
    }
    closeModal()
    await loadPeriodos()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

function confirmDelete(periodo: Periodo) {
  deletingPeriodo.value = periodo
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingPeriodo.value) return
  saving.value = true
  try {
    await periodosApi.delete(deletingPeriodo.value.per_id)
    showDeleteModal.value = false
    deletingPeriodo.value = null
    await loadPeriodos()
  } catch (err: any) {
    console.error('Error eliminando:', err)
  } finally {
    saving.value = false
  }
}
</script>