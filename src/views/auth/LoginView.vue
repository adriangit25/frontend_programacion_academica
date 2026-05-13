<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
    <div class="w-full max-w-md px-8">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-900 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span class="text-white text-2xl font-bold">PA</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">Programacion Academica</h1>
          <p class="text-gray-500 text-sm mt-1">PUCE Sede Ibarra</p>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ error }}
        </div>

        <!-- Paso 1: Login -->
        <div v-if="!authStore.requiresRoleSelection" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input v-model="form.usu_usuario" type="text" placeholder="Ingrese su usuario"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              @keyup.enter="handleLogin" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contrasenia</label>
            <input v-model="form.usu_contrasenia" type="password" placeholder="Ingrese su contrasenia"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              @keyup.enter="handleLogin" />
          </div>

          <button @click="handleLogin" :disabled="loading"
            class="w-full bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? 'Verificando...' : 'Iniciar Sesion' }}
          </button>
        </div>

        <!-- Paso 2: Seleccionar Rol -->
        <div v-else class="space-y-4">
          <div class="text-center mb-4">
            <i class="pi pi-users text-3xl text-blue-900 mb-2"></i>
            <p class="text-sm text-gray-600">Seleccione el rol con el que desea ingresar</p>
          </div>

          <button v-for="rol in authStore.pendingRoles" :key="rol.rol_id" @click="handleSelectRol(rol.rol_id)"
            :disabled="loading"
            class="w-full flex items-center justify-between px-4 py-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition disabled:opacity-50">
            <div class="text-left">
              <p class="font-medium text-gray-800">{{ rol.rol_nombre }}</p>
              <p class="text-xs text-gray-500">{{ rol.rol_descripcion || '' }}</p>
            </div>
            <i class="pi pi-chevron-right text-gray-400"></i>
          </button>

          <button @click="handleBack" class="w-full text-sm text-gray-500 hover:text-gray-700 transition mt-2">
            Volver al login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '../../stores/auth.store'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const form = reactive({
  usu_usuario: '',
  usu_contrasenia: '',
})

async function handleLogin() {
  if (!form.usu_usuario || !form.usu_contrasenia) {
    error.value = 'Complete todos los campos'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.validate(form)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al iniciar sesion'
  } finally {
    loading.value = false
  }
}

async function handleSelectRol(rolId: number) {
  if (!authStore.pendingUserId) return

  loading.value = true
  error.value = ''

  try {
    await authStore.selectRol({
      usu_id: Number(authStore.pendingUserId),
      rol_id: Number(rolId),
    })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al seleccionar rol'
  } finally {
    loading.value = false
  }
}

function handleBack() {
  authStore.resetPending()
  error.value = ''
}
</script>