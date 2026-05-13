<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Asignar Roles a Usuarios</h1>
                <p class="text-gray-500 text-sm mt-1">Seleccione un usuario para gestionar sus roles</p>
            </div>
        </div>

        <!-- Seleccionar Usuario -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Usuario</label>
            <select v-model.number="selectedUserId" @change="loadRolesUsuario"
                class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option value="">-- Seleccione un usuario --</option>
                <option v-for="usuario in usuarios" :key="usuario.usu_id" :value="usuario.usu_id">
                    {{ usuario.usu_nombres }} {{ usuario.usu_apellidos }} ({{ usuario.usu_usuario }})
                </option>
            </select>
        </div>

        <!-- Roles del usuario seleccionado -->
        <div v-if="selectedUserId" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Roles asignados -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Roles Asignados</h2>
                <div v-if="loadingRoles" class="text-gray-400 text-sm">Cargando...</div>
                <div v-else-if="rolesAsignados.length === 0" class="text-gray-400 text-sm">No tiene roles asignados
                </div>
                <div v-else class="space-y-2">
                    <div v-for="rol in rolesAsignados" :key="rol.rol_id"
                        class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                        <div>
                            <p class="text-sm font-medium text-gray-800">{{ rol.rol_nombre }}</p>
                            <p class="text-xs text-gray-500">{{ rol.rol_descripcion || 'Sin descripcion' }}</p>
                        </div>
                        <i class="pi pi-check-circle text-green-600"></i>
                    </div>
                </div>
            </div>

            <!-- Asignar nuevo rol -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Asignar Nuevo Rol</h2>

                <div v-if="formError"
                    class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {{ formError }}
                </div>

                <div v-if="formSuccess"
                    class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {{ formSuccess }}
                </div>

                <div v-if="rolesDisponibles.length === 0" class="text-gray-400 text-sm">
                    El usuario ya tiene todos los roles asignados
                </div>

                <div v-else class="space-y-2">
                    <div v-for="rol in rolesDisponibles" :key="rol.rol_id"
                        class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <div>
                            <p class="text-sm font-medium text-gray-800">{{ rol.rol_nombre }}</p>
                            <p class="text-xs text-gray-500">{{ rol.rol_descripcion || 'Sin descripcion' }}</p>
                        </div>
                        <button @click="asignarRol(rol.rol_id)" :disabled="saving"
                            class="px-3 py-1 bg-blue-900 text-white rounded-lg text-xs hover:bg-blue-800 transition disabled:opacity-50">
                            {{ saving ? '...' : 'Asignar' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usuariosApi } from '../../api/usuarios.api'
import { rolesApi } from '../../api/roles.api'
import type { Usuario } from '../../api/usuarios.api'
import type { Rol } from '../../api/roles.api'
import api from '../../api/axios'

const usuarios = ref<Usuario[]>([])
const todosLosRoles = ref<Rol[]>([])
const rolesAsignados = ref<{ rol_id: number; rol_nombre: string; rol_descripcion: string | null }[]>([])
const selectedUserId = ref<number | string>('')
const loading = ref(false)
const loadingRoles = ref(false)
const saving = ref(false)
const formError = ref('')
const formSuccess = ref('')

const rolesDisponibles = computed(() => {
    const idsAsignados = rolesAsignados.value.map(r => String(r.rol_id))
    return todosLosRoles.value.filter(r => !idsAsignados.includes(String(r.rol_id)) && r.rol_estado)
})

onMounted(async () => {
    loading.value = true
    try {
        const [usersRes, rolesRes] = await Promise.all([
            usuariosApi.getAll(),
            rolesApi.getAll(),
        ])
        usuarios.value = usersRes.data
        todosLosRoles.value = rolesRes.data
    } catch (error) {
        console.error('Error cargando datos:', error)
    } finally {
        loading.value = false
    }
})

async function loadRolesUsuario() {
    if (!selectedUserId.value) {
        rolesAsignados.value = []
        return
    }

    loadingRoles.value = true
    formError.value = ''
    formSuccess.value = ''

    try {
        const response = await api.get(`/programacion-academica/usuario-rol/${selectedUserId.value}`)
        rolesAsignados.value = response.data
    } catch (error) {
        console.error('Error cargando roles del usuario:', error)
    } finally {
        loadingRoles.value = false
    }
}

async function asignarRol(rolId: number) {
    saving.value = true
    formError.value = ''
    formSuccess.value = ''

    try {
        await api.post('/programacion-academica/usuario-rol', {
            usu_id: Number(selectedUserId.value),
            rol_id: Number(rolId),
        })
        formSuccess.value = 'Rol asignado exitosamente'
        await loadRolesUsuario()
    } catch (err: any) {
        formError.value = err.response?.data?.message || 'Error al asignar rol'
    } finally {
        saving.value = false
    }
}
</script>