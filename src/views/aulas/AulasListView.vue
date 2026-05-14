<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Aulas</h1>
                <p class="text-gray-500 text-sm mt-1">{{ isCoordinador ? 'Aulas de su escuela' : 'Gestion de aulas' }}
                </p>
            </div>
            <button @click="openModal()"
                class="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
                <i class="pi pi-plus"></i>
                Nueva Aula
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Codigo</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Capacidad</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="loading" class="text-center">
                        <td colspan="7" class="px-6 py-8 text-gray-400">Cargando...</td>
                    </tr>
                    <tr v-else-if="aulas.length === 0" class="text-center">
                        <td colspan="7" class="px-6 py-8 text-gray-400">No hay aulas registradas</td>
                    </tr>
                    <tr v-for="aula in aulas" :key="aula.aul_id" class="hover:bg-gray-50 transition">
                        <td class="px-6 py-4 text-sm text-gray-700">{{ aula.aul_id }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ aula.aul_codigo }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ aula.aul_nombre }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ aula.aul_capacidad }}</td>
                        <td class="px-6 py-4 text-sm text-gray-500">{{ aula.aul_tipo || '-' }}</td>
                        <td class="px-6 py-4">
                            <span
                                :class="['px-2 py-1 rounded-full text-xs font-medium', aula.aul_estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                                {{ aula.aul_estado ? 'Activo' : 'Inactivo' }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                <button @click="openModal(aula)" class="text-blue-600 hover:text-blue-800 transition">
                                    <i class="pi pi-pencil text-sm"></i>
                                </button>
                                <button @click="confirmDelete(aula)" class="text-red-600 hover:text-red-800 transition">
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
                    <h2 class="text-lg font-semibold text-gray-800">{{ editingAula ? 'Editar Aula' : 'Nueva Aula' }}
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
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Codigo</label>
                            <input v-model="form.aul_codigo" type="text"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                            <input v-model.number="form.aul_capacidad" type="number"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input v-model="form.aul_nombre" type="text"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select v-model="form.aul_tipo"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                            <option value="">-- Seleccione --</option>
                            <option value="Aula">Aula</option>
                            <option value="Laboratorio">Laboratorio</option>
                            <option value="Auditorio">Auditorio</option>
                            <option value="Taller">Taller</option>
                        </select>
                    </div>
                    <div v-if="isAdmin">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Escuela</label>
                        <select v-model.number="form.esc_id"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
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
                    <p class="text-sm text-gray-500 mb-6">Desea eliminar el aula <strong>{{ deletingAula?.aul_nombre
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
import { aulasApi } from '../../api/aulas.api'
import { escuelasApi } from '../../api/escuelas.api'
import type { Aula, CreateAulaRequest } from '../../api/aulas.api'
import type { Escuela } from '../../api/escuelas.api'
import { useRole } from '../../composables/useRole'
import api from '../../api/axios'

const { isAdmin, isCoordinador, usuarioId } = useRole()

const aulas = ref<Aula[]>([])
const escuelas = ref<Escuela[]>([])
const miEscuela = ref<Escuela | null>(null)
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const formError = ref('')
const editingAula = ref<Aula | null>(null)
const deletingAula = ref<Aula | null>(null)

const form = reactive<CreateAulaRequest>({
    aul_codigo: '',
    aul_nombre: '',
    aul_capacidad: 0,
    aul_tipo: '',
    esc_id: 0,
    aul_estado: true,
})

onMounted(async () => {
    loading.value = true
    try {
        if (isCoordinador.value) {
            const escuelaRes = await api.get(`/programacion-academica/coordinador/${usuarioId.value}/escuela`)
            if (escuelaRes.data.length > 0) {
                miEscuela.value = escuelaRes.data[0]
                const aulasRes = await aulasApi.getByEscuela(Number(miEscuela.value!.esc_id))
                aulas.value = aulasRes.data
            }
        } else {
            const [aulasRes, escuelasRes] = await Promise.all([
                aulasApi.getAll(),
                escuelasApi.getAll(),
            ])
            aulas.value = aulasRes.data
            escuelas.value = escuelasRes.data
        }
    } catch (error) {
        console.error('Error cargando datos:', error)
    } finally {
        loading.value = false
    }
})

async function loadAulas() {
    try {
        if (isCoordinador.value && miEscuela.value) {
            const response = await aulasApi.getByEscuela(Number(miEscuela.value.esc_id))
            aulas.value = response.data
        } else {
            const response = await aulasApi.getAll()
            aulas.value = response.data
        }
    } catch (error) {
        console.error('Error cargando aulas:', error)
    }
}

function openModal(aula?: Aula) {
    formError.value = ''
    if (aula) {
        editingAula.value = aula
        form.aul_codigo = aula.aul_codigo
        form.aul_nombre = aula.aul_nombre
        form.aul_capacidad = aula.aul_capacidad
        form.aul_tipo = aula.aul_tipo || ''
        form.esc_id = Number(aula.esc_id)
        form.aul_estado = aula.aul_estado
    } else {
        editingAula.value = null
        form.aul_codigo = ''
        form.aul_nombre = ''
        form.aul_capacidad = 0
        form.aul_tipo = ''
        form.esc_id = isCoordinador.value && miEscuela.value ? Number(miEscuela.value.esc_id) : 0
        form.aul_estado = true
    }
    showModal.value = true
}

function closeModal() {
    showModal.value = false
    editingAula.value = null
}

async function handleSubmit() {
    if (!form.aul_codigo || !form.aul_nombre || !form.aul_capacidad) {
        formError.value = 'El codigo, nombre y capacidad son obligatorios'
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
        if (editingAula.value) {
            await aulasApi.update(editingAula.value.aul_id, form)
        } else {
            await aulasApi.create(form)
        }
        closeModal()
        await loadAulas()
    } catch (err: any) {
        formError.value = err.response?.data?.message || 'Error al guardar'
    } finally {
        saving.value = false
    }
}

function confirmDelete(aula: Aula) {
    deletingAula.value = aula
    showDeleteModal.value = true
}

async function handleDelete() {
    if (!deletingAula.value) return
    saving.value = true
    try {
        await aulasApi.delete(deletingAula.value.aul_id)
        showDeleteModal.value = false
        deletingAula.value = null
        await loadAulas()
    } catch (err: any) {
        console.error('Error eliminando:', err)
    } finally {
        saving.value = false
    }
}
</script>