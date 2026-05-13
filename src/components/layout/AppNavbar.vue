<template>
    <header
        :class="['fixed top-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40 transition-all duration-300', sidebarOpen ? 'left-64' : 'left-16']">
        <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ pageTitle }}</h2>
        </div>

        <div class="flex items-center gap-4">
            <div class="text-right">
                <p class="text-sm font-medium text-gray-700">{{ authStore.nombreCompleto }}</p>
                <p class="text-xs text-gray-500">{{ authStore.usuario?.roles?.[0]?.rol_nombre }}</p>
            </div>

            <button @click="authStore.logout()"
                class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
                <i class="pi pi-sign-out"></i>
                <span>Salir</span>
            </button>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'

defineProps<{ sidebarOpen: boolean }>()

const authStore = useAuthStore()
const route = useRoute()

const pageTitle = computed(() => {
    return (route.meta.title as string) || 'Dashboard'
})
</script>