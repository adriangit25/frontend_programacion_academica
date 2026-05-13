<template>
    <div class="min-h-screen bg-gray-100">
        <AppSidebar :sidebar-open="sidebarOpen" @toggle="sidebarOpen = !sidebarOpen" />
        <AppNavbar :sidebar-open="sidebarOpen" />

        <main :class="['pt-16 min-h-screen transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-16']">
            <div class="p-6">
                <router-view />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'

const sidebarOpen = ref(true)
</script>