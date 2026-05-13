<template>
    <aside
        :class="['fixed top-0 left-0 h-full bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col', sidebarOpen ? 'w-64' : 'w-16']">
        <!-- Logo -->
        <div class="flex items-center h-16 px-4 border-b border-slate-700">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold text-sm">PA</span>
            </div>
            <span v-if="sidebarOpen" class="ml-3 font-semibold text-sm truncate">PUCE-SI</span>
        </div>

        <!-- Menú -->
        <nav class="flex-1 overflow-y-auto py-4">
            <template v-for="menu in menuTree" :key="menu.men_id">
                <!-- Menú sin hijos -->
                <router-link v-if="!menu.children?.length && menu.men_url" :to="menu.men_url"
                    class="flex items-center px-4 py-3 mx-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    active-class="!bg-blue-600 !text-white">
                    <i :class="[menu.men_icono, 'text-lg flex-shrink-0']"></i>
                    <span v-if="sidebarOpen" class="ml-3 text-sm truncate">{{ menu.men_nombre }}</span>
                </router-link>

                <!-- Menú con hijos -->
                <div v-if="menu.children?.length">
                    <button @click="toggleSubmenu(menu.men_id)"
                        class="flex items-center justify-between w-full px-4 py-3 mx-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                        :style="{ width: 'calc(100% - 1rem)' }">
                        <div class="flex items-center">
                            <i :class="[menu.men_icono, 'text-lg flex-shrink-0']"></i>
                            <span v-if="sidebarOpen" class="ml-3 text-sm truncate">{{ menu.men_nombre }}</span>
                        </div>
                        <i v-if="sidebarOpen"
                            :class="['pi text-xs transition-transform', openSubmenus.includes(menu.men_id) ? 'pi-chevron-down' : 'pi-chevron-right']"></i>
                    </button>

                    <div v-if="openSubmenus.includes(menu.men_id) && sidebarOpen" class="ml-4">
                        <router-link v-for="child in menu.children" :key="child.men_id" :to="child.men_url"
                            class="flex items-center px-4 py-2 mx-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition text-sm"
                            active-class="!bg-blue-600/50 !text-white">
                            <i :class="[child.men_icono, 'text-sm flex-shrink-0']"></i>
                            <span class="ml-3 truncate">{{ child.men_nombre }}</span>
                        </router-link>
                    </div>
                </div>
            </template>
        </nav>

        <!-- Botón colapsar -->
        <button @click="$emit('toggle')"
            class="flex items-center justify-center h-12 border-t border-slate-700 text-slate-400 hover:text-white transition">
            <i :class="['pi', sidebarOpen ? 'pi-chevron-left' : 'pi-chevron-right']"></i>
        </button>
    </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth.store'

defineProps<{ sidebarOpen: boolean }>()
defineEmits(['toggle'])

const authStore = useAuthStore()
const openSubmenus = ref<number[]>([])

const menuTree = computed(() => {
    const menus = authStore.usuario?.menus || []
    const padres = menus.filter(m => !m.men_padre_id).sort((a, b) => a.men_orden - b.men_orden)

    return padres.map(padre => ({
        ...padre,
        children: menus
            .filter(m => String(m.men_padre_id) === String(padre.men_id))
            .sort((a, b) => a.men_orden - b.men_orden),
    }))
})

function toggleSubmenu(menuId: number) {
    const index = openSubmenus.value.indexOf(menuId)
    if (index > -1) {
        openSubmenus.value.splice(index, 1)
    } else {
        openSubmenus.value.push(menuId)
    }
}
</script>