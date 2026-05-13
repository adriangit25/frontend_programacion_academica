<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Asignar Menus a Roles</h1>
                <p class="text-gray-500 text-sm mt-1">Seleccione un rol para gestionar sus menus</p>
            </div>
        </div>

        <!-- Seleccionar Rol -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Rol</label>
            <select v-model="selectedRolId" @change="loadMenusRol"
                class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option value="">-- Seleccione un rol --</option>
                <option v-for="rol in roles" :key="rol.rol_id" :value="rol.rol_id">
                    {{ rol.rol_nombre }}
                </option>
            </select>
        </div>

        <!-- Menus del rol seleccionado -->
        <div v-if="selectedRolId" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Menus asignados -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Menus Asignados</h2>
                <div v-if="loadingMenus" class="text-gray-400 text-sm">Cargando...</div>
                <div v-else-if="menusAsignados.length === 0" class="text-gray-400 text-sm">No tiene menus asignados
                </div>
                <div v-else class="space-y-2">
                    <div v-for="menu in menusAsignados" :key="menu.men_id"
                        class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                        <div class="flex items-center gap-2">
                            <i v-if="menu.men_icono" :class="[menu.men_icono, 'text-green-600 text-sm']"></i>
                            <div>
                                <p class="text-sm font-medium text-gray-800">{{ menu.men_nombre }}</p>
                                <p class="text-xs text-gray-500">{{ menu.men_url || 'Menu padre' }}</p>
                            </div>
                        </div>
                        <i class="pi pi-check-circle text-green-600"></i>
                    </div>
                </div>
            </div>

            <!-- Asignar nuevo menu -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Asignar Nuevo Menu</h2>

                <div v-if="formError"
                    class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {{ formError }}
                </div>

                <div v-if="formSuccess"
                    class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {{ formSuccess }}
                </div>

                <div v-if="menusDisponibles.length === 0" class="text-gray-400 text-sm">
                    El rol ya tiene todos los menus asignados
                </div>

                <div v-else class="space-y-2">
                    <div v-for="menu in menusDisponibles" :key="menu.men_id"
                        class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <div class="flex items-center gap-2">
                            <i v-if="menu.men_icono" :class="[menu.men_icono, 'text-gray-500 text-sm']"></i>
                            <div>
                                <p class="text-sm font-medium text-gray-800">{{ menu.men_nombre }}</p>
                                <p class="text-xs text-gray-500">{{ menu.men_url || 'Menu padre' }}</p>
                            </div>
                        </div>
                        <button @click="asignarMenu(menu.men_id)" :disabled="saving"
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
import { rolesApi } from '../../api/roles.api'
import { menusApi } from '../../api/menus.api'
import type { Rol } from '../../api/roles.api'
import type { Menu } from '../../api/menus.api'
import api from '../../api/axios'

const roles = ref<Rol[]>([])
const todosLosMenus = ref<Menu[]>([])
const menusAsignados = ref<{ men_id: number; men_nombre: string; men_icono: string | null; men_url: string | null; men_orden: number; men_padre_id: number | null }[]>([])
const selectedRolId = ref<number | string>('')
const loadingMenus = ref(false)
const saving = ref(false)
const formError = ref('')
const formSuccess = ref('')

const menusDisponibles = computed(() => {
    const idsAsignados = menusAsignados.value.map(m => String(m.men_id))
    return todosLosMenus.value.filter(m => !idsAsignados.includes(String(m.men_id)) && m.men_estado)
})

onMounted(async () => {
    try {
        const [rolesRes, menusRes] = await Promise.all([
            rolesApi.getAll(),
            menusApi.getAll(),
        ])
        roles.value = rolesRes.data
        todosLosMenus.value = menusRes.data
    } catch (error) {
        console.error('Error cargando datos:', error)
    }
})

async function loadMenusRol() {
    if (!selectedRolId.value) {
        menusAsignados.value = []
        return
    }

    loadingMenus.value = true
    formError.value = ''
    formSuccess.value = ''

    try {
        const response = await api.get(`/programacion-academica/rol-menu/${selectedRolId.value}`)
        menusAsignados.value = response.data
    } catch (error) {
        console.error('Error cargando menus del rol:', error)
    } finally {
        loadingMenus.value = false
    }
}

async function asignarMenu(menId: number) {
    saving.value = true
    formError.value = ''
    formSuccess.value = ''

    try {
        await api.post('/programacion-academica/rol-menu', {
            rol_id: Number(selectedRolId.value),
            men_id: menId,
        })
        formSuccess.value = 'Menu asignado exitosamente'
        await loadMenusRol()
    } catch (err: any) {
        formError.value = err.response?.data?.message || 'Error al asignar menu'
    } finally {
        saving.value = false
    }
}
</script>