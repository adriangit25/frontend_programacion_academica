<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Usuarios</h1>
        <p class="text-gray-500 text-sm mt-1">Gestion de usuarios del sistema</p>
      </div>
      <button
        @click="openModal()"
        class="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm"
      >
        <i class="pi pi-plus"></i>
        Nuevo Usuario
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Identificacion</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombres</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Apellidos</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading" class="text-center">
            <td colspan="7" class="px-6 py-8 text-gray-400">Cargando...</td>
          </tr>
          <tr v-else-if="usuarios.length === 0" class="text-center">
            <td colspan="7" class="px-6 py-8 text-gray-400">No hay usuarios registrados</td>
          </tr>
          <tr v-for="usuario in usuarios" :key="usuario.usu_id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-sm text-gray-700">{{ usuario.usu_id }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ usuario.usu_identificacion }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ usuario.usu_nombres }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ usuario.usu_apellidos }}</td>
            <td class="px-6 py-4 text-sm text-gray-700">{{ usuario.usu_usuario }}</td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', usuario.usu_estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                {{ usuario.usu_estado ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button @click="openModal(usuario)" class="text-blue-600 hover:text-blue-800 transition">
                  <i class="pi pi-pencil text-sm"></i>
                </button>
                <button @click="confirmDelete(usuario)" class="text-red-600 hover:text-red-800 transition">
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
          <h2 class="text-lg font-semibold text-gray-800">{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="formError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ formError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Identificacion</label>
            <input v-model="form.usu_identificacion" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
              <input v-model="form.usu_nombres" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
              <input v-model="form.usu_apellidos" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input v-model="form.usu_usuario" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ editingUser ? 'Contrasenia (dejar vacio para no cambiar)' : 'Contrasenia' }}</label>
            <input v-model="form.usu_contrasenia" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeModal" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">
            Cancelar
          </button>
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
          <p class="text-sm text-gray-500 mb-6">
            Desea eliminar al usuario <strong>{{ deletingUser?.usu_nombres }} {{ deletingUser?.usu_apellidos }}</strong>?
          </p>
          <div class="flex justify-center gap-3">
            <button @click="showDeleteModal = false" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">
              Cancelar
            </button>
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
import { usuariosApi } from '../../api/usuarios.api'
import type { Usuario, CreateUsuarioRequest } from '../../api/usuarios.api'

const usuarios = ref<Usuario[]>([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const formError = ref('')
const editingUser = ref<Usuario | null>(null)
const deletingUser = ref<Usuario | null>(null)

const form = reactive<CreateUsuarioRequest>({
  usu_identificacion: '',
  usu_nombres: '',
  usu_apellidos: '',
  usu_usuario: '',
  usu_contrasenia: '',
  usu_estado: true,
})

onMounted(() => {
  loadUsuarios()
})

async function loadUsuarios() {
  loading.value = true
  try {
    const response = await usuariosApi.getAll()
    usuarios.value = response.data
  } catch (error) {
    console.error('Error cargando usuarios:', error)
  } finally {
    loading.value = false
  }
}

function openModal(usuario?: Usuario) {
  formError.value = ''
  if (usuario) {
    editingUser.value = usuario
    form.usu_identificacion = usuario.usu_identificacion
    form.usu_nombres = usuario.usu_nombres
    form.usu_apellidos = usuario.usu_apellidos
    form.usu_usuario = usuario.usu_usuario
    form.usu_contrasenia = ''
    form.usu_estado = usuario.usu_estado
  } else {
    editingUser.value = null
    form.usu_identificacion = ''
    form.usu_nombres = ''
    form.usu_apellidos = ''
    form.usu_usuario = ''
    form.usu_contrasenia = ''
    form.usu_estado = true
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
}

async function handleSubmit() {
  if (!form.usu_identificacion || !form.usu_nombres || !form.usu_apellidos || !form.usu_usuario) {
    formError.value = 'Complete todos los campos obligatorios'
    return
  }

  if (!editingUser.value && !form.usu_contrasenia) {
    formError.value = 'La contrasenia es obligatoria'
    return
  }

  saving.value = true
  formError.value = ''

  try {
    if (editingUser.value) {
      await usuariosApi.update(editingUser.value.usu_id, form)
    } else {
      await usuariosApi.create(form)
    }
    closeModal()
    await loadUsuarios()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

function confirmDelete(usuario: Usuario) {
  deletingUser.value = usuario
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deletingUser.value) return

  saving.value = true
  try {
    await usuariosApi.delete(deletingUser.value.usu_id)
    showDeleteModal.value = false
    deletingUser.value = null
    await loadUsuarios()
  } catch (err: any) {
    console.error('Error eliminando:', err)
  } finally {
    saving.value = false
  }
}
</script>