<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Coordinadores</h1>
                <p class="text-gray-500 text-sm mt-1">Asignar coordinadores a escuelas</p>
            </div>
            <button @click="showModal = true"
                class="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
                <i class="pi pi-plus"></i>
                Asignar Coordinador
            </button>
        </div>

        <!-- Verificar asignacion de un usuario -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Buscar asignacion por usuario</label>
            <select v-model.number="selectedUserId" @change="loadEscuelaUsuario"
                class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                <option value="0">-- Seleccione un usuario --</option>
                <option v-for="usuario in usuarios" :key="usuario.usu_id" :value="usuario.usu_id">
                    {{ usuario.usu_nombres }} {{ usuario.usu_apellidos }} ({{ usuario.usu_usuario }})
                </option>
            </select>
        </div>

        <!-- Escuela asignada -->
        <div v-if="selectedUserId && !loadingEscuela" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Escuela Asignada</h2>
                <div v-if="escuelasAsignadas.length === 0" class="text-gray-400 text-sm">Este usuario no tiene escuela
                    asignada</div>
                <div v-else class="space-y-2">
                    <div v-for="esc in escuelasAsignadas" :key="esc.esc_id"
                        class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                        <div>
                            <p class="text-sm font-medium text-gray-800">{{ esc.esc_nombre }}</p>
                            <p class="text-xs text-gray-500">{{ esc.esc_codigo }}</p>
                        </div>
                        <i class="pi pi-check-circle text-green-600"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Carreras Asignadas</h2>
                <div v-if="carrerasAsignadas.length === 0" class="text-gray-400 text-sm">No tiene carreras asignadas aun
                </div>
                <div v-else class="space-y-2">
                    <div v-for="car in carrerasAsignadas" :key="car.car_id"
                        class="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                        <div>
                            <p class="text-sm font-medium text-gray-800">{{ car.car_nombre }}</p>
                            <p class="text-xs text-gray-500">{{ car.esc_nombre }}</p>
                        </div>
                        <i class="pi pi-bookmark text-blue-600"></i>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loadingEscuela" class="text-center py-8 text-gray-400">Cargando...</div>

        <!-- Modal Asignar -->
        <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-semibold text-gray-800">Asignar Coordinador a Escuela</h2>
                    <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <div v-if="formError"
                    class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {{ formError }}
                </div>

                <div v-if="formSuccess"
                    class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {{ formSuccess }}
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Coordinador</label>
                        <select v-model.number="form.usu_id"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                            <option value="0">-- Seleccione un usuario --</option>
                            <option v-for="usuario in usuarios" :key="usuario.usu_id" :value="usuario.usu_id">
                                {{ usuario.usu_nombres }} {{ usuario.usu_apellidos }} ({{ usuario.usu_identificacion }})
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Escuela</label>
                        <select v-model.number="form.esc_id"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm">
                            <option value="0">-- Seleccione una escuela --</option>
                            <option v-for="escuela in escuelas" :key="escuela.esc_id" :value="escuela.esc_id">
                                {{ escuela.esc_nombre }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button @click="closeModal"
                        class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition">Cancelar</button>
                    <button @click="handleAssign" :disabled="saving"
                        class="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm hover:bg-blue-800 transition disabled:opacity-50">
                        {{ saving ? 'Asignando...' : 'Asignar' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '../../api/axios'
import { usuariosApi } from '../../api/usuarios.api'
import { escuelasApi } from '../../api/escuelas.api'
import type { Usuario } from '../../api/usuarios.api'
import type { Escuela } from '../../api/escuelas.api'

const usuarios = ref<Usuario[]>([])
const escuelas = ref<Escuela[]>([])
const escuelasAsignadas = ref<any[]>([])
const carrerasAsignadas = ref<any[]>([])
const selectedUserId = ref(0)
const loadingEscuela = ref(false)
const saving = ref(false)
const showModal = ref(false)
const formError = ref('')
const formSuccess = ref('')

const form = reactive({
    usu_id: 0,
    esc_id: 0,
})

onMounted(async () => {
    try {
        const [usuariosRes, escuelasRes] = await Promise.all([
            usuariosApi.getAll(),
            escuelasApi.getAll(),
        ])
        usuarios.value = usuariosRes.data
        escuelas.value = escuelasRes.data
    } catch (error) {
        console.error('Error cargando datos:', error)
    }
})

async function loadEscuelaUsuario() {
    if (!selectedUserId.value) {
        escuelasAsignadas.value = []
        carrerasAsignadas.value = []
        return
    }

    loadingEscuela.value = true
    try {
        const [escuelaRes, carrerasRes] = await Promise.all([
            api.get(`/programacion-academica/coordinador/${selectedUserId.value}/escuela`),
            api.get(`/programacion-academica/coordinador/${selectedUserId.value}/carreras`),
        ])
        escuelasAsignadas.value = escuelaRes.data
        carrerasAsignadas.value = carrerasRes.data
    } catch (error) {
        console.error('Error cargando datos del coordinador:', error)
        escuelasAsignadas.value = []
        carrerasAsignadas.value = []
    } finally {
        loadingEscuela.value = false
    }
}

function closeModal() {
    showModal.value = false
    formError.value = ''
    formSuccess.value = ''
    form.usu_id = 0
    form.esc_id = 0
}

async function handleAssign() {
    if (!form.usu_id || !form.esc_id) {
        formError.value = 'Seleccione un coordinador y una escuela'
        return
    }

    saving.value = true
    formError.value = ''
    formSuccess.value = ''

    try {
        await api.post('/programacion-academica/coordinador-carrera', {
            usu_id: Number(form.usu_id),
            esc_id: Number(form.esc_id),
            car_id: null,
        })
        formSuccess.value = 'Coordinador asignado exitosamente'
        // Si el usuario seleccionado es el mismo, recargar
        if (selectedUserId.value === form.usu_id) {
            await loadEscuelaUsuario()
        }
        setTimeout(() => {
            closeModal()
        }, 1000)
    } catch (err: any) {
        formError.value = err.response?.data?.message || 'Error al asignar'
    } finally {
        saving.value = false
    }
}
</script>