<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Roles</h1>
                <p class="text-gray-500 text-sm mt-1">Gestion de roles del sistema</p>
            </div>
            <button @click="openModal()"
                class="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
                <i class="pi pi-plus"></i>
                Nuevo Rol
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
                    <tr v-else-if="roles.length === 0" class="text-center">
                        <td colspan="5" class="px-6 py-8 text-gray-400">No hay roles registrados</td>
                    </tr>
                    <tr v-for="rol in roles" :key="rol.rol_id" class="hover:bg-gray-50 transition">
                        <td class="px-6 py-4 text-sm text-gray-700">{{ rol.rol_id }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ rol.rol_nombre }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ rol.rol_descripcion || '-' }}</td>
                        <td class="px-6 py-4">
                            <span
                                :class="['px-2 py-1 rounded-full text-xs font-medium', rol.rol_estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                                {{ rol.rol_estado ? 'Activo' : 'Inactivo' }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                <button @click="openModal(rol)" class="text-blue-600 hover:text-blue-800 transition">
                                    <i class="pi pi-pencil text-sm"></i>
                                </button>
                                <button @click="confirmDelete(rol)" class="text-red-600 hover:text-red-800 transition">
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
                    <h2 class="text-lg font-semibold text-gray-800">{{ editingRol ? 'Editar Rol' : 'Nuevo Rol' }}</h2>
                    <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <div v-if="formError"
                    class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {{ formError }}
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
                        <input v-model="form.rol_nombre" type="text"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                        <textarea v-model="form.rol_descripcion" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"></textarea>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button @click="closeModal"
                        class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
                    <button @click="handleSubmit" :disabled="saving"
                        class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">
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
                    <p class="text-sm text-gray-500 mb-6">Desea eliminar el rol <strong>{{ deletingRol?.rol_nombre
                            }}</strong>?</p>
                    <div class="flex justify-center gap-3">
                        <button @click="showDeleteModal = false"
                            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
                        <button @click="handleDelete" :disabled="saving"
                            class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50">
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
import { rolesApi } from '../../api/roles.api'
import type { Rol, CreateRolRequest } from '../../api/roles.api'

const roles = ref<Rol[]>([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const formError = ref('')
const editingRol = ref<Rol | null>(null)
const deletingRol = ref<Rol | null>(null)

const form = reactive<CreateRolRequest>({
    rol_nombre: '',
    rol_descripcion: '',
    rol_estado: true,
})

onMounted(() => { loadRoles() })

async function loadRoles() {
    loading.value = true
    try {
        const response = await rolesApi.getAll()
        roles.value = response.data
    } catch (error) {
        console.error('Error cargando roles:', error)
    } finally {
        loading.value = false
    }
}

function openModal(rol?: Rol) {
    formError.value = ''
    if (rol) {
        editingRol.value = rol
        form.rol_nombre = rol.rol_nombre
        form.rol_descripcion = rol.rol_descripcion || ''
        form.rol_estado = rol.rol_estado
    } else {
        editingRol.value = null
        form.rol_nombre = ''
        form.rol_descripcion = ''
        form.rol_estado = true
    }
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    editingRol.value = null
}

async function handleSubmit() {
    if (!form.rol_nombre) {
        formError.value = 'El nombre del rol es obligatorio'
        return
    }

    saving.value = true
    formError.value = ''

    try {
        if (editingRol.value) {
            await rolesApi.update(editingRol.value.rol_id, form)
        } else {
            await rolesApi.create(form)
        }
        closeModal()
        await loadRoles()
    } catch (err: any) {
        formError.value = err.response?.data?.message || 'Error al guardar'
    } finally {
        saving.value = false
    }
}

function confirmDelete(rol: Rol) {
    deletingRol.value = rol
    showDeleteModal.value = true
}

async function handleDelete() {
    if (!deletingRol.value) return
    saving.value = true
    try {
        await rolesApi.delete(deletingRol.value.rol_id)
        showDeleteModal.value = false
        deletingRol.value = null
        await loadRoles()
    } catch (err: any) {
        console.error('Error eliminando:', err)
    } finally {
        saving.value = false
    }
}
</script>