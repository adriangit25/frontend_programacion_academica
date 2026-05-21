<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Paralelos</h1>
        <p class="text-gray-500 text-sm mt-1">Gestion de paralelos</p>
      </div>
      <button @click="showModal = true" class="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
        <i class="pi pi-plus"></i>
        Nuevo Paralelo
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
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading" class="text-center">
            <td colspan="4" class="px-6 py-8 text-gray-400">Cargando...</td>
          </tr>
          <tr v-else-if="paralelos.length === 0" class="text-center">
            <td colspan="4" class="px-6 py-8 text-gray-400">No hay paralelos registrados</td>
          </tr>
          <tr v-for="paralelo in paralelos" :key="paralelo.par_id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-sm text-gray-700">{{ paralelo.par_id }}</td>
            <td class="px-6 py-4 text-sm text-gray-700 font-medium">{{ paralelo.par_nombre }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ paralelo.par_descripcion || '-' }}</td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', paralelo.par_estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                {{ paralelo.par_estado ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Nuevo Paralelo</h2>
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
            <input v-model="form.par_nombre" type="text" placeholder="Ej: A, B, C" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea v-model="form.par_descripcion" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"></textarea>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { paralelosApi } from '../../api/paralelos.api'
import type { Paralelo, CreateParaleloRequest } from '../../api/paralelos.api'

const paralelos = ref<Paralelo[]>([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const formError = ref('')

const form = reactive<CreateParaleloRequest>({
  par_nombre: '',
  par_descripcion: '',
  par_estado: true,
})

onMounted(() => { loadParalelos() })

async function loadParalelos() {
  loading.value = true
  try {
    const response = await paralelosApi.getAll()
    paralelos.value = response.data
  } catch (error) {
    console.error('Error cargando paralelos:', error)
  } finally {
    loading.value = false
  }
}

function closeModal() {
  showModal.value = false
  form.par_nombre = ''
  form.par_descripcion = ''
  formError.value = ''
}

async function handleSubmit() {
  if (!form.par_nombre) {
    formError.value = 'El nombre es obligatorio'
    return
  }

  saving.value = true
  formError.value = ''

  try {
    await paralelosApi.create(form)
    closeModal()
    await loadParalelos()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}
</script>