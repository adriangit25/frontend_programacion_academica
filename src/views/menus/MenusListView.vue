<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Menus</h1>
                <p class="text-gray-500 text-sm mt-1">Gestion de menus del sistema</p>
            </div>
            <button @click="openModal()"
                class="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
                <i class="pi pi-plus"></i>
                Nuevo Menu
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Icono</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">URL</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Orden</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Padre</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="loading" class="text-center">
                        <td colspan="8" class="px-6 py-8 text-gray-400">Cargando...</td>
                    </tr>
                    <tr v-else-if="menus.length === 0" class="text-center">
                        <td colspan="8" class="px-6 py-8 text-gray-400">No hay menus registrados</td>
                    </tr>
                    <tr v-for="menu in menus" :key="menu.men_id" class="hover:bg-gray-50 transition">
                        <td class="px-6 py-4 text-sm text-gray-700">{{ menu.men_id }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">
                            <div class="flex items-center gap-2">
                                <i v-if="menu.men_icono" :class="[menu.men_icono, 'text-gray-500']"></i>
                                {{ menu.men_nombre }}
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-500">{{ menu.men_icono || '-' }}</td>
                        <td class="px-6 py-4 text-sm text-gray-500">{{ menu.men_url || '-' }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ menu.men_orden }}</td>
                        <td class="px-6 py-4 text-sm text-gray-500">{{ getNombrePadre(menu.men_padre_id) }}</td>
                        <td class="px-6 py-4">
                            <span
                                :class="['px-2 py-1 rounded-full text-xs font-medium', menu.men_estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                                {{ menu.men_estado ? 'Activo' : 'Inactivo' }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                <button @click="openModal(menu)" class="text-blue-600 hover:text-blue-800 transition">
                                    <i class="pi pi-pencil text-sm"></i>
                                </button>
                                <button @click="confirmDelete(menu)" class="text-red-600 hover:text-red-800 transition">
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
                    <h2 class="text-lg font-semibold text-gray-800">{{ editingMenu ? 'Editar Menu' : 'Nuevo Menu' }}
                    </h2>
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
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input v-model="form.men_nombre" type="text"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Icono (ej: pi pi-home)</label>
                            <input v-model="form.men_icono" type="text"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">URL (ej: /dashboard)</label>
                            <input v-model="form.men_url" type="text"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                            <input v-model.number="form.men_orden" type="number"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Menu Padre</label>
                            <select v-model="form.men_padre_id"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                                <option :value="null">-- Ninguno (es padre) --</option>
                                <option v-for="padre in menusPadre" :key="padre.men_id" :value="padre.men_id">
                                    {{ padre.men_nombre }}
                                </option>
                            </select>
                        </div>
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
                    <p class="text-sm text-gray-500 mb-6">Desea eliminar el menu <strong>{{ deletingMenu?.men_nombre
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
import { ref, reactive, computed, onMounted } from 'vue'
import { menusApi } from '../../api/menus.api'
import type { Menu, CreateMenuRequest } from '../../api/menus.api'

const menus = ref<Menu[]>([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const formError = ref('')
const editingMenu = ref<Menu | null>(null)
const deletingMenu = ref<Menu | null>(null)

const form = reactive<CreateMenuRequest>({
    men_nombre: '',
    men_icono: '',
    men_url: '',
    men_orden: 1,
    men_padre_id: null,
    men_estado: true,
})

const menusPadre = computed(() => {
    return menus.value.filter(m => !m.men_padre_id)
})

function getNombrePadre(padreId: number | null): string {
    if (!padreId) return '-- Raiz --'
    const padre = menus.value.find(m => String(m.men_id) === String(padreId))
    return padre ? padre.men_nombre : '-'
}

onMounted(() => { loadMenus() })

async function loadMenus() {
    loading.value = true
    try {
        const response = await menusApi.getAll()
        menus.value = response.data
    } catch (error) {
        console.error('Error cargando menus:', error)
    } finally {
        loading.value = false
    }
}

function openModal(menu?: Menu) {
    formError.value = ''
    if (menu) {
        editingMenu.value = menu
        form.men_nombre = menu.men_nombre
        form.men_icono = menu.men_icono || ''
        form.men_url = menu.men_url || ''
        form.men_orden = menu.men_orden
        form.men_padre_id = menu.men_padre_id
        form.men_estado = menu.men_estado
    } else {
        editingMenu.value = null
        form.men_nombre = ''
        form.men_icono = ''
        form.men_url = ''
        form.men_orden = 1
        form.men_padre_id = null
        form.men_estado = true
    }
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    editingMenu.value = null
}

async function handleSubmit() {
    if (!form.men_nombre) {
        formError.value = 'El nombre es obligatorio'
        return
    }

    saving.value = true
    formError.value = ''

    try {
        if (editingMenu.value) {
            await menusApi.update(editingMenu.value.men_id, form)
        } else {
            await menusApi.create(form)
        }
        closeModal()
        await loadMenus()
    } catch (err: any) {
        formError.value = err.response?.data?.message || 'Error al guardar'
    } finally {
        saving.value = false
    }
}

function confirmDelete(menu: Menu) {
    deletingMenu.value = menu
    showDeleteModal.value = true
}

async function handleDelete() {
    if (!deletingMenu.value) return
    saving.value = true
    try {
        await menusApi.delete(deletingMenu.value.men_id)
        showDeleteModal.value = false
        deletingMenu.value = null
        await loadMenus()
    } catch (err: any) {
        console.error('Error eliminando:', err)
    } finally {
        saving.value = false
    }
}
</script>