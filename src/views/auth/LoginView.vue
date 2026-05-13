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

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input v-model="form.usu_usuario" type="text" placeholder="Ingrese su usuario"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              @keyup.enter="handleLogin" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input v-model="form.usu_contrasenia" type="password" placeholder="Ingrese su contraseña"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              @keyup.enter="handleLogin" />
          </div>

          <button @click="handleLogin" :disabled="loading"
            class="w-full bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? 'Ingresando...' : 'Iniciar Sesion' }}
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
    await authStore.login(form)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al iniciar sesion'
  } finally {
    loading.value = false
  }
}
</script>